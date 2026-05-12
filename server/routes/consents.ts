import { Router } from 'express';
import prisma from '../db.ts';
import { requireAuth, getTenantId } from '../middlewares/auth.ts';
import logger from '../services/logger.ts';

export const consentRouter = Router();

consentRouter.use(requireAuth);

consentRouter.get('/', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const consents = await prisma.consent.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
    res.json(consents);
  } catch (error) {
    logger.error({ error }, 'Failed to fetch consents');
    res.status(500).json({ error: 'Failed to fetch consents' });
  }
});

consentRouter.post('/', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { patientId, title, content } = req.body;
    if (!patientId || !title) return res.status(400).json({ error: 'patientId and title are required' });
    const consent = await prisma.consent.create({
      data: { tenantId, patientId, title, content: content || '', status: 'draft' },
    });
    res.status(201).json(consent);
  } catch (error) {
    logger.error({ error }, 'Failed to create consent');
    res.status(500).json({ error: 'Failed to create consent' });
  }
});

consentRouter.put('/:id/sign', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { signatureDataUrl } = req.body;
    const updated = await prisma.consent.update({
      where: { id_tenantId: { id: req.params.id, tenantId } },
      data: { signatureDataUrl, status: 'signed', signedAt: new Date() },
    });
    res.json(updated);
  } catch (error) {
    logger.error({ error }, 'Failed to sign consent');
    res.status(500).json({ error: 'Failed to sign consent' });
  }
});

consentRouter.delete('/:id', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    await prisma.consent.delete({ where: { id_tenantId: { id: req.params.id, tenantId } } });
    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Failed to delete consent');
    res.status(500).json({ error: 'Failed to delete consent' });
  }
});

consentRouter.get('/:id', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const consent = await prisma.consent.findUnique({ where: { id_tenantId: { id: req.params.id, tenantId } } });
    if (!consent) return res.status(404).json({ error: 'Consent not found' });
    res.json(consent);
  } catch (error) {
    logger.error({ error }, 'Failed to fetch consent');
    res.status(500).json({ error: 'Failed to fetch consent' });
  }
});
