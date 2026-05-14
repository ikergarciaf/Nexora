import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../db.ts';
import logger from '../services/logger.ts';

const JWT_SECRET = (() => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
  return process.env.JWT_SECRET;
})();

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const CSRF_TOKEN_BYTES = 32;
const CSRF_COOKIE = 'nexora_csrf';

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

export function generateTokens(payload: { id: string; isSuperAdmin: boolean }) {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(
    { id: payload.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY },
  );
  return { accessToken, refreshToken };
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_BYTES).toString('hex');
}

export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers['x-csrf-token'] as string;
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ error: 'CSRF token inválido' });
    return;
  }
  next();
};

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
                tenantId: requestedTenantId,
              },
            },
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
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      return;
    }
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRefreshAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token required' });
      return;
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { id: string; type: string };
    if (decoded.type !== 'refresh') {
      res.status(401).json({ error: 'Invalid token type' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }

    req.user = {
      id: decoded.id,
      tenantId: null,
      role: user.isSuperAdmin ? 'SUPERADMIN' : 'USER',
      isSuperAdmin: user.isSuperAdmin,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

export function getTenantId(req: Request): string {
  const id = req.user?.tenantId;
  if (!id) throw new Error('No tenant context available');
  return id;
}

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (req.user.isSuperAdmin) {
      next();
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
      return;
    }

    next();
  };
};
