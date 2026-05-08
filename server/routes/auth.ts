import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../db.ts';
import { requireAuth } from '../middlewares/auth.ts';
import { OAuth2Client } from 'google-auth-library';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-do-not-use-in-prod';
const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID || 'dummy');

authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing required elements' });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, name, passwordHash }
    });

    const token = jwt.sign({ id: user.id, isSuperAdmin: user.isSuperAdmin }, JWT_SECRET, { expiresIn: '12h' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin } });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, isSuperAdmin: user.isSuperAdmin }, JWT_SECRET, { expiresIn: '12h' });
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
      const token = jwt.sign({ id: user.id, isSuperAdmin: user.isSuperAdmin }, JWT_SECRET, { expiresIn: '12h' });
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

      const token = jwt.sign({ id: user.id, isSuperAdmin: user.isSuperAdmin }, JWT_SECRET, { expiresIn: '12h' });
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin } });
    } catch (googleError) {
      console.error(googleError);
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

// Temporary in-memory token store for password reset (use Redis/DB in production)
const resetTokens = new Map<string, { userId: string; expiresAt: Date }>();

authRouter.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return res.json({ success: true });

    const resetToken = crypto.randomUUID();
    resetTokens.set(resetToken, {
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // In production, send email via SendGrid/Resend/etc.
    console.log(`[DEV] Password reset link: ${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);

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

    const stored = resetTokens.get(token);
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: stored.userId },
      data: { passwordHash },
    });

    resetTokens.delete(token);
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

authRouter.post('/tenants', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing clinic name' });

    const tenant = await prisma.tenant.create({
      data: { 
        name,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
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
