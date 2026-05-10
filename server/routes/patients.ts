import { Router } from 'express';
import prisma from '../db.ts';
import { requireAuth, requireRole } from '../middlewares/auth.ts';
import logger from '../services/logger.ts';

export const patientRouter = Router();

patientRouter.use(requireAuth);

function isValidJSON(str: string): boolean {
  try { JSON.parse(str); return true; } catch { return false; }
}

patientRouter.get('/', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string || '').trim();

    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { fullName: 'asc' },
      }),
      prisma.patient.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error: any) {
    logger.error({ error }, 'Failed to fetch patients');
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

patientRouter.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, medicalRecord, nutritionalPlan } = req.body;
    const tenantId = req.user!.tenantId;
    if (!fullName) return res.status(400).json({ error: "Full Name is required" });
    if (medicalRecord && !isValidJSON(medicalRecord)) return res.status(400).json({ error: 'medicalRecord must be valid JSON' });
    if (nutritionalPlan && !isValidJSON(nutritionalPlan)) return res.status(400).json({ error: 'nutritionalPlan must be valid JSON' });

    const newPatient = await prisma.patient.create({
      data: { tenantId, fullName, email, phone, tags: '["new"]', medicalRecord: medicalRecord || undefined, nutritionalPlan: nutritionalPlan || undefined }
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

    if (medicalRecord && !isValidJSON(medicalRecord)) return res.status(400).json({ error: 'medicalRecord must be valid JSON' });
    if (nutritionalPlan && !isValidJSON(nutritionalPlan)) return res.status(400).json({ error: 'nutritionalPlan must be valid JSON' });

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
