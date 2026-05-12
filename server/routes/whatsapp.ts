import { Router } from 'express';
import prisma from '../db.ts';
import logger from '../services/logger.ts';

const router = Router();

// This simulates a webhook that WhatsApp would hit when a user sends a message
router.post('/webhook', async (req, res) => {
  try {
    const { fromPhone, message: _message, clinicSlug } = req.body;

    const clinic = await prisma.tenant.findFirst({
      where: { 
        OR: [
          { slug: clinicSlug },
          { id: clinicSlug }
        ]
      }
    });

    if (!clinic) {
      return res.json({ reply: 'Clínica no encontrada.' });
    }

    // Find patient by phone
    const patient = await prisma.patient.findFirst({
      where: { 
        tenantId: clinic.id,
        phone: {
          contains: fromPhone.replace(/\D/g, '').slice(-9) // match last 9 digits
        }
      },
      include: {
        appointments: {
          where: {
            startTime: { gte: new Date() }
          },
          orderBy: { startTime: 'asc' },
          take: 3
        }
      }
    });

    if (!patient) {
      return res.json({ reply: `Hola! No te encuentro en la base de datos de ${clinic.name}. Por favor, regístrate primero o llámanos directamente.` });
    }

    // Context for AI
    const now = new Date();
    const patientContext = `
    Clínica: ${clinic.name}
    Especialidad: ${clinic.specialty}
    Paciente: ${patient.fullName}
    Fecha actual: ${now.toLocaleString('es-ES')}
    Citas futuras: ${patient.appointments.length > 0 ? patient.appointments.map(a => `${a.type} el ${a.startTime.toLocaleString()}`).join(', ') : 'Ninguna'}
    `;

    // Return context for the frontend to process with AI
    res.json({ 
      patientContext,
      patientId: patient.id,
      clinicId: clinic.id
    });

  } catch (error) {
    logger.error({ error }, 'WhatsApp context error');
    res.status(500).json({ error: 'Failed' });
  }
});

// New endpoint to actually create the booking after AI confirmation on frontend
router.post('/book-from-chat', async (req, res) => {
  try {
    const { clinicId, patientId, date, description } = req.body;
    
    if (!clinicId || !patientId || !date) {
      return res.status(400).json({ error: 'Missing data' });
    }

    const requestedDate = new Date(date);
    const endTime = new Date(requestedDate.getTime() + 30 * 60000);

    const appointment = await prisma.appointment.create({
      data: {
        tenantId: clinicId,
        patientId: patientId,
        startTime: requestedDate,
        endTime: endTime,
        type: description || 'Visita por WhatsApp',
        status: 'SCHEDULED'
      }
    });

    res.json({ success: true, appointment });
  } catch (error) {
    logger.error({ error }, 'Booking from chat error');
    res.status(500).json({ error: 'Failed' });
  }
});

export const whatsappRouter = router;
