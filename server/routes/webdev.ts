import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.ts';
import prisma from '../db.ts';

const router = Router();
router.use(requireAuth);

router.get('/requests', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const requests = await prisma.webDevelopmentRequest.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

router.post('/requests', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { contactName, contactEmail, contactPhone, projectType, currentWebsite, desiredFeatures, budgetRange, notes } = req.body;
    
    if (!contactName || !contactEmail) {
      return res.status(400).json({ error: 'Contact name and email required' });
    }
    
    const request = await prisma.webDevelopmentRequest.create({
      data: {
        tenantId,
        contactName,
        contactEmail,
        contactPhone,
        projectType: projectType || 'CLINIC_WEB',
        currentWebsite,
        desiredFeatures: desiredFeatures || [],
        budgetRange,
        notes,
        status: 'PENDING',
        priority: 'NORMAL'
      }
    });
    
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create request' });
  }
});

router.get('/pricing', async (req, res) => {
  res.json({
    plans: [
      { id: 'CLINIC_WEB', name: 'Web para Clínica', basePrice: 599, maintenanceMonthly: 49 },
      { id: 'REDESIGN', name: 'Rediseño Web', basePrice: 799, maintenanceMonthly: 49 },
      { id: 'LANDING', name: 'Landing Page', basePrice: 299, maintenanceMonthly: 29 }
    ],
    discounts: { elitePlan: 0.20 }
  });
});

export const webDevRouter = router;
export default router;
