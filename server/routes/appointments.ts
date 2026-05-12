import { Router } from 'express';
import prisma from '../db.ts';
import { requireAuth, getTenantId } from '../middlewares/auth.ts';
import logger from '../services/logger.ts';
import { sendEmail } from '../services/emailService.ts';
import { validate, appointmentSchema, appointmentUpdateSchema } from '../validation.ts';

export const appointmentRouter = Router();

appointmentRouter.use(requireAuth);

appointmentRouter.get('/', async (req, res) => {
  try {
    let tenantId: string;
    try { tenantId = getTenantId(req); } catch {
      return res.status(400).json({ error: 'No tenant context' });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const status = req.query.status as string | undefined;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;

    const where: any = { tenantId };
    if (status) where.status = status;
    if (from || to) {
      where.startTime = {};
      if (from) where.startTime.gte = new Date(from);
      if (to) where.startTime.lte = new Date(to);
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: { select: { id: true, fullName: true, phone: true, email: true } },
          treatment: { select: { id: true, name: true, duration: true, price: true } },
        },
        orderBy: { startTime: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    res.json({ data: appointments, total, page, limit });
  } catch (error) {
    logger.error({ error }, 'Failed to fetch appointments');
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

appointmentRouter.post('/', validate(appointmentSchema), async (req, res) => {
  try {
    let tenantId: string;
    try { tenantId = getTenantId(req); } catch {
      return res.status(400).json({ error: 'No tenant context' });
    }

    const { patientId, doctorId, startTime, durationMinutes } = req.body;
    const start = new Date(startTime);
    const end = new Date(start.getTime() + (durationMinutes || 30) * 60000);

    const conflict = await prisma.appointment.findFirst({
      where: {
        tenantId,
        startTime: { lt: end },
        endTime: { gt: start },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
    });

    const createData: any = {
      tenantId,
      patientId,
      startTime: start,
      endTime: end,
      status: 'SCHEDULED',
      aiConflictScore: conflict ? 0.8 : undefined,
      aiAlertReason: conflict ? 'Posible conflicto de horario detectado' : undefined,
    };
    if (doctorId) createData.doctorId = doctorId;

    const newAppointment = await prisma.appointment.create({
      data: createData,
      include: {
        patient: { select: { fullName: true, email: true } },
      },
    });

    const nA: any = newAppointment;
    if (nA.patient?.email) {
      sendEmail({
        to: nA.patient.email,
        subject: 'Cita confirmada — Nexora',
        text: `Hola ${nA.patient.fullName},\n\nTu cita ha sido confirmada para el ${start.toLocaleDateString('es-ES')} a las ${start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.\n\n— Nexora`,
        html: `<p>Hola <strong>${nA.patient.fullName}</strong>,</p><p>Tu cita ha sido confirmada para el <strong>${start.toLocaleDateString('es-ES')}</strong> a las <strong>${start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</strong>.</p><p>— Nexora</p>`,
      }).catch(err => logger.error({ error: err }, 'Failed to send confirmation email'));
    }

    res.status(201).json(newAppointment);
  } catch (error: any) {
    logger.error({ error }, 'Failed to create appointment');
    res.status(500).json({ error: 'Failed to create appointment.' });
  }
});

appointmentRouter.put('/:id', validate(appointmentUpdateSchema), async (req, res) => {
  try {
    let tenantId: string;
    try { tenantId = getTenantId(req); } catch {
      return res.status(400).json({ error: 'No tenant context' });
    }

    const { id } = req.params;
    const { patientId, doctorId, startTime, durationMinutes, status } = req.body;

    const dataToUpdate: Record<string, any> = {};
    if (patientId) dataToUpdate.patientId = patientId;
    if (doctorId !== undefined) dataToUpdate.doctorId = doctorId;
    if (status) dataToUpdate.status = status;
    if (startTime) {
      const start = new Date(startTime);
      dataToUpdate.startTime = start;
      dataToUpdate.endTime = new Date(start.getTime() + (durationMinutes || 30) * 60000);
    }

    const updated = await prisma.appointment.update({
      where: { id_tenantId: { id, tenantId } },
      data: dataToUpdate,
    });

    res.json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Appointment not found.' });
    }
    logger.error({ error }, 'Failed to update appointment');
    res.status(500).json({ error: 'Failed to update appointment.' });
  }
});

appointmentRouter.delete('/:id', async (req, res) => {
  try {
    let tenantId: string;
    try { tenantId = getTenantId(req); } catch {
      return res.status(400).json({ error: 'No tenant context' });
    }

    const { id } = req.params;
    await prisma.appointment.delete({
      where: { id_tenantId: { id, tenantId } },
    });
    res.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Appointment not found.' });
    }
    logger.error({ error }, 'Failed to delete appointment');
    res.status(500).json({ error: 'Failed to delete appointment.' });
  }
});
