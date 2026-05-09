import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db.ts';
import { requireAuth } from '../middlewares/auth.ts';
import logger from '../services/logger.ts';

export const gdprRouter = Router();

gdprRouter.use(requireAuth);

gdprRouter.post('/export', async (req, res) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, isActive: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const memberships = await prisma.tenantUser.findMany({
      where: { userId },
      include: {
        tenant: {
          select: { id: true, name: true, specialty: true, createdAt: true },
        },
      },
    });

    const allData = { user, memberships };
    logger.info({ userId }, 'User exported their data');

    res.json(allData);
  } catch (error) {
    logger.error({ error }, 'Export failed');
    res.status(500).json({ error: 'Export failed' });
  }
});

gdprRouter.post('/delete', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { password } = req.body;

    if (!password) return res.status(400).json({ error: 'Password is required to delete account' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.passwordHash) {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(403).json({ error: 'Invalid password' });
    }

    await prisma.$transaction(async (tx) => {
      const memberships = await tx.tenantUser.findMany({ where: { userId }, select: { tenantId: true } });
      const tenantIds = memberships.map(m => m.tenantId);

      for (const tenantId of tenantIds) {
        const userPatients = await tx.patient.findMany({
          where: { tenantId, appointments: { some: { doctorId: userId } } },
          select: { id: true },
        });
        const patientIds = userPatients.map(p => p.id);

        await tx.consent.deleteMany({ where: { patientId: { in: patientIds }, tenantId } });
        await tx.invoice.deleteMany({ where: { patientId: { in: patientIds }, tenantId } });
        await tx.appointment.deleteMany({ where: { doctorId: userId, tenantId } });
      }

      await tx.shift.deleteMany({ where: { userId } });
      await tx.tenantUser.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    logger.info({ userId }, 'User deleted their account');
    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Account deletion failed');
    res.status(500).json({ error: 'Account deletion failed' });
  }
});
