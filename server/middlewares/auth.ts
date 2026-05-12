import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db.ts';

const JWT_SECRET = (() => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
  return process.env.JWT_SECRET;
})();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        tenantId: string | null;
        role: string;
        isSuperAdmin: boolean;
        subscriptionStatus?: string | null;
        trialEndsAt?: string | null;
      };
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; isSuperAdmin: boolean };
    const requestedTenantId = req.headers['x-tenant-id'] as string;
    
    let tenantId: string | null = null;
    let role = 'USER';
    let subscriptionStatus: string | null = null;
    let trialEndsAt: string | null = null;

    if (requestedTenantId) {
      if (decoded.isSuperAdmin) {
        tenantId = requestedTenantId;
        role = 'SUPERADMIN';
      } else {
        const [membership, tenant] = await Promise.all([
          prisma.tenantUser.findUnique({
            where: {
              userId_tenantId: {
                userId: decoded.id,
                tenantId: requestedTenantId
              }
            }
          }),
          prisma.tenant.findUnique({
            where: { id: requestedTenantId },
            select: { subscriptionStatus: true, trialEndsAt: true },
          }),
        ]);

        if (!membership) {
          res.status(403).json({ error: 'Access denied for this tenant' });
          return;
        }
        tenantId = membership.tenantId;
        role = membership.role;
        subscriptionStatus = tenant?.subscriptionStatus ?? null;
        trialEndsAt = tenant?.trialEndsAt?.toISOString() ?? null;
      }
    }

    req.user = {
      id: decoded.id,
      tenantId,
      role,
      isSuperAdmin: decoded.isSuperAdmin,
      subscriptionStatus,
      trialEndsAt,
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    if (req.user.isSuperAdmin) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
      return;
    }

    next();
  };
};
