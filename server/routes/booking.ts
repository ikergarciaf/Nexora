import { Router } from 'express';
import prisma from '../db.ts';

export const bookingRouter = Router();

// Mock data fallback for services
const mockServices = [
  { id: 'serv-1', name: 'Primera Visita / Evaluación', duration: 30, price: 0 },
  { id: 'serv-2', name: 'Higiene Dental Completa', duration: 45, price: 60 },
  { id: 'serv-3', name: 'Blanqueamiento Láser', duration: 60, price: 250 },
];

bookingRouter.get('/:tenantId/services', async (req, res) => {
  // In a real database scenario, we would fetch the tenant's actual services
  res.json(mockServices);
});

bookingRouter.post('/:tenantId/appointments', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { patientName, email, phone, serviceId, date, time } = req.body;

    if (!patientName || !date || !time) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (process.env.DATABASE_URL) {
      // Find or create the patient for this tenant
      let patient = await prisma.patient.findFirst({
        where: { tenantId, OR: [{ email: email || 'NONE' }, { fullName: patientName }] }
      });
      
      if (!patient) {
         patient = await prisma.patient.create({
            data: { 
                tenantId, 
                fullName: patientName, 
                email: email || null, 
                phone: phone || null 
            }
         });
      }

      await prisma.appointment.create({
        data: {
          tenantId,
          patientId: patient.id,
          startTime: new Date(`${date}T${time}:00.000Z`),
          endTime: new Date(new Date(`${date}T${time}:00.000Z`).getTime() + 30 * 60000), // Default 30 min duration
          type: serviceId || 'General',
          status: 'PENDING'
        }
      });
      return res.status(201).json({ success: true });
    }

    // Mock fallback response
    return res.status(201).json({ success: true, message: 'Mock appointment created successfully' });
  } catch (err) {
    console.error('Error creating public appointment:', err);
    res.status(500).json({ error: 'Internal server error while booking' });
  }
});
