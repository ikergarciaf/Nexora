import { Router } from 'express';
import prisma from '../db.ts';
import { requireAuth } from '../middlewares/auth.ts';
import logger from '../services/logger.ts';
import { sendEmail } from '../services/emailService.ts';

export const appointmentRouter = Router();

appointmentRouter.use(requireAuth);

appointmentRouter.get('/', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
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
        include: { patient: { select: { fullName: true } } },
        orderBy: { startTime: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    const mapped = appointments.map(apt => ({
      id: apt.id,
      patientName: apt.patient?.fullName || "Desconocido",
      type: "Servicio General",
      date: new Date(apt.startTime).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      startTime: new Date(apt.startTime).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}),
      room: "Consultorio 1",
      status: apt.status,
      aiAlert: apt.aiConflictScore ? apt.aiConflictScore > 0.5 : false,
      aiScore: apt.aiConflictScore
    }));

    res.json({ data: mapped, total, page, limit });
  } catch (error) {
    logger.error({ error }, 'Failed to fetch appointments');
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

appointmentRouter.post('/', async (req, res) => {
  try {
    const { patientId, doctorId, startTime, durationMinutes } = req.body;
    const tenantId = req.user!.tenantId;
    if (!patientId || !startTime) return res.status(400).json({ error: "Missing required fields: patientId, startTime" });

    const start = new Date(startTime);
    const end = new Date(start.getTime() + (durationMinutes || 30) * 60000);

    const newAppointment = await prisma.appointment.create({
      data: { tenantId, patientId, doctorId: doctorId || "unassigned", startTime: start, endTime: end, status: "SCHEDULED" }
    });

    const patient = await prisma.patient.findUnique({ where: { id: patientId, tenantId }, select: { fullName: true, email: true } });
    if (patient?.email) {
      sendEmail({
        to: patient.email,
        subject: 'Cita confirmada — Nexora',
        text: `Hola ${patient.fullName},\n\nTu cita ha sido confirmada para el ${start.toLocaleDateString('es-ES')} a las ${start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.\n\n— Nexora`,
        html: `<p>Hola <strong>${patient.fullName}</strong>,</p><p>Tu cita ha sido confirmada para el <strong>${start.toLocaleDateString('es-ES')}</strong> a las <strong>${start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</strong>.</p><p>— Nexora</p>`,
      });
    }

    res.status(201).json(newAppointment);
  } catch (error: any) {
    logger.error({ error }, 'Failed to create appointment');
    res.status(500).json({ error: "Failed to create appointment." });
  }
});

appointmentRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { patientId, doctorId, startTime, durationMinutes, status } = req.body;
    const tenantId = req.user!.tenantId;

    const dataToUpdate: any = {};
    if (patientId) dataToUpdate.patientId = patientId;
    if (doctorId) dataToUpdate.doctorId = doctorId;
    if (status) dataToUpdate.status = status;
    if (startTime) {
      const start = new Date(startTime);
      dataToUpdate.startTime = start;
      if (durationMinutes) dataToUpdate.endTime = new Date(start.getTime() + durationMinutes * 60000);
    }

    const updated = await prisma.appointment.updateMany({ where: { id, tenantId }, data: dataToUpdate });
    if (updated.count === 0) return res.status(404).json({ error: "Appointment not found." });
    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Failed to update appointment');
    res.status(500).json({ error: "Failed to update appointment." });
  }
});

appointmentRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await prisma.appointment.deleteMany({ where: { id, tenantId: req.user!.tenantId } });
    if (deleted.count === 0) return res.status(404).json({ error: "Appointment not found." });
    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Failed to delete appointment');
    res.status(500).json({ error: "Failed to delete appointment." });
  }
});
