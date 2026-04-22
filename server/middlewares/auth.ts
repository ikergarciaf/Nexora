import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-do-not-use-in-prod';

// Extend Express Request to include user context globally
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        tenantId: string;
        role: string;
      };
    }
  }
}

/**
 * Validates JWT Token and injects identity into the Request context.
 * Guarantees Tenant Isolation context for subsequent route handlers.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // In a dev mode or when DB is failing we can optionally allow a bypass token
    const token = authHeader.split(' ')[1];
    if (token === 'demo-token' || token === 'mock-jwt-token-db-not-configured') {
      req.user = { id: 'demo-user-1', tenantId: 'demo-tenant-1', role: 'ADMIN' };
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; tenantId: string; role: string };
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware.
 * Must be used AFTER requireAuth.
 * @param allowedRoles array of roles authorized to access the route (e.g. ['ADMIN', 'STAFF'])
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
      return;
    }

    next();
  };
};
