import { Router } from 'express';
import prisma from '../db.ts';
import logger from '../services/logger.ts';
import { requireAuth } from '../middlewares/auth.ts';
import { validate, tenantConfigSchema } from '../validation.ts';

const router = Router();

router.use(requireAuth);

router.get('/config', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string);
    if (!tenantId) return res.status(401).json({ error: 'Missing tenant id' });

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true, name: true, slug: true, address: true, ownerName: true,
        specialty: true, description: true, themeColor: true, logoUrl: true,
        contactPhone: true, contactEmail: true, publicBookingEnabled: true,
        appointmentInterval: true, locale: true, subscriptionPlan: true,
        subscriptionStatus: true, trialEndsAt: true,
      },
    });

    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    res.json({
      name: tenant.name,
      slug: tenant.slug || tenant.id,
      address: tenant.address || '',
      owner: tenant.ownerName || '',
      specialty: tenant.specialty || 'Fisioterapia',
      description: tenant.description || '',
      themeColor: tenant.themeColor || '#008477',
      logoUrl: tenant.logoUrl || '',
      contactPhone: tenant.contactPhone || '',
      contactEmail: tenant.contactEmail || '',
      aiEnabled: true,
      autoSummaries: false,
      publicBookingEnabled: tenant.publicBookingEnabled,
      appointmentInterval: tenant.appointmentInterval,
      locale: tenant.locale || 'es',
      plan: tenant.subscriptionPlan,
      subscriptionStatus: tenant.subscriptionStatus,
      trialEndsAt: tenant.trialEndsAt,
    });
  } catch (err) {
    logger.error({ error: err }, 'Failed to fetch tenant config');
    res.status(500).json({ error: 'Internal error' });
  }
});

router.post('/config', validate(tenantConfigSchema), async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string);
    if (!tenantId) return res.status(401).json({ error: 'Missing tenant id' });

    const {
      name, slug, address, owner, specialty, description,
      themeColor, logoUrl, contactPhone, contactEmail,
      publicBookingEnabled, appointmentInterval, locale,
    } = req.body;

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(address !== undefined && { address }),
        ...(owner !== undefined && { ownerName: owner }),
        ...(specialty !== undefined && { specialty }),
        ...(description !== undefined && { description }),
        ...(themeColor !== undefined && { themeColor }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(publicBookingEnabled !== undefined && { publicBookingEnabled }),
        ...(appointmentInterval !== undefined && { appointmentInterval }),
        ...(locale !== undefined && { locale }),
      },
    });

    res.json({ success: true, tenant: updated });
  } catch (err) {
    logger.error({ error: err }, 'Failed to update tenant config');
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

export const tenantRouter = router;
