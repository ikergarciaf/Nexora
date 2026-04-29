import { Router } from 'express';
import prisma from '../db.ts';

export const clinicRouter = Router();

// Minimal public info for WhatsApp Demo or Landing pages
clinicRouter.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const clinic = await prisma.tenant.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        specialty: true,
        themeColor: true
      }
    });

    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    res.json(clinic);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clinic' });
  }
});
