import { Router } from 'express';
import prisma from '../db.ts';
import { requireAuth, requireRole } from '../middlewares/auth.ts';

export const patientRouter = Router();

// In-memory mock storage for local testing when no DB is connected
let mockPatients: any[] = [];

// Apply authentication and tenant injection to all patient routes
patientRouter.use(requireAuth);

patientRouter.get('/', async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      // STRICT TENANT ISOLATION
      const patients = await prisma.patient.findMany({ 
        where: { tenantId: req.user!.tenantId },
        take: 50,
        orderBy: { fullName: 'asc' }
      });
      
      if (patients.length > 0) {
        return res.json(patients);
      }
    }
    
    // Fallback if DB empty or missing
    if (mockPatients.length === 0) {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 7, 10); // Around 7 months ago
      mockPatients = [
        { id: 'm1', fullName: 'Adrián Sánchez', email: 'adrian@example.com', phone: '600111222', tags: '["regular"]', lastVisit: new Date().toISOString() },
        { id: 'm2', fullName: 'Elena Martínez', email: 'elena@example.com', phone: '600333444', tags: '["vip"]', lastVisit: new Date().toISOString() },
        { id: 'm3', fullName: 'Marta Gómez', email: 'marta@example.com', phone: '600555666', tags: '["new"]', lastVisit: sixMonthsAgo.toISOString() }
      ];
    }
    res.json(mockPatients);
  } catch (error: any) {
    console.warn("[Patients DB Warning] Falling back to mocks.");
    res.json(mockPatients);
  }
});

patientRouter.post('/', async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const tenantId = req.user!.tenantId;

    if (!fullName) return res.status(400).json({ error: "Full Name is required" });

    // Fallback if DB is not configured in environment
    if (!process.env.DATABASE_URL) {
      const newMockPatient = { 
        id: `mock_p_${Date.now()}`, 
        fullName, 
        email: email || '', 
        phone: phone || '', 
        tags: '["new"]' 
      };
      mockPatients.push(newMockPatient);
      return res.status(201).json(newMockPatient);
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
      mockPatients = mockPatients.filter(p => p.id !== id);
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

// Update patient
patientRouter.put('/:id', requireRole(['OWNER', 'STAFF', 'ADMIN', 'SUPERADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, medicalRecord, exercises, nutritionalPlan } = req.body;
    
    if (!process.env.DATABASE_URL) {
      const idx = mockPatients.findIndex(p => p.id === id);
      if (idx !== -1) {
        mockPatients[idx] = { ...mockPatients[idx], fullName, email, phone, medicalRecord, exercises, nutritionalPlan };
        return res.json(mockPatients[idx]);
      }
      return res.status(404).json({ error: "Mock patient not found" });
    }

    const updated = await prisma.patient.update({
      where: {
        id,
        tenantId: req.user!.tenantId!
      },
      data: {
        fullName,
        email,
        phone,
        medicalRecord: medicalRecord || undefined,
        exercises: exercises || undefined,
        nutritionalPlan: nutritionalPlan || undefined
      }
    });

    res.json(updated);
  } catch (error) {
    console.error("[Patient Update Error]", error);
    res.status(500).json({ error: "Failed to update patient." });
  }
});

patientRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId!;

    if (!process.env.DATABASE_URL) {
      const patient = mockPatients.find(p => p.id === id);
      if (patient) return res.json(patient);
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patient = await prisma.patient.findFirst({
      where: { id, tenantId }
    });

    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

