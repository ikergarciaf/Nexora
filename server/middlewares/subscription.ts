import { Request, Response, NextFunction } from 'express';
import prisma from '../db.ts';

/**
 * Middleware: Enforce Active Subscription Hook
 * Rejects requests if the Tenant's subscription past its trial and isn't actively paid.
 */
export const requireActiveSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || !req.user.tenantId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Skip DB check if DB is not configured (Mock/Preview Mode constraint)
    if (!process.env.DATABASE_URL) {
      return next();
    }

    let tenant;
    try {
      tenant = await prisma.tenant.findUnique({
        where: { id: req.user.tenantId },
        select: { subscriptionStatus: true, trialEndsAt: true }
      });
    } catch (dbError: any) {
      if (dbError?.message?.includes('Authentication failed') || dbError?.code === 'P1000' || dbError?.message?.includes('Can\'t reach database')) {
        console.warn('⚠️ DB Offline - Bypassing Subscription Wall for DEMO');
        return next();
      }
      throw dbError;
    }

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    const isTrialActive = tenant.trialEndsAt && new Date() < tenant.trialEndsAt;
    const isSubscriptionActive = tenant.subscriptionStatus === 'active';

    if (!isTrialActive && !isSubscriptionActive && tenant.subscriptionStatus !== 'trialing') {
      // Payment wall - standard SaaS practice
      res.status(402).json({ 
        error: 'Payment Required', 
        message: 'Your trial has ended or subscription is past due. Please update your billing details.' 
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Subscription Check Error:', error);
    res.status(500).json({ error: 'Internal server validation error' });
  }
};
