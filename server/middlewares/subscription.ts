import { Request, Response, NextFunction } from 'express';

export const requireActiveSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user || !req.user.tenantId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.isSuperAdmin) return next();

  const isTrialActive = req.user.trialEndsAt && new Date() < new Date(req.user.trialEndsAt);
  const isSubscriptionActive = req.user.subscriptionStatus === 'active';

  if (!isTrialActive && !isSubscriptionActive) {
    res.status(402).json({
      error: 'subscription_required',
      message: 'Tu prueba gratuita ha terminado. Selecciona un plan para continuar usando Nexora.',
    });
    return;
  }

  next();
};
