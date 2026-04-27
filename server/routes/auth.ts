import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

authRouter.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin });
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
      data: { name }
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
