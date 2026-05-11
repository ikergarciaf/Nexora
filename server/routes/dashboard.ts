import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.ts';
import prisma from '../db.ts';
import logger from '../services/logger.ts';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

const statsCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 30_000;

function getCached(key: string) {
  const cached = statsCache.get(key);
  if (cached && cached.expiry > Date.now()) return cached.data;
  return null;
}

function setCache(key: string, data: any) {
  statsCache.set(key, { data, expiry: Date.now() + CACHE_TTL });
  if (statsCache.size > 500) {
    const now = Date.now();
    for (const [k, v] of statsCache) {
      if (v.expiry < now) statsCache.delete(k);
    }
  }
}

dashboardRouter.get('/stats', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const cached = getCached(tenantId);
    if (cached) return res.json(cached);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [appointmentsThisWeek, activePatients, statusGroups, currMonth, prevMonth, todayAppointments] = await Promise.all([
      prisma.appointment.count({ where: { tenantId, startTime: { gte: startOfWeek, lt: endOfWeek } } }),
      prisma.patient.count({ where: { tenantId, appointments: { some: { startTime: { gte: sixMonthsAgo } } } } }),
      prisma.appointment.groupBy({ by: ['status'], where: { tenantId, startTime: { gte: thirtyDaysAgo } }, _count: { status: true } }),
      prisma.invoice.aggregate({ _sum: { amount: true }, where: { tenantId, status: 'PAID', issuedDate: { gte: thirtyDaysAgo } } }),
      prisma.invoice.aggregate({ _sum: { amount: true }, where: { tenantId, status: 'PAID', issuedDate: { gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), lt: thirtyDaysAgo } } }),
      prisma.appointment.count({ where: { tenantId, startTime: { gte: startOfToday, lt: endOfToday } } }),
    ]);

    let totalResolved = 0, noShows = 0;
    for (const g of statusGroups) {
      if (g.status === 'COMPLETED' || g.status === 'NO_SHOW') {
        totalResolved += g._count.status;
        if (g.status === 'NO_SHOW') noShows += g._count.status;
      }
    }
    const noShowRate = totalResolved > 0 ? (noShows / totalResolved) * 100 : 0;
    const monthlyRevenue = currMonth._sum.amount || 0;
    const prevRevenue = prevMonth._sum.amount || 0;
    const revenueGrowth = prevRevenue > 0 ? ((monthlyRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const data = {
      monthlyRevenue,
      revenueGrowth: Number(revenueGrowth.toFixed(1)),
      appointmentsThisWeek,
      activePatients,
      noShowRate: Number(noShowRate.toFixed(1)),
      todayAppointments,
    };
    setCache(tenantId, data);
    res.json(data);
  } catch (error) {
    logger.error({ error }, 'Dashboard stats error');
    res.status(500).json({ error: 'Failed to retrieve dashboard stats' });
  }
});
