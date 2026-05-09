import { Router } from 'express';
import prisma from '../db.ts';

export const clinicRouter = Router();

// Public clinic info for clinic website and WhatsApp Demo
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
        themeColor: true,
        logoUrl: true,
        description: true,
        address: true,
        contactPhone: true,
        contactEmail: true,
      }
    });

    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });

    res.json(clinic);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clinic' });
  }
});
