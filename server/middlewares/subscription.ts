import { Request, Response, NextFunction } from 'express';
import prisma from '../db.ts';
import logger from '../services/logger.ts';

export const requireActiveSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || !req.user.tenantId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (req.user.isSuperAdmin) return next();

    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user.tenantId },
      select: { subscriptionStatus: true, trialEndsAt: true },
    });

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    const isTrialActive = tenant.trialEndsAt && new Date() < tenant.trialEndsAt;
    const isSubscriptionActive = tenant.subscriptionStatus === 'active';

    if (!isTrialActive && !isSubscriptionActive) {
      res.status(402).json({
        error: 'subscription_required',
        message: 'Tu prueba gratuita ha terminado. Selecciona un plan para continuar usando Nexora.',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error({ error }, 'Subscription check error');
    res.status(500).json({ error: 'Internal server validation error' });
  }
};
