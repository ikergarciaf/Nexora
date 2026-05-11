import { Router } from 'express';
import prisma from '../db.ts';
import { requireAuth } from '../middlewares/auth.ts';
import logger from '../services/logger.ts';

export const importRouter = Router();

importRouter.use(requireAuth);

importRouter.post('/patients', async (req, res) => {
  try {
    const { patients } = req.body;
    const tenantId = req.user!.tenantId;

    if (!Array.isArray(patients) || patients.length === 0) {
      return res.status(400).json({ error: 'Must provide an array of patients' });
    }

    const valid = patients.filter(p => p.fullName);
    const skipped = patients.length - valid.length;
    const errors: string[] = [];
    if (skipped > 0) errors.push(`${skipped} pacientes sin nombre omitidos`);

    const result = await prisma.patient.createMany({
      data: valid.map(p => ({
        tenantId,
        fullName: p.fullName,
        email: p.email || null,
        phone: p.phone || null,
        dob: p.dob ? new Date(p.dob) : null,
        medicalHistoryNotes: p.notes || null,
        tags: p.tags ? JSON.stringify(p.tags) : '["imported"]',
      })),
      skipDuplicates: true,
    });

    logger.info({ tenantId, created: result.count, skipped }, 'CSV import completed');

    res.json({
      success: true,
      created: result.count,
      skipped,
      total: patients.length,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    logger.error({ error }, 'Import failed');
    res.status(500).json({ error: 'Import failed' });
  }
});
