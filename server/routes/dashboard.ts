import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.ts';
import prisma from '../db.ts';
import logger from '../services/logger.ts';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

const statsCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 30_000;

dashboardRouter.get('/stats', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const cached = statsCache.get(tenantId);
    if (cached && cached.expiry > Date.now()) return res.json(cached.data);

    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [appointmentsThisWeek, activePatients, recentAppointments, currMonth, prevMonth] = await Promise.all([
      prisma.appointment.count({ where: { tenantId, startTime: { gte: startOfWeek, lte: endOfWeek } } }).catch(() => 0),
      prisma.patient.count({ where: { tenantId, appointments: { some: { startTime: { gte: sixMonthsAgo } } } } }).catch(() => 0),
      prisma.appointment.groupBy({ by: ['status'], where: { tenantId, startTime: { gte: thirtyDaysAgo } }, _count: { status: true } }).catch(() => []),
      prisma.invoice.aggregate({ _sum: { amount: true }, where: { tenantId, status: 'PAID', issuedDate: { gte: thirtyDaysAgo } } }).catch(() => ({ _sum: { amount: null } })),
      prisma.invoice.aggregate({ _sum: { amount: true }, where: { tenantId, status: 'PAID', issuedDate: { gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), lt: thirtyDaysAgo } } }).catch(() => ({ _sum: { amount: null } })),
    ]) as any;

    let totalResolved = 0, noShows = 0;
    (recentAppointments as any[]).forEach((g: any) => {
      if (g.status === 'COMPLETED' || g.status === 'NO_SHOW') { totalResolved += g._count.status; if (g.status === 'NO_SHOW') noShows += g._count.status; }
    });
    const noShowRate = totalResolved > 0 ? (noShows / totalResolved) * 100 : 0;
    const monthlyRevenue = currMonth._sum.amount || 0;
    const prev = prevMonth._sum.amount || 0;
    const revenueGrowth = prev > 0 ? ((monthlyRevenue - prev) / prev) * 100 : 0;

    const data = { monthlyRevenue, revenueGrowth: Number(revenueGrowth.toFixed(1)), appointmentsThisWeek, activePatients, noShowRate: Number(noShowRate.toFixed(1)) };
    statsCache.set(tenantId, { data, expiry: Date.now() + CACHE_TTL });
    res.json(data);
  } catch (error) {
    logger.error({ error }, 'Dashboard stats error');
    res.status(500).json({ error: 'Failed to retrieve dashboard stats' });
  }
});
