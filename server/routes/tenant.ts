import { Router } from 'express';
import prisma from '../db.ts';
import logger from '../services/logger.ts';

const router = Router();

// Get tenant config
router.get('/config', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string);
    if (!tenantId) return res.status(401).json({ error: 'Missing tenant id' });

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    
    // Config values mapping for Dashboard
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
      locale: tenant.locale || 'es',
      plan: tenant.subscriptionPlan
    });
  } catch (err) {
    logger.error({ error: err }, 'Failed to fetch tenant config');
    res.status(500).json({ error: 'Internal error' });
  }
});

// Update tenant config
router.post('/config', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string);
    if (!tenantId) return res.status(401).json({ error: 'Missing tenant id' });

    const { 
      name, slug, address, owner, specialty, description, themeColor, logoUrl, contactPhone, contactEmail, publicBookingEnabled, locale 
    } = req.body;

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: { 
        name, 
        slug,
        address,
        ownerName: owner,
        specialty,
        description,
        themeColor,
        logoUrl,
        contactPhone,
        contactEmail,
        publicBookingEnabled,
        locale
      }
    });

    res.json({ success: true, tenant: updated });
  } catch (err) {
    logger.error({ error: err }, 'Failed to update tenant config');
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

export const tenantRouter = router;
