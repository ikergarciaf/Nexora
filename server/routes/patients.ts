import { Router } from 'express';
import prisma from '../db.ts';
import { requireAuth, requireRole, getTenantId } from '../middlewares/auth.ts';
import logger from '../services/logger.ts';
import { validate, patientSchema, patientUpdateSchema } from '../validation.ts';

export const patientRouter = Router();

patientRouter.use(requireAuth);

patientRouter.get('/', async (req, res) => {
  try {
    let tenantId: string;
    try { tenantId = getTenantId(req); } catch { return res.status(400).json({ error: 'No tenant context' }); }
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
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { fullName: 'asc' },
        select: {
          id: true, fullName: true, email: true, phone: true,
          dob: true, tags: true, lastVisit: true, createdAt: true, tenantId: true,
          _count: { select: { appointments: true, invoices: true } },
        },
      }),
      prisma.patient.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error: any) {
    logger.error({ error }, 'Failed to fetch patients');
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

patientRouter.post('/', validate(patientSchema), async (req, res) => {
  try {
    let tenantId: string;
    try { tenantId = getTenantId(req); } catch { return res.status(400).json({ error: 'No tenant context' }); }
    const { fullName, email, phone, medicalRecord, nutritionalPlan } = req.body;

    const newPatient = await prisma.patient.create({
      data: {
        tenantId, fullName,
        email: email || undefined, phone: phone || undefined,
        tags: '["new"]',
        medicalRecord: medicalRecord || undefined,
        nutritionalPlan: nutritionalPlan || undefined,
        createdById: req.user!.id,
      },
    });

    res.status(201).json(newPatient);
  } catch (error: any) {
    logger.error({ error }, 'Failed to create patient');
    res.status(500).json({ error: 'Failed to create patient record.' });
  }
});

patientRouter.put('/:id', requireRole(['OWNER', 'STAFF', 'ADMIN']), validate(patientUpdateSchema), async (req, res) => {
  try {
    let tenantId: string;
    try { tenantId = getTenantId(req); } catch { return res.status(400).json({ error: 'No tenant context' }); }
    const { id } = req.params;
    const { fullName, email, phone, medicalRecord, nutritionalPlan } = req.body;

    const updated = await prisma.patient.update({
      where: { id_tenantId: { id, tenantId } },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(medicalRecord !== undefined && { medicalRecord }),
        ...(nutritionalPlan !== undefined && { nutritionalPlan }),
      },
    });
    res.json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Patient not found' });
    logger.error({ error }, 'Failed to update patient');
    res.status(500).json({ error: 'Failed to update patient.' });
  }
});

patientRouter.delete('/:id', requireRole(['ADMIN', 'OWNER']), async (req, res) => {
  try {
    let tenantId: string;
    try { tenantId = getTenantId(req); } catch { return res.status(400).json({ error: 'No tenant context' }); }
    const { id } = req.params;
    await prisma.patient.delete({ where: { id_tenantId: { id, tenantId } } });
    res.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Patient not found' });
    logger.error({ error }, 'Failed to delete patient');
    res.status(500).json({ error: 'Failed to delete patient.' });
  }
});

patientRouter.get('/:id', async (req, res) => {
  try {
    let tenantId: string;
    try { tenantId = getTenantId(req); } catch { return res.status(400).json({ error: 'No tenant context' }); }
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { id_tenantId: { id, tenantId } },
      include: { _count: { select: { appointments: true, invoices: true, documents: true, consents: true } } },
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    logger.error({ error }, 'Failed to fetch patient');
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
