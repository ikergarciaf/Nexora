import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get tenant config
router.get('/config', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
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
      plan: tenant.subscriptionPlan
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
});

// Update tenant config
router.post('/config', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) return res.status(401).json({ error: 'Missing tenant id' });

    const { 
      name, slug, address, owner, specialty, description, themeColor, logoUrl, contactPhone, contactEmail 
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
        contactEmail
      }
    });

    res.json({ success: true, tenant: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

export const tenantRouter = router;
