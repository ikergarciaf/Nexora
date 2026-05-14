import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../db.ts';
import { requireAuth, requireRefreshAuth, generateTokens, generateCsrfToken } from '../middlewares/auth.ts';
import { sendEmail } from '../services/emailService.ts';
import logger from '../services/logger.ts';
import { OAuth2Client } from 'google-auth-library';
import {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  demoRegisterSchema,
  createTenantSchema,
} from '../validation.ts';

export const authRouter = Router();

const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID || 'dummy');

authRouter.get('/csrf', (_req, res) => {
  const token = generateCsrfToken();
  res.cookie('nexora_csrf', token, {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000,
  });
  res.json({ csrfToken: token });
});

function sanitize(str: string): string {
  return str.replace(/[<>&"'\\]/g, '').trim();
}

function safeUser(user: { id: string; email: string; name: string; isSuperAdmin: boolean }) {
  return { id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin };
}

authRouter.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = sanitize(email).toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) return res.status(409).json({ error: 'Este email ya está registrado' });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: sanitize(name),
        passwordHash,
        isActive: true,
      },
    });

    sendEmail({
      to: user.email,
      subject: 'Bienvenido a Nexora',
      text: `Hola ${user.name},\n\nGracias por registrarte en Nexora. Tu cuenta ha sido creada correctamente.\n\nYa puedes iniciar sesión y configurar tu clínica.\n\n— Nexora`,
      html: `<p>Hola <strong>${user.name}</strong>,</p><p>Gracias por registrarte en <strong>Nexora</strong>.</p><p>Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión y configurar tu clínica.</p><p>— Nexora</p>`,
    }).catch(err => logger.error({ error: err }, 'Failed to send welcome email'));

    const tokens = generateTokens({ id: user.id, isSuperAdmin: user.isSuperAdmin });

    res.status(201).json({
      ...tokens,
      user: safeUser(user),
    });
  } catch (error) {
    logger.error({ error }, 'Registration error');
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

authRouter.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = sanitize(email).toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user || !user.isActive || !user.passwordHash) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = generateTokens({ id: user.id, isSuperAdmin: user.isSuperAdmin });

    res.json({
      ...tokens,
      user: safeUser(user),
    });
  } catch (error) {
    logger.error({ error }, 'Login error');
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

authRouter.post('/refresh', requireRefreshAuth, async (req, res) => {
  try {
    const tokens = generateTokens({ id: req.user!.id, isSuperAdmin: req.user!.isSuperAdmin });
    res.json(tokens);
  } catch (error) {
    logger.error({ error }, 'Token refresh error');
    res.status(500).json({ error: 'Error al renovar token' });
  }
});

authRouter.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Credencial de Google requerida' });

    try {
      const ticket = await googleClient.verifyIdToken({ idToken: credential });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) return res.status(400).json({ error: 'Token de Google inválido' });

      let user = await prisma.user.findUnique({ where: { email: payload.email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: payload.email,
            name: payload.name || 'Google User',
            googleId: payload.sub,
            isActive: true,
          },
        });
      } else if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: payload.sub },
        });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: 'Cuenta desactivada' });
      }

      const tokens = generateTokens({ id: user.id, isSuperAdmin: user.isSuperAdmin });
      res.json({ ...tokens, user: safeUser(user) });
    } catch (googleError) {
      logger.warn({ error: googleError }, 'Google OAuth verification failed');
      return res.status(401).json({ error: 'Verificación de Google fallida' });
    }
  } catch (error) {
    logger.error({ error }, 'Google auth error');
    res.status(500).json({ error: 'Error al autenticar con Google' });
  }
});

authRouter.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, isSuperAdmin: true, isActive: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    logger.error({ error }, 'Get me error');
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

authRouter.post('/forgot-password', validate(forgotPasswordSchema), async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email: sanitize(email).toLowerCase() } });

    if (!user) {
      return res.json({ success: true });
    }

    const resetToken = crypto.randomUUID();
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: hashedToken, resetTokenExpiresAt: expiresAt },
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
    logger.error({ error }, 'Forgot password error');
    res.status(500).json({ error: 'Error al procesar solicitud' });
  }
});

authRouter.post('/reset-password', validate(resetPasswordSchema), async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiresAt: { gt: new Date() },
      },
    });
    if (!user) return res.status(400).json({ error: 'Token inválido o expirado' });

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Reset password error');
    res.status(500).json({ error: 'Error al restablecer contraseña' });
  }
});

authRouter.get('/tenants', requireAuth, async (req, res) => {
  try {
    const user = req.user!;
    if (user.isSuperAdmin) {
      const allTenants = await prisma.tenant.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, slug: true, specialty: true, subscriptionStatus: true, subscriptionPlan: true, createdAt: true },
      });
      res.json(allTenants);
    } else {
      const memberships = await prisma.tenantUser.findMany({
        where: { userId: user.id },
        include: {
          tenant: {
            select: { id: true, name: true, slug: true, specialty: true, subscriptionStatus: true, subscriptionPlan: true, createdAt: true },
          },
        },
      });
      res.json(memberships.map(m => m.tenant));
    }
  } catch (error) {
    logger.error({ error }, 'Get tenants error');
    res.status(500).json({ error: 'Error al obtener clínicas' });
  }
});

authRouter.post('/demo-register', validate(demoRegisterSchema), async (req, res) => {
  try {
    const { name, email, phone, clinicType, clinicName, password } = req.body;
    const cleanEmail = sanitize(email).toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) return res.status(409).json({ error: 'El email ya está registrado' });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email: cleanEmail, name: sanitize(name), passwordHash, isActive: true },
    });

    const slug = clinicName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + crypto.randomUUID().slice(0, 6);

    const tenant = await prisma.tenant.create({
      data: {
        name: sanitize(clinicName),
        slug,
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
    }).catch(err => logger.error({ error: err }, 'Failed to send demo welcome email'));

    const tokens = generateTokens({ id: user.id, isSuperAdmin: user.isSuperAdmin });

    res.status(201).json({
      ...tokens,
      user: safeUser(user),
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug, specialty: tenant.specialty },
    });
  } catch (error) {
    logger.error({ error }, 'Demo registration error');
    res.status(500).json({ error: 'Error al crear la cuenta demo' });
  }
});

authRouter.post('/tenants', requireAuth, validate(createTenantSchema), async (req, res) => {
  try {
    const { name, specialty } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + crypto.randomUUID().slice(0, 6);

    const tenant = await prisma.tenant.create({
      data: {
        name: sanitize(name),
        slug,
        specialty: specialty || 'Fisioterapia',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.tenantUser.create({
      data: {
        userId: req.user!.id,
        tenantId: tenant.id,
        role: 'OWNER',
      },
    });

    res.status(201).json(tenant);
  } catch (error) {
    logger.error({ error }, 'Create tenant error');
    res.status(500).json({ error: 'Error al crear clínica' });
  }
});
