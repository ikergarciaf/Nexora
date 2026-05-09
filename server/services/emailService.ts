import nodemailer from 'nodemailer';
import logger from './logger.ts';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    logger.warn('SMTP not configured. Emails will be logged to console only.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  const from = process.env.SMTP_FROM || 'noreply@nexora.com';
  const t = getTransporter();

  if (!t) {
    logger.info({ to: options.to, subject: options.subject }, 'Email logged (SMTP not configured)');
    return true;
  }

  try {
    await t.sendMail({ from, to: options.to, subject: options.subject, text: options.text, html: options.html });
    logger.info({ to: options.to, subject: options.subject }, 'Email sent');
    return true;
  } catch (err) {
    logger.error({ error: err, to: options.to }, 'Email failed to send');
    return false;
  }
}
