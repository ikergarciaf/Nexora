import { Router } from 'express';
import prisma from '../db.ts';
import { requireAuth } from '../middlewares/auth.ts';

export const portalRouter = Router();

// In-memory mock storage handling for portals
const mockPortals = [
  {
    patientId: 'm1',
    portalToken: 'portal-token-m1-xyz',
    patientInfo: {
      fullName: 'Adrián Sánchez',
      email: 'adrian@example.com',
      lastVisit: '2023-10-15',
    },
    appointments: [
      { id: '1', date: '2023-10-20', time: '10:00', type: 'Limpieza', status: 'COMPLETED' },
      { id: '2', date: '2024-05-18', time: '12:00', type: 'Revisión', status: 'SCHEDULED' }
    ],
    invoices: [
      { id: 'inv1', date: '2023-10-20', amount: 80, status: 'PAID' }
    ]
  }
];

portalRouter.get('/access/:token', async (req, res) => {
  const { token } = req.params;

  try {
    if (process.env.DATABASE_URL) {
      // Find patient by portal token
      const patient = await prisma.patient.findUnique({
        where: { portalToken: token },
        include: {
          appointments: {
            orderBy: { startTime: 'desc' },
            take: 10
          },
          invoices: {
            orderBy: { issuedDate: 'desc' },
            take: 10
          }
        }
      });

      if (!patient) {
        return res.status(404).json({ error: 'El enlace del portal no es válido o ha expirado.' });
      }

      return res.json({
        patientInfo: {
          fullName: patient.fullName,
          email: patient.email,
          lastVisit: patient.lastVisit,
        },
        appointments: patient.appointments.map(a => ({
          id: a.id,
          date: a.startTime.toISOString().split('T')[0],
          time: a.startTime.toISOString().split('T')[1].substring(0, 5),
          type: a.internalNotes || 'Consulta',
          status: a.status
        })),
        invoices: patient.invoices.map(i => ({
          id: i.id,
          date: i.issuedDate.toISOString().split('T')[0],
          amount: i.amount,
          status: i.status
        }))
      });
    }

    // Mock fallback
    const mockData = mockPortals.find(p => p.portalToken === token);
    if (mockData) {
      return res.json({
        patientInfo: mockData.patientInfo,
        appointments: mockData.appointments,
        invoices: mockData.invoices
      });
    } else {
      // Create dynamic mock for preview environments
      return res.json({
        patientInfo: {
          fullName: 'Paciente de Prueba',
          email: 'prueba@nexora.app',
          lastVisit: '2024-01-01',
        },
        appointments: [
          { id: '1', date: new Date().toISOString().split('T')[0], time: '10:00', type: 'Primera visita', status: 'COMPLETED' }
        ],
        invoices: [
          { id: 'inv1', date: new Date().toISOString().split('T')[0], amount: 50, status: 'PAID' }
        ]
      });
    }

  } catch (error) {
    console.error('Portal Error:', error);
    res.status(500).json({ error: 'Error interno del servidor al cargar el portal.' });
  }
});

// Endpoint to generate portal Link (needs Auth)
portalRouter.post('/generate/:patientId', requireAuth, async (req, res) => {
  const { patientId } = req.params;
  const newToken = 'portal-' + Math.random().toString(36).substring(2, 15);

  try {
    if (process.env.DATABASE_URL) {
      // Basic generation
      const patient = await prisma.patient.update({
        where: { id: patientId },
        data: { portalToken: newToken }
      });
      return res.json({ token: newToken });
    }

    // Mock fallback: if it's 'm1', we can return the mock token to let them test the UI
    if (patientId === 'm1') {
      return res.json({ token: 'portal-token-m1-xyz' });
    }

    return res.json({ token: newToken });

  } catch (error) {
    console.error('Generate Portal Error:', error);
    res.status(500).json({ error: 'No se pudo generar el enlace del portal.' });
  }
});
