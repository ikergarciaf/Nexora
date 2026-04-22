import { Router } from 'express';
import prisma from '../db.ts';
import { requireAuth, requireRole } from '../middlewares/auth.ts';

export const patientRouter = Router();

// Apply authentication and tenant injection to all patient routes
patientRouter.use(requireAuth);

patientRouter.get('/', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) throw new Error('No DB URL configured');
    
    // STRICT TENANT ISOLATION
    const patients = await prisma.patient.findMany({ 
      where: { tenantId: req.user!.tenantId },
      take: 50,
      orderBy: { fullName: 'asc' }
    });
    
    res.json(patients);
  } catch (error: any) {
    console.warn("[DB Warning] Falling back to mocks. Reason:", error.message);
    res.json([
      { id: 'p1', fullName: 'Sarah Jenkins', email: 'sarah@example.com', tags: '["high-retention"]' },
      { id: 'p2', fullName: 'Michael Chen', email: 'mchen@example.com', tags: '["no-show-risk"]' },
      { id: 'p3', fullName: 'Robert Downey Jr.', email: 'rdj@example.com', tags: '["premium"]' }
    ]);
  }
});

patientRouter.post('/', async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const tenantId = req.user!.tenantId;

    if (!fullName) return res.status(400).json({ error: "Full Name is required" });

    // Fallback if DB is not configured in environment
    if (!process.env.DATABASE_URL) {
      return res.status(201).json({ 
        id: `mock_p_${Date.now()}`, 
        fullName, 
        email, 
        phone, 
        tags: '["new"]' 
      });
    }

    // Auto-bootstrap the tenant for the demo environment if it doesn't exist yet
    await prisma.tenant.upsert({
      where: { id: tenantId },
      update: {},
      create: { id: tenantId, name: 'Acme Clinic' }
    });

    const newPatient = await prisma.patient.create({
      data: {
        tenantId,
        fullName,
        email,
        phone,
        tags: '["new"]'
      }
    });

    res.status(201).json(newPatient);
  } catch (error: any) {
    console.error("[Patient Create Error]", error);
    res.status(500).json({ error: "Failed to create patient record in database." });
  }
});

// Example of Role-Based Route Protection (RBAC)
// ONLY users carrying an 'ADMIN' role in their JWT can delete a patient.
patientRouter.delete('/:id', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!process.env.DATABASE_URL) {
      return res.status(200).json({ success: true, message: "Mock delete successful" });
    }

    // Security: Ensure we are only deleting a patient belonging to THIS specific tenant
    // Even if an Admin tries to delete an ID from another tenant, Prisma won't find it here.
    const deleted = await prisma.patient.deleteMany({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: "Patient not found or unauthorized." });
    }

    res.json({ success: true, message: "Patient safely deleted" });
  } catch (error) {
    console.error("[Patient Delete Error]", error);
    res.status(500).json({ error: "Failed to delete patient." });
  }
});

