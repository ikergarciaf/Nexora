import prisma from '../db.ts';
import logger from './logger.ts';
import { sendEmail } from './emailService.ts';

export async function sendAppointmentReminders(): Promise<number> {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const appointments = await prisma.appointment.findMany({
    where: {
      startTime: { gte: now, lte: tomorrow },
      status: 'SCHEDULED',
      patient: { email: { not: null } },
    },
    include: {
      patient: { select: { fullName: true, email: true, phone: true } },
      tenant: { select: { name: true, contactPhone: true } },
    },
  });

  const BATCH_SIZE = 5;
  let sent = 0;

  for (let i = 0; i < appointments.length; i += BATCH_SIZE) {
    const batch = appointments.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(batch.map(async (apt) => {
      let count = 0;
      const startStr = apt.startTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
      const timeStr = apt.startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

      if (apt.patient.email) {
        const ok = await sendEmail({
          to: apt.patient.email,
          subject: `Recordatorio: tienes una cita en ${apt.tenant.name}`,
          text: `Hola ${apt.patient.fullName},\n\nTe recordamos que tienes una cita el ${startStr} a las ${timeStr}.\n\nSi necesitas cancelar o reprogramar, contacta con la clínica.\n\n— ${apt.tenant.name}`,
          html: `<p>Hola <strong>${apt.patient.fullName}</strong>,</p><p>Te recordamos que tienes una cita el <strong>${startStr}</strong> a las <strong>${timeStr}</strong>.</p><p>Si necesitas cancelar o reprogramar, contacta con la clínica.</p><p>— ${apt.tenant.name}</p>`,
        });
        if (ok) count++;
      }
      if (apt.patient.phone) {
        const message = `Hola ${apt.patient.fullName}, te recordamos tu cita en ${apt.tenant.name} el ${startStr} a las ${timeStr}. Si necesitas cancelar, contacta con la clínica.`;
        const whatsappOk = await sendWhatsAppReminder(apt.patient.phone, message);
        if (whatsappOk) count++;
      }
      return count;
    }));
    sent += results.reduce((sum, r) => sum + (r.status === 'fulfilled' ? r.value : 0), 0);
  }

  return sent;
}

export async function sendWhatsAppReminder(phone: string, message: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !from) {
    logger.warn({ phone }, 'WhatsApp not configured, skipping reminder');
    return false;
  }

  try {
    const twilio = await import('twilio');
    const client = twilio.default(accountSid, authToken);
    await client.messages.create({
      from: `whatsapp:${from}`,
      to: `whatsapp:${phone}`,
      body: message,
    });
    logger.info({ phone }, 'WhatsApp reminder sent');
    return true;
  } catch (err) {
    logger.error({ error: err, phone }, 'Failed to send WhatsApp reminder');
    return false;
  }
}
