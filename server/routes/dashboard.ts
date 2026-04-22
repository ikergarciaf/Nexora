import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.ts';
import prisma from '../db.ts';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get('/stats', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;

    if (!process.env.DATABASE_URL) {
      // Return high-value mock data for UI testing if no DB is attached
      return res.json({
        monthlyRevenue: 14250,
        revenueGrowth: 12.5, // Percentage
        appointmentsThisWeek: 48,
        activePatients: 1204,
        noShowRate: 3.2 // Percentage
      });
    }

    // 1. Appointments this week
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    
    const appointmentsThisWeek = await prisma.appointment.count({
      where: {
        tenantId,
        startTime: { gte: startOfWeek, lte: endOfWeek }
      }
    });

    // 2. Active Patients (Visited or scheduled in the last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const activePatients = await prisma.patient.count({
      where: {
        tenantId,
        appointments: { some: { startTime: { gte: sixMonthsAgo } } }
      }
    });

    // 3. No Show Rate (Last 30 days to keep it relevant)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
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

    const noShowRate = totalResolved > 0 ? (noShows / totalResolved) * 100 : 0;

    // 4. Monthly Revenue (Mocked aggregation from Invoices. In a real scenario, sum the paid invoices)
    let monthlyRevenue = 0;
    const invoices = await prisma.invoice.aggregate({
      _sum: { amount: true },
      where: {
        tenantId,
        status: 'PAID',
        issuedDate: { gte: thirtyDaysAgo }
      }
    });
    monthlyRevenue = invoices._sum.amount ? invoices._sum.amount : 0;

    // Standard fallback UI numbers if a brand new clinic has no stats yet
    if (activePatients === 0 && appointmentsThisWeek === 0) {
       return res.json({
         monthlyRevenue: 0,
         revenueGrowth: 0,
         appointmentsThisWeek: 0,
         activePatients: 0,
         noShowRate: 0
       });
    }

    res.json({
      monthlyRevenue,
      revenueGrowth: 0, // Placeholder for [Current Month - Last Month] logic
      appointmentsThisWeek,
      activePatients,
      noShowRate: Number(noShowRate.toFixed(1))
    });

  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard stats' });
  }
});
