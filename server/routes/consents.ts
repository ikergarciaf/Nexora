import { Router } from 'express';
import prisma from '../db.ts';
import { requireAuth } from '../middlewares/auth.ts';
import logger from '../services/logger.ts';

export const consentRouter = Router();

consentRouter.use(requireAuth);

consentRouter.get('/', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const patientId = req.query.patientId as string | undefined;

    const where: any = { tenantId };
    if (patientId) where.patientId = patientId;

    const consents = await prisma.consent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { patient: { select: { fullName: true } } },
    });

    res.json(consents);
  } catch (error) {
    logger.error({ error }, 'Failed to fetch consents');
    res.status(500).json({ error: 'Failed to fetch consents' });
  }
});

consentRouter.get('/:id', async (req, res) => {
  try {
    const consent = await prisma.consent.findFirst({
      where: { id: req.params.id, tenantId: req.user!.tenantId },
      include: { patient: { select: { fullName: true } } },
    });
    if (!consent) return res.status(404).json({ error: 'Consent not found' });
    res.json(consent);
  } catch (error) {
    logger.error({ error }, 'Failed to fetch consent');
    res.status(500).json({ error: 'Failed to fetch consent' });
  }
});

consentRouter.post('/', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { patientId, title, content } = req.body;

    if (!patientId || !title || !content) {
      return res.status(400).json({ error: 'patientId, title, and content are required' });
    }

    const consent = await prisma.consent.create({
      data: { tenantId, patientId, title, content },
    });

    res.status(201).json(consent);
  } catch (error) {
    logger.error({ error }, 'Failed to create consent');
    res.status(500).json({ error: 'Failed to create consent' });
  }
});

consentRouter.put('/:id/sign', async (req, res) => {
  try {
    const { signatureDataUrl } = req.body;
    if (!signatureDataUrl) return res.status(400).json({ error: 'signatureDataUrl is required' });

    const consent = await prisma.consent.findFirst({
      where: { id: req.params.id, tenantId: req.user!.tenantId },
    });
    if (!consent) return res.status(404).json({ error: 'Consent not found' });
    if (consent.status === 'signed') return res.status(400).json({ error: 'Consent already signed' });

    const updated = await prisma.consent.update({
      where: { id: req.params.id },
      data: {
        signatureDataUrl,
        signedAt: new Date(),
        status: 'signed',
      },
    });

    res.json(updated);
  } catch (error) {
    logger.error({ error }, 'Failed to sign consent');
    res.status(500).json({ error: 'Failed to sign consent' });
  }
});

consentRouter.put('/:id/revoke', async (req, res) => {
  try {
    const consent = await prisma.consent.findFirst({
      where: { id: req.params.id, tenantId: req.user!.tenantId },
    });
    if (!consent) return res.status(404).json({ error: 'Consent not found' });

    const updated = await prisma.consent.update({
      where: { id: req.params.id },
      data: { status: 'revoked' },
    });

    res.json(updated);
  } catch (error) {
    logger.error({ error }, 'Failed to revoke consent');
    res.status(500).json({ error: 'Failed to revoke consent' });
  }
});

consentRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await prisma.consent.deleteMany({
      where: { id: req.params.id, tenantId: req.user!.tenantId },
    });
    if (deleted.count === 0) return res.status(404).json({ error: 'Consent not found' });
    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Failed to delete consent');
    res.status(500).json({ error: 'Failed to delete consent' });
  }
});
