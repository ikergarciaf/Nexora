import { Router } from 'express';
import prisma from '../db.ts';
import { requireAuth } from '../middlewares/auth.ts';
import logger from '../services/logger.ts';

export const adminRouter = Router();

adminRouter.use(requireAuth);

adminRouter.use(async (req, res, next) => {
  if (!req.user?.isSuperAdmin) {
    return res.status(403).json({ error: 'Forbidden: superadmin only' });
  }
  next();
});

adminRouter.get('/stats', async (_req, res) => {
  try {
    const [tenantCount, userCount, activeSubscriptions, trials] = await Promise.all([
      prisma.tenant.count(),
      prisma.user.count(),
      prisma.tenant.count({ where: { subscriptionStatus: 'active' } }),
      prisma.tenant.count({ where: { subscriptionStatus: 'trialing' } }),
    ]);

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const monthlyRevenue = await prisma.invoice.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID', issuedDate: { gte: lastMonth } },
    });

    res.json({
      tenantCount,
      userCount,
      activeSubscriptions,
      trials,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
    });
  } catch (error) {
    logger.error({ error }, 'Admin stats error');
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

adminRouter.get('/tenants', async (_req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        memberships: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { patients: true, appointments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = tenants.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      specialty: t.specialty,
      plan: t.subscriptionPlan,
      status: t.subscriptionStatus,
      users: t.memberships.length,
      patientCount: t._count.patients,
      appointmentCount: t._count.appointments,
      owner: t.memberships.find(m => m.role === 'OWNER')?.user,
      createdAt: t.createdAt,
    }));

    res.json(mapped);
  } catch (error) {
    logger.error({ error }, 'Admin tenants error');
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

adminRouter.get('/users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, isActive: true, isSuperAdmin: true, googleId: true, createdAt: true,
        memberships: {
          select: { role: true, tenant: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      isActive: u.isActive,
      isSuperAdmin: u.isSuperAdmin,
      hasGoogle: !!u.googleId,
      tenants: u.memberships.map(m => ({ id: m.tenant.id, name: m.tenant.name, role: m.role })),
      createdAt: u.createdAt,
    }));

    res.json(mapped);
  } catch (error) {
    logger.error({ error }, 'Admin users error');
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

adminRouter.put('/users/:id/toggle-active', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    res.json({ id: updated.id, isActive: updated.isActive });
  } catch (error) {
    logger.error({ error }, 'Admin toggle user error');
    res.status(500).json({ error: 'Failed to toggle user' });
  }
});

adminRouter.put('/tenants/:id/plan', async (req, res) => {
  try {
    const { id } = req.params;
    const { plan, status } = req.body;
    if (!plan && !status) return res.status(400).json({ error: 'Plan or status required' });

    const data: any = {};
    if (plan) data.subscriptionPlan = plan;
    if (status) data.subscriptionStatus = status;

    const updated = await prisma.tenant.update({ where: { id }, data });
    res.json(updated);
  } catch (error) {
    logger.error({ error }, 'Admin update plan error');
    res.status(500).json({ error: 'Failed to update plan' });
  }
});
adminRouter.get('/recent-activity', async (_req, res) => {
  try {
    const recentTenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, specialty: true, createdAt: true, subscriptionPlan: true },
    });

    const recentInvoices = await prisma.invoice.findMany({
      where: { status: 'PAID' },
      orderBy: { paidAt: 'desc' },
      take: 5,
      include: { tenant: { select: { name: true } }, patient: { select: { fullName: true } } },
    });

    res.json({ recentTenants, recentInvoices });
  } catch (error) {
    logger.error({ error }, 'Admin recent activity error');
    res.status(500).json({ error: 'Failed' });
  }
});
