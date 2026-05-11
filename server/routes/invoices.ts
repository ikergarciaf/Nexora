import { Router } from 'express';
import prisma from '../db.ts';
import { requireAuth } from '../middlewares/auth.ts';
import logger from '../services/logger.ts';
import { sendEmail } from '../services/emailService.ts';

export const invoiceRouter = Router();

invoiceRouter.use(requireAuth);

invoiceRouter.get('/', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { tenantId: req.user!.tenantId },
      include: { patient: { select: { fullName: true } } },
      orderBy: { issuedDate: 'desc' },
      take: 100,
    });

    const mapped = invoices.map(inv => ({
      id: inv.id,
      number: inv.number || `#INV-${inv.id.slice(0, 8)}`,
      date: new Date(inv.issuedDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      client: inv.patient?.fullName || 'Desconocido',
      amount: inv.amount,
      currency: inv.currency,
      status: inv.status,
      description: inv.description || '',
    }));

    res.json(mapped);
  } catch (error) {
    logger.error({ error }, 'Failed to fetch invoices');
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

invoiceRouter.post('/', async (req, res) => {
  try {
    const { patientId, amount, description, dueDate } = req.body;
    const tenantId = req.user!.tenantId;
    if (!patientId || !amount) return res.status(400).json({ error: 'patientId and amount are required' });

    const invNumber = `FV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        tenantId,
        patientId,
        number: invNumber,
        amount,
        description: description || '',
        currency: 'EUR',
        status: 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    res.status(201).json(invoice);
  } catch (error) {
    logger.error({ error }, 'Failed to create invoice');
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

invoiceRouter.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['PENDING', 'PAID', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const data: any = { status };
    if (status === 'PAID') data.paidAt = new Date();

    const updated = await prisma.invoice.update({
      where: { id, tenantId: req.user!.tenantId! },
      data,
      include: { patient: { select: { fullName: true, email: true } } },
    });

    if (status === 'PAID' && updated.patient?.email) {
      sendEmail({
        to: updated.patient.email,
        subject: 'Factura pagada — Nexora',
        text: `Hola ${updated.patient.fullName},\n\nTu factura ${updated.number || ''} por ${updated.amount}€ ha sido pagada correctamente.\n\nGracias por tu confianza.\n— Nexora`,
        html: `<p>Hola <strong>${updated.patient.fullName}</strong>,</p><p>Tu factura <strong>${updated.number || ''}</strong> por <strong>${updated.amount}€</strong> ha sido pagada correctamente.</p><p>Gracias por tu confianza.</p><p>— Nexora</p>`,
      });
    }

    res.json(updated);
  } catch (error) {
    logger.error({ error }, 'Failed to update invoice status');
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

const invoiceStatsCache = new Map<string, { data: any; expiry: number }>();
const INVOICE_CACHE_TTL = 30_000;

invoiceRouter.get('/stats', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const cached = invoiceStatsCache.get(tenantId);
    if (cached && cached.expiry > Date.now()) return res.json(cached.data);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [monthlyInvoices, pendingCount, paidCount] = await Promise.all([
      prisma.invoice.aggregate({
        _sum: { amount: true },
        where: { tenantId, status: 'PAID', issuedDate: { gte: thirtyDaysAgo } },
      }),
      prisma.invoice.count({ where: { tenantId, status: 'PENDING' } }),
      prisma.invoice.count({ where: { tenantId, status: 'PAID', issuedDate: { gte: thirtyDaysAgo } } }),
    ]);

    const data = { monthlyRevenue: monthlyInvoices._sum.amount || 0, pendingCount, paidCount };
    invoiceStatsCache.set(tenantId, { data, expiry: Date.now() + INVOICE_CACHE_TTL });
    res.json(data);
  } catch (error) {
    logger.error({ error }, 'Failed to fetch invoice stats');
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});
