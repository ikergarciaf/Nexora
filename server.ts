import express from "express";
import helmet from "helmet";
import cors from "cors";
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
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // --- SECURITY HEADERS ---
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Vite uses inline scripts in dev
  }));

  // --- CORS ---
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    credentials: true,
  }));

  // --- STRIPE WEBHOOKS (must be before express.json to get raw body) ---
  app.use('/api/webhooks', webhookRouter);

  // --- BODY PARSER ---
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- RATE LIMITING ---
  // General API rate limiter: 100 requests per 15 minutes
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiadas solicitudes. Inténtalo de nuevo en 15 minutos." },
  });
  app.use("/api", apiLimiter);

  // Stricter limiter for auth routes (login/register)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiados intentos. Inténtalo de nuevo en 15 minutos." },
  });
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);

  // --- API ROUTES ---
  app.use("/api", apiRouter);

  // --- GDPR ROUTES ---
  app.use("/api/gdpr", gdprRouter);

  // --- UPLOAD ROUTES ---
  app.use("/api/upload", uploadRouter);

  // --- PUBLIC ROUTES (no auth required) ---
  app.use("/api/public", publicRouter);

  // --- STATIC UPLOADS ---
  app.use('/uploads', express.static(path.resolve(__dirname, 'public', 'uploads')));

  // --- VITE MIDDLEWARE ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    logger.info({ port: PORT }, `Server running at http://localhost:${PORT}`);
  });
}

startServer();
