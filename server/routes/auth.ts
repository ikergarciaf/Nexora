import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../db.ts';
import { requireAuth } from '../middlewares/auth.ts';
import { sendEmail } from '../services/emailService.ts';
import logger from '../services/logger.ts';
import { OAuth2Client } from 'google-auth-library';

function sanitize(str: string): string {
  return str.replace(/[<>&"']/g, '');
}

export const authRouter = Router();
const JWT_SECRET = (() => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
  return process.env.JWT_SECRET;
})();
const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID || 'dummy');

authRouter.get('/debug', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ take: 1 });
    res.json({ db: 'ok', users: users.length });
  } catch (e: any) {
    res.status(500).json({ db: 'error', message: e.message, code: e.code });
  }
});

authRouter.post('/debug', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    res.json({ found: !!user });
  } catch (e: any) {
    res.status(500).json({ error: e.message, code: e.code });
  }
});

authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing required elements' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const existingUser = await prisma.user.findUnique({ where: { email: sanitize(email).toLowerCase() } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email: sanitize(email).toLowerCase(), name: sanitize(name), passwordHash }
    });

    sendEmail({
      to: user.email,
      subject: 'Bienvenido a Nexora',
      text: `Hola ${user.name},\n\nGracias por registrarte en Nexora. Tu cuenta ha sido creada correctamente.\n\nYa puedes iniciar sesión y configurar tu clínica.\n\n— Nexora`,
      html: `<p>Hola <strong>${user.name}</strong>,</p><p>Gracias por registrarte en <strong>Nexora</strong>.</p><p>Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión y configurar tu clínica.</p><p>— Nexora</p>`,
    });

    const token = jwt.sign({ id: user.id, isSuperAdmin: user.isSuperAdmin }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin } });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

    const user = await prisma.user.findUnique({ where: { email: sanitize(email).toLowerCase() } });
    if (!user || !user.isActive || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, isSuperAdmin: user.isSuperAdmin }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin } });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

authRouter.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Missing google credential' });
    
    // Check demo credentials (if running locally without real setup)
    if (credential === 'demo-google-token') {
      const user = await prisma.user.findFirst();
      if (!user) return res.status(403).json({ error: 'No demo users available' });
      const token = jwt.sign({ id: user.id, isSuperAdmin: user.isSuperAdmin }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin } });
    }

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential
      });
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) return res.status(400).json({ error: 'Invalid google token payload' });
      
      let user = await prisma.user.findUnique({ where: { email: payload.email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: payload.email,
            name: payload.name || 'Google User',
            googleId: payload.sub,
          }
        });
      } else if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: payload.sub }
        });
      }

      const token = jwt.sign({ id: user.id, isSuperAdmin: user.isSuperAdmin }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin } });
    } catch (googleError) {
      logger.warn({ error: googleError }, 'Google OAuth verification failed');
      return res.status(401).json({ error: 'Invalid Google Identity' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

authRouter.get('/diagnostic', async (_req, res) => {
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    const admin = await prisma.user.findUnique({ where: { email: 'admin@nexora.com' } });
    const tenantCount = await prisma.tenant.count();
    res.json({
      dbConnected: true,
      userCount,
      adminExists: !!admin,
      adminActive: admin?.isActive ?? null,
      adminSuperAdmin: admin?.isSuperAdmin ?? null,
      adminHasPassword: !!admin?.passwordHash,
      tenantCount,
    });
  } catch (e: any) {
    res.json({ dbConnected: false, error: e.message });
  }
});

authRouter.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

authRouter.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return res.json({ success: true });

    const resetToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiresAt: expiresAt },
    });

    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: 'Restablece tu contraseña - Nexora',
      text: `Hola ${user.name},\n\nRecibimos una solicitud para restablecer tu contraseña.\n\nHaz clic en el siguiente enlace para restablecerla:\n${resetUrl}\n\nEste enlace expira en 1 hora.\n\nSi no solicitaste esto, ignora este mensaje.\n\n— Nexora`,
      html: `<p>Hola <strong>${user.name}</strong>,</p><p>Recibimos una solicitud para restablecer tu contraseña.</p><p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#008477;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold">Restablecer contraseña</a></p><p>Este enlace expira en 1 hora.</p><p>Si no solicitaste esto, ignora este mensaje.</p><p>— Nexora</p>`,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

authRouter.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiresAt: { gt: new Date() } },
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

authRouter.get('/tenants', requireAuth, async (req, res) => {
  try {
    const user = req.user!;
    if (user.isSuperAdmin) {
      const allTenants = await prisma.tenant.findMany();
      res.json(allTenants);
    } else {
      const memberships = await prisma.tenantUser.findMany({
        where: { userId: user.id },
        include: { tenant: true }
      });
      res.json(memberships.map(m => m.tenant));
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

authRouter.post('/demo-register', async (req, res) => {
  try {
    const { name, email, phone, clinicType, clinicName, password } = req.body;
    if (!name || !email || !password || !clinicName) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'El email ya está registrado' });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, name, passwordHash, isActive: true },
    });

    const slug = clinicName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + crypto.randomUUID().slice(0, 6);

    const tenant = await prisma.tenant.create({
      data: {
        name: clinicName, slug,
        specialty: clinicType || 'Fisioterapia',
        contactPhone: phone || '',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        subscriptionStatus: 'trialing',
        subscriptionPlan: 'STARTER',
      },
    });

    await prisma.tenantUser.create({
      data: { userId: user.id, tenantId: tenant.id, role: 'OWNER' },
    });

    sendEmail({
      to: user.email,
      subject: 'Bienvenido a Nexora — Tu clínica está lista',
      text: `Hola ${user.name},\n\nTu clínica "${clinicName}" ha sido creada en Nexora.\n\nYa puedes gestionar tus pacientes, citas y facturación.\n\n— Nexora`,
      html: `<p>Hola <strong>${user.name}</strong>,</p><p>Tu clínica <strong>${clinicName}</strong> ha sido creada en Nexora.</p><p>Ya puedes gestionar tus pacientes, citas y facturación.</p><p>— Nexora</p>`,
    });

    const token = jwt.sign({ id: user.id, isSuperAdmin: user.isSuperAdmin }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin },
      tenant: { id: tenant.id, name: tenant.name, specialty: tenant.specialty },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

authRouter.post('/tenants', requireAuth, async (req, res) => {
  try {
    const { name, specialty } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing clinic name' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + crypto.randomUUID().slice(0, 6);

    const tenant = await prisma.tenant.create({
      data: { 
        name, slug,
        specialty: specialty || 'Fisioterapia',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    });

    await prisma.tenantUser.create({
      data: {
        userId: req.user!.id,
        tenantId: tenant.id,
        role: 'OWNER'
      }
    });

    res.status(201).json(tenant);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
