import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.ts';
import prisma from '../db.ts';
import logger from '../services/logger.ts';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get('/stats', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    
    let appointmentsThisWeek = 0;
    try {
      appointmentsThisWeek = await prisma.appointment.count({
        where: { tenantId, startTime: { gte: startOfWeek, lte: endOfWeek } }
      });
    } catch { logger.warn('Prisma query failed for appointmentsThisWeek'); }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    let activePatients = 0;
    try {
      activePatients = await prisma.patient.count({
        where: { tenantId, appointments: { some: { startTime: { gte: sixMonthsAgo } } } }
      });
    } catch { logger.warn('Prisma query failed for activePatients'); }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let noShowRate = 0;
    try {
      const recentAppointments = await prisma.appointment.groupBy({
        by: ['status'],
        where: { tenantId, startTime: { gte: thirtyDaysAgo } },
        _count: { status: true }
      });
      let totalResolved = 0;
      let noShows = 0;
      recentAppointments.forEach(group => {
        if (group.status === 'COMPLETED' || group.status === 'NO_SHOW') {
          totalResolved += group._count.status;
          if (group.status === 'NO_SHOW') noShows += group._count.status;
        }
      });
      noShowRate = totalResolved > 0 ? (noShows / totalResolved) * 100 : 0;
    } catch { logger.warn('Prisma query failed for noShowRate'); }

    let monthlyRevenue = 0;
    try {
      const invoices = await prisma.invoice.aggregate({
        _sum: { amount: true },
        where: { tenantId, status: 'PAID', issuedDate: { gte: thirtyDaysAgo } }
      });
      monthlyRevenue = invoices._sum.amount || 0;
    } catch { logger.warn('Prisma query failed for monthlyRevenue'); }
    
    res.json({
      monthlyRevenue,
      revenueGrowth: 0,
      appointmentsThisWeek,
      activePatients,
      noShowRate: Number(noShowRate.toFixed(1))
    });
  } catch (error) {
    logger.error({ error }, 'Dashboard stats error');
    res.status(500).json({ error: 'Failed to retrieve dashboard stats' });
  }
});
