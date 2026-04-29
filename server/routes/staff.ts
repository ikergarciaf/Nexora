import { Router } from 'express';
import prisma from '../db.ts';
import { requireAuth } from '../middlewares/auth.ts';

export const staffRouter = Router();

staffRouter.use(requireAuth);

let mockRooms = [
  { id: 'room-1', name: 'Consulta 1' },
  { id: 'room-2', name: 'Consulta 2' },
  { id: 'room-3', name: 'Quirófano A' }
];

let mockUsers = [
  { id: 'doc-1', name: 'Dr. Alejandro Muñoz', role: 'DOCTOR' },
  { id: 'doc-2', name: 'Dra. Sofía Reyes', role: 'DOCTOR' },
  { id: 'nurse-1', name: 'Laura Martínez', role: 'NURSE' }
];

let mockShifts = [
  {
    id: 's-1',
    userId: 'doc-1',
    roomId: 'room-1',
    startTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
    type: 'WORK'
  },
  {
    id: 's-2',
    userId: 'doc-2',
    roomId: null,
    startTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(0, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 5)).setHours(23, 59, 59, 999)).toISOString(),
    type: 'VACATION'
  }
];

staffRouter.get('/users', async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      const tenantUsers = await prisma.tenantUser.findMany({
        where: { tenantId: req.user!.tenantId },
        include: { user: true }
      });
      const users = tenantUsers.map(tu => ({
        id: tu.user.id,
        name: tu.user.name,
        role: tu.role
      }));
      if (users.length > 0) return res.json(users);
    }
    return res.json(mockUsers);
  } catch (err) {
    res.json(mockUsers);
  }
});

staffRouter.get('/rooms', async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      const rooms = await prisma.room.findMany({
        where: { tenantId: req.user!.tenantId },
        orderBy: { name: 'asc' }
      });
      if (rooms.length > 0) return res.json(rooms);
    }
    return res.json(mockRooms);
  } catch (err) {
    res.json(mockRooms);
  }
});

staffRouter.post('/rooms', async (req, res) => {
  try {
    const { name } = req.body;
    if (process.env.DATABASE_URL) {
      const newRoom = await prisma.room.create({
        data: {
          tenantId: req.user!.tenantId,
          name
        }
      });
      return res.status(201).json(newRoom);
    }

    const newRoomMock = { id: 'room-' + Date.now(), name };
    mockRooms.push(newRoomMock);
    return res.status(201).json(newRoomMock);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

staffRouter.put('/rooms/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (process.env.DATABASE_URL) {
      const updatedRoom = await prisma.room.update({
        where: { id: req.params.id, tenantId: req.user!.tenantId },
        data: { name }
      });
      return res.json(updatedRoom);
    }

    const idx = mockRooms.findIndex(r => r.id === req.params.id);
    if (idx > -1) {
      mockRooms[idx].name = name;
      return res.json(mockRooms[idx]);
    }
    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update room' });
  }
});

staffRouter.delete('/rooms/:id', async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      await prisma.room.delete({
        where: { id: req.params.id, tenantId: req.user!.tenantId }
      });
      return res.json({ success: true });
    }

    mockRooms = mockRooms.filter(r => r.id !== req.params.id);
    return res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

staffRouter.get('/shifts', async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      const shifts = await prisma.shift.findMany({
        where: { tenantId: req.user!.tenantId },
        include: { room: true, user: true }
      });
      if (shifts.length > 0) return res.json(shifts);
    }
    return res.json(mockShifts);
  } catch (err) {
    res.json(mockShifts);
  }
});

staffRouter.post('/shifts', async (req, res) => {
  try {
    const { userId, roomId, startTime, endTime, type, notes } = req.body;

    if (process.env.DATABASE_URL) {
      const newShift = await prisma.shift.create({
        data: {
          tenantId: req.user!.tenantId,
          userId,
          roomId: roomId || null,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          type,
          notes
        },
        include: { room: true, user: true }
      });
      return res.status(201).json(newShift);
    }

    const newMockShift = {
      id: 's-' + Date.now(),
      userId,
      roomId: roomId || null,
      startTime,
      endTime,
      type,
      notes,
    };
    mockShifts.push(newMockShift);
    return res.status(201).json(newMockShift);

  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create shift' });
  }
});

staffRouter.delete('/shifts/:id', async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      await prisma.shift.delete({
        where: { id: req.params.id, tenantId: req.user!.tenantId }
      });
      return res.json({ success: true });
    }

    mockShifts = mockShifts.filter(s => s.id !== req.params.id);
    return res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete shift' });
  }
});
