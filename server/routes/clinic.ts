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
        openingHours: true as any,
      }
    });

    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });

    let openingHours = [];
    try {
      openingHours = typeof clinic.openingHours === 'string'
        ? JSON.parse(clinic.openingHours as string)
        : (clinic.openingHours as any) || [];
    } catch { openingHours = []; }

    res.json({
      ...clinic,
      openingHours,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clinic' });
  }
});
