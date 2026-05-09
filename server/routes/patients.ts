import { Router } from 'express';
import prisma from '../db.ts';
import { requireAuth, requireRole } from '../middlewares/auth.ts';
import logger from '../services/logger.ts';

export const patientRouter = Router();

patientRouter.use(requireAuth);

patientRouter.get('/', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({ 
      where: { tenantId: req.user!.tenantId },
      take: 50,
      orderBy: { fullName: 'asc' }
    });
    res.json(patients);
  } catch (error: any) {
    logger.error({ error }, 'Failed to fetch patients');
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

patientRouter.post('/', async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const tenantId = req.user!.tenantId;
    if (!fullName) return res.status(400).json({ error: "Full Name is required" });

    const newPatient = await prisma.patient.create({
      data: { tenantId, fullName, email, phone, tags: '["new"]' }
    });

    res.status(201).json(newPatient);
  } catch (error: any) {
    logger.error({ error }, 'Failed to create patient');
    res.status(500).json({ error: "Failed to create patient record." });
  }
});

patientRouter.delete('/:id', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await prisma.patient.deleteMany({
      where: { id, tenantId: req.user!.tenantId }
    });
    if (deleted.count === 0) return res.status(404).json({ error: "Patient not found." });
    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Failed to delete patient');
    res.status(500).json({ error: "Failed to delete patient." });
  }
});

patientRouter.put('/:id', requireRole(['OWNER', 'STAFF', 'ADMIN', 'SUPERADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, medicalRecord, nutritionalPlan } = req.body;

    const updated = await prisma.patient.update({
      where: { id, tenantId: req.user!.tenantId! },
      data: { fullName, email, phone, medicalRecord: medicalRecord || undefined, nutritionalPlan: nutritionalPlan || undefined }
    });

    res.json(updated);
  } catch (error) {
    logger.error({ error }, 'Failed to update patient');
    res.status(500).json({ error: "Failed to update patient." });
  }
});

patientRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findFirst({
      where: { id, tenantId: req.user!.tenantId! }
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    logger.error({ error }, 'Failed to fetch patient');
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
