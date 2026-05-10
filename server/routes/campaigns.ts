import { Router } from 'express';
import prisma from '../db.ts';
import logger from '../services/logger.ts';
import { sendEmail } from '../services/emailService.ts';

export const campaignRouter = Router();

campaignRouter.get('/', async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({ where: { tenantId: req.user!.tenantId }, orderBy: { createdAt: 'desc' } });
    res.json(campaigns);
  } catch (error) {
    logger.error({ error }, 'Campaign list error');
    res.status(500).json({ error: 'Error al cargar campañas' });
  }
});

campaignRouter.post('/', async (req, res) => {
  try {
    const { name, subject, body, segment } = req.body;
    if (!name || !subject || !body) return res.status(400).json({ error: 'Faltan datos obligatorios' });
    const campaign = await prisma.campaign.create({
      data: { tenantId: req.user!.tenantId, name, subject, body, segment: segment || 'ALL' },
    });
    res.status(201).json(campaign);
  } catch (error) {
    logger.error({ error }, 'Campaign create error');
    res.status(500).json({ error: 'Error al crear campaña' });
  }
});

campaignRouter.post('/:id/send', async (req, res) => {
  try {
    const campaign = await prisma.campaign.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
    if (!campaign) return res.status(404).json({ error: 'Campaña no encontrada' });
    const patients = await prisma.patient.findMany({
      where: { tenantId: req.user!.tenantId, email: { not: null }, ...(campaign.segment !== 'ALL' ? { tags: { contains: campaign.segment } } : {}) },
    });
    let sent = 0;
    for (const p of patients) {
      if (p.email) {
        await sendEmail({ to: p.email, subject: campaign.subject, text: campaign.body, html: campaign.body.replace(/\n/g, '<br/>') });
        sent++;
      }
    }
    await prisma.campaign.update({ where: { id: campaign.id }, data: { status: 'SENT', sentAt: new Date() } });
    res.json({ success: true, sent });
  } catch (error) {
    logger.error({ error }, 'Campaign send error');
    res.status(500).json({ error: 'Error al enviar campaña' });
  }
});
