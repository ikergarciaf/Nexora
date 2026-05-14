import "express-async-errors";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { apiRouter } from "./server/routes/api.ts";
import { webhookRouter } from "./server/routes/webhooks.ts";
import { gdprRouter } from "./server/routes/gdpr.ts";
import { uploadRouter } from "./server/routes/upload.ts";
import { publicRouter } from "./server/routes/public.ts";
import rateLimit from "express-rate-limit";
import logger from "./server/services/logger.ts";
import prisma from "./server/db.ts";
import { requireAuth, csrfProtection } from "./server/middlewares/auth.ts";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateEnvironment(): string[] {
  const required = ['JWT_SECRET', 'DATABASE_URL'];
  const missing = required.filter(key => !process.env[key]);
  if (!process.env.DATABASE_URL_DIRECT) {
    logger.warn('DATABASE_URL_DIRECT not set — run prisma db push manually to sync schema');
  }
  return missing;
}

async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    logger.error({ err: String(err) }, 'Database connection failed');
    if (String(err).includes('prepared statement')) {
      logger.error('If using Supabase PgBouncer, add ?pgbouncer=true to DATABASE_URL and set DATABASE_URL_DIRECT to the direct connection');
    }
    return false;
  }
}

async function startServer() {
  const missingEnv = validateEnvironment();
  if (missingEnv.length > 0) {
    logger.error({ missingEnv }, 'Missing required environment variables');
    process.exit(1);
  }

  const dbConnected = await checkDatabaseConnection();
  if (!dbConnected) {
    logger.error('Database connection failed');
    process.exit(1);
  }
  logger.info('Database connection verified');

  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  const isDev = process.env.NODE_ENV !== "production";
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: isDev ? false : {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https://*.stripe.com", "https://accounts.google.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        frameSrc: ["'self'", "https://accounts.google.com"],
      },
    },
  }));

  app.use(compression());

  app.use(cookieParser());

  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
    : '*';

  app.use(cors({
    origin: corsOrigins === '*' ? (process.env.APP_URL || true) : corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-CSRF-Token'],
    credentials: true,
  }));

  app.use('/api/webhooks', webhookRouter);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  const errorStats = { total: 0, byType: {} as Record<string, number>, lastError: null as string | null };

  app.get('/api/health', async (_req, res) => {
    const dbOk = await checkDatabaseConnection();
    const status = dbOk ? 'ok' : 'degraded';
    const statusCode = dbOk ? 200 : 503;
    const memory = process.memoryUsage();
    const tenantCount = await prisma.tenant.count().catch(() => null);
    const userCount = await prisma.user.count().catch(() => null);
    const appointmentCount = await prisma.appointment.count().catch(() => null);
    const patientCount = await prisma.patient.count().catch(() => null);
    res.status(statusCode).json({
      status,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      memory: {
        rss: Math.round(memory.rss / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + 'MB',
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + 'MB',
      },
      stats: {
        tenants: tenantCount,
        users: userCount,
        appointments: appointmentCount,
        patients: patientCount,
      },
      errors: {
        total: errorStats.total,
        byType: errorStats.byType,
        lastError: errorStats.lastError,
      },
      message: dbOk ? 'Nexora API is online' : 'Database connection degraded',
    });
  });

  // Per-user rate limiting store
  const userRateLimitStore = new Map<string, { count: number; resetAt: number }>();
  const userRateLimitMiddleware = (maxPerWindow: number, windowMs: number) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const key = req.user?.id || req.ip || 'anonymous';
      const now = Date.now();
      let entry = userRateLimitStore.get(key);
      if (!entry || entry.resetAt < now) {
        entry = { count: 0, resetAt: now + windowMs };
        userRateLimitStore.set(key, entry);
      }
      entry.count++;
      if (entry.count > maxPerWindow) {
        res.status(429).json({ error: "Demasiadas solicitudes. Inténtalo de nuevo más tarde." });
        return;
      }
      next();
    };
  };
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of userRateLimitStore) {
      if (entry.resetAt < now) userRateLimitStore.delete(key);
    }
  }, 5 * 60 * 1000).unref();

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.id || req.ip || 'anonymous',
    message: { error: "Demasiadas solicitudes. Inténtalo de nuevo en 15 minutos." },
  });
  app.use("/api", apiLimiter);

  app.use("/api/dashboard", userRateLimitMiddleware(200, 15 * 60 * 1000));
  app.use("/api/patients", userRateLimitMiddleware(200, 15 * 60 * 1000));
  app.use("/api/appointments", userRateLimitMiddleware(200, 15 * 60 * 1000));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || 'anonymous',
    message: { error: "Demasiados intentos. Inténtalo de nuevo en 15 minutos." },
  });
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
  app.use("/api/auth/demo-register", authLimiter);
  app.use("/api/auth/forgot-password", authLimiter);
  app.use("/api/auth/reset-password", authLimiter);
  app.use("/api/auth/refresh", authLimiter);
  app.use("/api/auth/google", authLimiter);

  app.use('/api', (req, res, next) => {
    const skipPaths = ['/webhooks', '/health', '/auth/csrf'];
    if (skipPaths.some(p => req.path.startsWith(p))) {
      next();
      return;
    }
    csrfProtection(req, res, next);
  });

  app.use("/api", apiRouter);
  app.use("/api/gdpr", gdprRouter);
  app.use("/api/upload", uploadRouter);
  app.use("/api/public", publicRouter);

  app.use('/uploads', requireAuth, express.static(path.resolve(__dirname, 'public', 'uploads')));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath, {
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      },
    }));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    errorStats.total++;
    const type = err.name || 'UnknownError';
    errorStats.byType[type] = (errorStats.byType[type] || 0) + 1;
    errorStats.lastError = err.message;
    logger.error({ error: err.message, stack: err.stack }, 'Unhandled error');
    res.status(500).json({ error: 'Error interno del servidor' });
  });

  const server = app.listen(PORT, "0.0.0.0", () => {
    const url = process.env.APP_URL || `http://localhost:${PORT}`;
    logger.info({ port: PORT, url }, `Nexora server running at ${url}`);
  });

  const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  logger.error({ error: err }, 'Failed to start server');
  process.exit(1);
});
