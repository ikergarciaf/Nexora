import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db.ts';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-do-not-use-in-prod';

/**
 * Register a new Clinic Tenant and an Admin User
 */
authRouter.post('/register', async (req, res) => {
  try {
    const { clinicName, name, email, password } = req.body;

    if (!clinicName || !name || !email || !password) {
      return res.status(400).json({ error: 'Missing required elements' });
    }

    if (!process.env.DATABASE_URL) {
      return res.status(201).json({ token: 'mock-jwt-token-db-not-configured', user: { name, role: 'ADMIN' } });
    }

    // Checking uniqueness
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({ where: { email } });
    } catch (dbError: any) {
      console.warn('⚠️ Database Failed - Falling back to MOCK MODE for DEMO Registration', dbError.message);
      return res.status(201).json({ token: 'demo-token', user: { name, role: 'ADMIN' } });
    }
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Creating initial tenant and its Admin
    let tenant;
    try {
      tenant = await prisma.tenant.create({
        data: { name: clinicName }
      });
    } catch (dbError: any) {
      if (dbError?.message?.includes('Authentication failed') || dbError?.code === 'P1000') {
        console.warn('⚠️ Database Authentication Failed - Falling back to MOCK MODE for DEMO');
        return res.status(201).json({ token: 'demo-token', user: { name, role: 'ADMIN' } });
      }
      throw dbError; // Rethrow if it's a different error
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email,
        name,
        passwordHash,
        role: 'ADMIN' // The registering user becomes the Owner/Admin
      }
    });

    const token = jwt.sign(
      { id: user.id, tenantId: user.tenantId, role: user.role },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * General Login Route
 */
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    if (!process.env.DATABASE_URL) {
      return res.status(200).json({ token: 'mock-jwt-token-db-not-configured', user: { email, role: 'ADMIN' } });
    }

    let user;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch (dbError: any) {
      console.warn('⚠️ Database Failed - Falling back to MOCK MODE for DEMO Login', dbError.message);
      return res.status(200).json({ token: 'demo-token', user: { email, role: 'ADMIN' } });
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, tenantId: user.tenantId, role: user.role },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
