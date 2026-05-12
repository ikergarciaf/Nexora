import { Router } from 'express';
import prisma from '../db.ts';
import { requireAuth, getTenantId } from '../middlewares/auth.ts';
import logger from '../services/logger.ts';

export const treatmentRouter = Router();

treatmentRouter.use(requireAuth);

treatmentRouter.get('/', async (req, res) => {
  try {
    const treatments = await prisma.treatment.findMany({
      where: { tenantId: getTenantId(req) },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true, category: true, duration: true, price: true, tenantId: true },
    });
    res.json(treatments);
  } catch (error: any) {
    logger.error({ error }, 'Failed to fetch treatments');
    res.status(500).json({ error: 'Failed to fetch treatments' });
  }
});

treatmentRouter.post('/', async (req, res) => {
  try {
    const { name, description, category, duration, price } = req.body;
    const tenantId = getTenantId(req);
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const treatment = await prisma.treatment.create({
      data: { tenantId, name, description, category: category || 'General', duration: duration || 30, price: price || 0 },
    });

    res.status(201).json(treatment);
  } catch (error: any) {
    logger.error({ error }, 'Failed to create treatment');
    res.status(500).json({ error: 'Failed to create treatment' });
  }
});

treatmentRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, duration, price } = req.body;

    const updated = await prisma.treatment.update({
      where: { id, tenantId: req.user!.tenantId! },
      data: { name, description, category, duration, price },
    });

    res.json(updated);
  } catch (error) {
    logger.error({ error }, 'Failed to update treatment');
    res.status(500).json({ error: 'Failed to update treatment' });
  }
});

treatmentRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.treatment.delete({
      where: { id, tenantId: getTenantId(req) },
    });
    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Failed to delete treatment');
    res.status(500).json({ error: 'Failed to delete treatment' });
  }
});
