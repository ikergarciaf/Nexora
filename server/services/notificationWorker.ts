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

  let sent = 0;
  for (const apt of appointments) {
    const email = apt.patient.email;
    const phone = apt.patient.phone;

    const startStr = apt.startTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeStr = apt.startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: `Recordatorio: tienes una cita en ${apt.tenant.name}`,
          text: `Hola ${apt.patient.fullName},\n\nTe recordamos que tienes una cita el ${startStr} a las ${timeStr}.\n\nSi necesitas cancelar o reprogramar, contacta con la clínica.\n\n— ${apt.tenant.name}`,
          html: `<p>Hola <strong>${apt.patient.fullName}</strong>,</p><p>Te recordamos que tienes una cita el <strong>${startStr}</strong> a las <strong>${timeStr}</strong>.</p><p>Si necesitas cancelar o reprogramar, contacta con la clínica.</p><p>— ${apt.tenant.name}</p>`,
        });
        sent++;
        logger.info({ appointmentId: apt.id, email }, 'Appointment reminder sent');
      } catch (err) {
        logger.error({ error: err, appointmentId: apt.id }, 'Failed to send email reminder');
      }
    }

    if (phone) {
      const message = `Hola ${apt.patient.fullName}, te recordamos tu cita en ${apt.tenant.name} el ${startStr} a las ${timeStr}. Si necesitas cancelar, contacta con la clínica.`;
      const whatsappSent = await sendWhatsAppReminder(phone, message);
      if (whatsappSent) sent++;
    }
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
