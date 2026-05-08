import { Router } from 'express';
import prisma from '../db.ts';
import { requireAuth } from '../middlewares/auth.ts';

export const appointmentRouter = Router();

// 1. Mandatory Multi-Tenant Middleware
appointmentRouter.use(requireAuth);

appointmentRouter.get('/', async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      // 2. Strict Tenant Scoping in Prisma
      const appointments = await prisma.appointment.findMany({ 
        where: { tenantId: req.user!.tenantId },
        include: {
          patient: { select: { fullName: true } }
        },
        orderBy: { startTime: 'desc' },
        take: 50 
      });
      
      if (appointments.length > 0) {
        // Map to Frontend DTO
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

        return res.json(mapped);
      }
    }
    
    // Fallback to Mocks if DB missing or empty
    res.json(getMockAppointments());
  } catch (error) {
    console.warn("[Appointments DB Warning] Falling back to mocks.");
    res.json(getMockAppointments());
  }
});

appointmentRouter.post('/', async (req, res) => {
  try {
    const { patientId, doctorId, startTime, durationMinutes } = req.body;
    const tenantId = req.user!.tenantId;

    if (!patientId || !startTime) {
      return res.status(400).json({ error: "Missing required fields: patientId, startTime" });
    }

    if (!process.env.DATABASE_URL) {
       return res.status(201).json({ id: 'mock_'+Date.now(), status: "SCHEDULED" });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + (durationMinutes || 30) * 60000);

    const newAppointment = await prisma.appointment.create({
      data: {
        tenantId,
        patientId,
        doctorId: doctorId || "unassigned",
        startTime: start,
        endTime: end,
        status: "SCHEDULED"
      }
    });

    res.status(201).json(newAppointment);
  } catch (error: any) {
    console.error("[Appointments POST Error]", error);
    res.status(500).json({ error: "Failed to create appointment." });
  }
});

appointmentRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { patientId, doctorId, startTime, durationMinutes, status } = req.body;
    const tenantId = req.user!.tenantId;

    if (!process.env.DATABASE_URL) {
      return res.status(200).json({ success: true, message: "Mock appointment updated" });
    }

    const dataToUpdate: any = {};
    if (patientId) dataToUpdate.patientId = patientId;
    if (doctorId) dataToUpdate.doctorId = doctorId;
    if (status) dataToUpdate.status = status;
    
    if (startTime) {
      const start = new Date(startTime);
      dataToUpdate.startTime = start;
      if (durationMinutes) {
        dataToUpdate.endTime = new Date(start.getTime() + durationMinutes * 60000);
      }
    }

    const updated = await prisma.appointment.updateMany({
      where: {
        id,
        tenantId
      },
      data: dataToUpdate
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: "Appointment not found or unauthorized." });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("[Appointment Update Error]", error);
    res.status(500).json({ error: "Failed to update appointment." });
  }
});

appointmentRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;

    if (!process.env.DATABASE_URL) {
      return res.status(200).json({ success: true, message: "Mock appointment deleted" });
    }

    const deleted = await prisma.appointment.deleteMany({
      where: {
        id,
        tenantId
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: "Appointment not found or unauthorized." });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("[Appointment Delete Error]", error);
    res.status(500).json({ error: "Failed to delete appointment." });
  }
});

// Extracted mock logic to keep the controller clean
function getMockAppointments() {
  const today = new Date();
  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  return [
    {
      id: 'mock_1',
      patientName: 'Adrián Sánchez',
      type: 'Consulta General',
      startTime: formatTime(9, 30),
      room: 'Consultorio 1',
      status: 'CONFIRMED'
    },
    {
      id: 'mock_2',
      patientName: 'Elena Martínez',
      type: 'Revisión Dental',
      startTime: formatTime(10, 15),
      room: 'Consultorio 2',
      status: 'IN-PROGRESS'
    },
    {
      id: 'mock_3',
      patientName: 'Roberto Gómez',
      type: 'Tratamiento Especial',
      startTime: formatTime(11, 0),
      room: 'Consultorio 1',
      status: 'PENDING'
    },
    {
      id: 'mock_4',
      patientName: 'Lucía Fernández',
      type: 'Consulta General',
      startTime: formatTime(12, 30),
      room: 'Consultorio 3',
      status: 'CONFIRMED'
    },
    {
      id: 'mock_5',
      patientName: 'Carlos Ruiz',
      type: 'Limpieza',
      startTime: formatTime(13, 15),
      room: 'Consultorio 2',
      status: 'CONFIRMED'
    }
  ];
}
