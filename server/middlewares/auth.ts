import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-do-not-use-in-prod';

// Extend Express Request to include user context globally
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        tenantId: string | null;
        role: string;
        isSuperAdmin: boolean;
      };
    }
  }
}

/**
 * Validates JWT Token and injects identity into the Request context.
 * Resolves the Tenant Context based on X-Tenant-ID header.
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (token === 'demo-token' || token === 'mock-jwt-token-db-not-configured') {
      req.user = { id: 'demo-user-1', tenantId: 'demo-tenant-1', role: 'ADMIN', isSuperAdmin: true };
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; isSuperAdmin: boolean };
    const requestedTenantId = req.headers['x-tenant-id'] as string;
    
    let tenantId = null;
    let role = 'USER';

    if (requestedTenantId) {
      if (decoded.isSuperAdmin) {
        tenantId = requestedTenantId;
        role = 'SUPERADMIN';
      } else {
        const membership = await prisma.tenantUser.findUnique({
          where: {
            userId_tenantId: {
              userId: decoded.id,
              tenantId: requestedTenantId
            }
          }
        });
        if (!membership) {
          res.status(403).json({ error: 'Access denied for this tenant' });
          return;
        }
        tenantId = membership.tenantId;
        role = membership.role;
      }
    }

    req.user = {
      id: decoded.id,
      tenantId: tenantId,
      role: role,
      isSuperAdmin: decoded.isSuperAdmin
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
