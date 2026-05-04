import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.ts';
import prisma from '../db.ts';

const router = Router();
router.use(requireAuth);

// Enviar SMS manualmente
router.post('/send', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { patientId, phoneNumber, message, type = 'CUSTOM' } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Phone number and message required' });
    }
    
    // Crear registro en base de datos
    const sms = await prisma.sMSNotification.create({
      data: {
        tenantId,
        patientId,
        phoneNumber,
        message,
        type,
        status: 'PENDING',
        provider: 'twilio'
      }
    });
    
    // Aquí se integraría el envío real vía Twilio
    // Por ahora simulamos el envío
    console.log(`[SMS] Enviando a ${phoneNumber}: ${message}`);
    
    res.json({ success: true, sms });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// Obtener historial de SMS
router.get('/history', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const history = await prisma.sMSNotification.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SMS history' });
  }
});

// Configurar preferencias de SMS para un paciente
router.put('/prefs/:patientId', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { patientId } = req.params;
    const { smsEnabled, appointmentReminders, confirmations, cancellations } = req.body;
    
    const prefs = await prisma.patientNotificationPrefs.upsert({
      where: { patientId },
      update: {
        smsEnabled,
        appointmentReminders,
        confirmations,
        cancellations
      },
      create: {
        patientId,
        smsEnabled: smsEnabled ?? true,
        appointmentReminders: appointmentReminders ?? true,
        confirmations: confirmations ?? true,
        cancellations: cancellations ?? true
      }
    });
    
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

export const smsRouter = router;
export default router;
