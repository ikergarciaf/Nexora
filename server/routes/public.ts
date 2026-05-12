import { Router } from 'express';
import prisma from '../db.ts';
import logger from '../services/logger.ts';
import { sendEmail } from '../services/emailService.ts';
import { sendAppointmentReminders } from '../services/notificationWorker.ts';
import { validate, publicBookingSchema } from '../validation.ts';

export const publicRouter = Router();

function getSlotsForDay(
  dayStart: Date,
  dayEnd: Date,
  appointments: { startTime: Date; endTime: Date }[],
  duration: number,
): string[] {
  const slots: string[] = [];
  const now = new Date();
  let cursor = new Date(dayStart);
  while (cursor < dayEnd) {
    if (cursor <= now) {
      cursor = new Date(cursor.getTime() + duration * 60000);
      continue;
    }
    const slotEnd = new Date(cursor.getTime() + duration * 60000);
    const conflicted = appointments.some(a => cursor < a.endTime && slotEnd > a.startTime);
    if (!conflicted) slots.push(cursor.toISOString());
    cursor = slotEnd;
  }
  return slots;
}

publicRouter.get('/:slug/slots', async (req, res) => {
  try {
    const { slug } = req.params;
    const { date } = req.query;

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true, name: true, specialty: true, contactEmail: true,
        contactPhone: true, logoUrl: true, address: true, publicBookingEnabled: true,
        appointmentInterval: true,
      },
    });
    if (!tenant) return res.status(404).json({ error: 'Clínica no encontrada' });
    if (!tenant.publicBookingEnabled) return res.status(403).json({ error: 'Reserva online no disponible' });

    let targetDate: Date;
    if (typeof date === 'string') targetDate = new Date(date);
    else targetDate = new Date();

    const dayStart = new Date(targetDate);
    dayStart.setHours(9, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(20, 0, 0, 0);

    if (dayStart < new Date()) dayStart.setTime(Date.now() + 3600000);

    const appointments = await prisma.appointment.findMany({
      where: {
        tenantId: tenant.id,
        startTime: { gte: dayStart, lt: dayEnd },
        status: { not: 'CANCELLED' },
      },
      select: { startTime: true, endTime: true },
    });

    const staff = await prisma.user.findMany({
      where: { memberships: { some: { tenantId: tenant.id } }, isActive: true },
      select: { id: true, name: true },
    });

    const interval = tenant.appointmentInterval || 30;

    res.json({
      clinic: {
        name: tenant.name,
        specialty: tenant.specialty,
        contactEmail: tenant.contactEmail,
        contactPhone: tenant.contactPhone,
        logoUrl: tenant.logoUrl,
        address: tenant.address,
      },
      staff,
      slots: getSlotsForDay(dayStart, dayEnd, appointments, interval),
    });
  } catch (error) {
    logger.error({ error }, 'Public slots error');
    res.status(500).json({ error: 'Error al obtener horarios' });
  }
});

publicRouter.post('/:slug/book', validate(publicBookingSchema), async (req, res) => {
  try {
    const { slug } = req.params;
    const { startTime, fullName, email, phone } = req.body;

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, publicBookingEnabled: true, appointmentInterval: true },
    });
    if (!tenant) return res.status(404).json({ error: 'Clínica no encontrada' });
    if (!tenant.publicBookingEnabled) return res.status(403).json({ error: 'Reserva online no disponible' });

    const start = new Date(startTime);
    const interval = tenant.appointmentInterval || 30;
    const end = new Date(start.getTime() + interval * 60000);

    const conflict = await prisma.appointment.findFirst({
      where: {
        tenantId: tenant.id,
        startTime: { lt: end },
        endTime: { gt: start },
        status: { not: 'CANCELLED' },
      },
    });
    if (conflict) return res.status(409).json({ error: 'Ese horario ya no está disponible' });

    let patient = await prisma.patient.findFirst({
      where: { tenantId: tenant.id, email: email || '' },
    });
    if (!patient) {
      patient = await prisma.patient.create({
        data: { tenantId: tenant.id, fullName, email, phone, tags: '["booking_online"]' },
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        tenantId: tenant.id,
        patientId: patient.id,
        startTime: start,
        endTime: end,
        status: 'SCHEDULED',
      },
    });

    if (email) {
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const portalLink = `${appUrl}/portal/${slug}/${patient.id}`;
      sendEmail({
        to: email,
        subject: 'Cita confirmada — Nexora',
        text: `Hola ${fullName},\n\nTu cita ha sido confirmada para el ${start.toLocaleDateString('es-ES')} a las ${start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.\n\nGestiona tus citas aquí: ${portalLink}\n\n— Nexora`,
        html: `<p>Hola <strong>${fullName}</strong>,</p><p>Tu cita ha sido confirmada para el <strong>${start.toLocaleDateString('es-ES')}</strong> a las <strong>${start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</strong>.</p><p>Gestiona tus citas: <a href="${portalLink}">${portalLink}</a></p><p>— Nexora</p>`,
      }).catch(err => logger.error({ error: err }, 'Failed to send booking confirmation email'));
    }

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    logger.error({ error }, 'Public booking error');
    res.status(500).json({ error: 'Error al reservar cita' });
  }
});

publicRouter.get('/:slug/portal/:patientId', async (req, res) => {
  try {
    const { slug, patientId } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });
    if (!tenant) return res.status(404).json({ error: 'Clínica no encontrada' });

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, tenantId: tenant.id },
      select: { id: true, fullName: true, email: true, phone: true },
    });
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' });

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        patientId,
        tenantId: tenant.id,
        startTime: { gte: new Date() },
        status: { not: 'CANCELLED' },
      },
      orderBy: { startTime: 'asc' },
      select: { id: true, startTime: true, endTime: true, status: true, type: true },
    });

    const pastAppointments = await prisma.appointment.findMany({
      where: { patientId, tenantId: tenant.id, startTime: { lt: new Date() } },
      orderBy: { startTime: 'desc' },
      take: 10,
      select: { id: true, startTime: true, endTime: true, status: true, type: true },
    });

    res.json({ clinicName: tenant.name, patient, upcomingAppointments, pastAppointments });
  } catch (error) {
    logger.error({ error }, 'Patient portal error');
    res.status(500).json({ error: 'Error al cargar portal' });
  }
});

publicRouter.post('/cron/reminders', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.CRON_API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const sent = await sendAppointmentReminders();
    res.json({ success: true, remindersSent: sent });
  } catch (error) {
    logger.error({ error }, 'Cron reminders error');
    res.status(500).json({ error: 'Worker failed' });
  }
});

publicRouter.post('/:slug/portal/:patientId/cancel', async (req, res) => {
  try {
    const { slug, patientId } = req.params;
    const { appointmentId } = req.body;

    const tenant = await prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
    if (!tenant) return res.status(404).json({ error: 'Clínica no encontrada' });

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, patientId, tenantId: tenant.id },
    });
    if (!appointment) return res.status(404).json({ error: 'Cita no encontrada' });

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
    });
    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Patient cancel error');
    res.status(500).json({ error: 'Error al cancelar cita' });
  }
});
