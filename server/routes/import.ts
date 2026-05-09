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

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const p of patients) {
      if (!p.fullName) {
        errors.push(`Skipped: missing fullName`);
        skipped++;
        continue;
      }

      try {
        await prisma.patient.create({
          data: {
            tenantId,
            fullName: p.fullName,
            email: p.email || null,
            phone: p.phone || null,
            dob: p.dob ? new Date(p.dob) : null,
            medicalHistoryNotes: p.notes || null,
            tags: p.tags ? JSON.stringify(p.tags) : '["imported"]',
          },
        });
        created++;
      } catch (err: any) {
        errors.push(`${p.fullName}: ${err.message}`);
        skipped++;
      }
    }

    logger.info({ tenantId, created, skipped }, 'CSV import completed');

    res.json({
      success: true,
      created,
      skipped,
      total: patients.length,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    logger.error({ error }, 'Import failed');
    res.status(500).json({ error: 'Import failed' });
  }
});
