import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.ts';
import prisma from '../db.ts';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get('/stats', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;

    if (!process.env.DATABASE_URL) {
      // Return realistic mock stats for the demo environment
      return res.json({
        monthlyRevenue: 12450.50,
        revenueGrowth: 12.5,
        appointmentsThisWeek: 42,
        activePatients: 156,
        noShowRate: 4.2
      });
    }

    // 1. Appointments this week
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    
    let appointmentsThisWeek = 0;
    try {
      appointmentsThisWeek = await prisma.appointment.count({
        where: {
          tenantId,
          startTime: { gte: startOfWeek, lte: endOfWeek }
        }
      });
    } catch { console.warn("Prisma query failed, using 0 for appointmentsThisWeek"); }

    // 2. Active Patients (Visited or scheduled in the last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    let activePatients = 0;
    try {
      activePatients = await prisma.patient.count({
        where: {
          tenantId,
          appointments: { some: { startTime: { gte: sixMonthsAgo } } }
        }
      });
    } catch { console.warn("Prisma query failed, using 0 for activePatients"); }

    // 3. No Show Rate (Last 30 days to keep it relevant)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let noShowRate = 0;
    try {
      const recentAppointments = await prisma.appointment.groupBy({
        by: ['status'],
        where: {
          tenantId,
          startTime: { gte: thirtyDaysAgo }
        },
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
    } catch { console.warn("Prisma query failed, using 0 for noShowRate"); }

    // 4. Monthly Revenue
    let monthlyRevenue = 0;
    try {
      const invoices = await prisma.invoice.aggregate({
        _sum: { amount: true },
        where: {
          tenantId,
          status: 'PAID',
          issuedDate: { gte: thirtyDaysAgo }
        }
      });
      monthlyRevenue = invoices._sum.amount ? invoices._sum.amount : 0;
    } catch { console.warn("Prisma query failed, using 0 for monthlyRevenue"); }
    
    res.json({
      monthlyRevenue,
      revenueGrowth: 0,
      appointmentsThisWeek,
      activePatients,
      noShowRate: Number(noShowRate.toFixed(1))
    });

  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard stats' });
  }
});
