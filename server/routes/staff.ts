import { Router } from 'express';
import prisma from '../db.ts';
import { requireAuth, getTenantId } from '../middlewares/auth.ts';
import logger from '../services/logger.ts';

export const staffRouter = Router();

staffRouter.use(requireAuth);

staffRouter.get('/users', async (req, res) => {
  try {
    const tenantUsers = await prisma.tenantUser.findMany({
      where: { tenantId: getTenantId(req) },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    const users = (tenantUsers as any[]).map((tu: any) => ({
      id: tu.user.id,
      name: tu.user.name,
      email: tu.user.email,
      role: tu.role,
    }));
    res.json(users);
  } catch (err) {
    logger.error({ error: err }, 'Failed to fetch staff users');
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

staffRouter.get('/rooms', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { tenantId: getTenantId(req) },
      orderBy: { name: 'asc' },
    });
    res.json(rooms);
  } catch (err) {
    logger.error({ error: err }, 'Failed to fetch rooms');
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

staffRouter.post('/rooms', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const newRoom = await prisma.room.create({
      data: { tenantId: getTenantId(req), name },
    });
    res.status(201).json(newRoom);
  } catch (err) {
    logger.error({ error: err }, 'Failed to create room');
    res.status(500).json({ error: 'Failed to create room' });
  }
});

staffRouter.put('/rooms/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const updatedRoom = await prisma.room.update({
      where: { id: req.params.id, tenantId: getTenantId(req) },
      data: { name },
    });
    res.json(updatedRoom);
  } catch (err) {
    logger.error({ error: err }, 'Failed to update room');
    res.status(500).json({ error: 'Failed to update room' });
  }
});

staffRouter.delete('/rooms/:id', async (req, res) => {
  try {
    await prisma.room.delete({
      where: { id: req.params.id, tenantId: getTenantId(req) },
    });
    res.json({ success: true });
  } catch (err) {
    logger.error({ error: err }, 'Failed to delete room');
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

staffRouter.get('/shifts', async (req, res) => {
  try {
    const shifts = await prisma.shift.findMany({
      where: { tenantId: getTenantId(req) },
      include: { room: { select: { id: true, name: true } }, user: { select: { id: true, name: true } } },
      orderBy: { startTime: 'asc' },
    });
    res.json(shifts);
  } catch (err) {
    logger.error({ error: err }, 'Failed to fetch shifts');
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
});

staffRouter.post('/shifts', async (req, res) => {
  try {
    const { userId, roomId, startTime, endTime, type, notes } = req.body;
    if (!userId || !startTime || !endTime) {
      return res.status(400).json({ error: 'userId, startTime, endTime required' });
    }

    const newShift = await prisma.shift.create({
      data: {
        tenantId: getTenantId(req),
        userId,
        roomId: roomId || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        type: type || 'WORK',
        notes,
      },
      include: { room: { select: { id: true, name: true } }, user: { select: { id: true, name: true } } },
    });
    res.status(201).json(newShift);
  } catch (err: any) {
    logger.error({ error: err }, 'Failed to create shift');
    res.status(500).json({ error: 'Failed to create shift' });
  }
});

staffRouter.delete('/shifts/:id', async (req, res) => {
  try {
    await prisma.shift.delete({
      where: { id: req.params.id, tenantId: getTenantId(req) },
    });
    res.json({ success: true });
  } catch (err: any) {
    logger.error({ error: err }, 'Failed to delete shift');
    res.status(500).json({ error: 'Failed to delete shift' });
  }
});
