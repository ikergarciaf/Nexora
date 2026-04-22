import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { apiRouter } from './server/routes/api.ts';
import prisma from './server/db.ts';

// Fail-safe wrapper to check DB
async function checkDatabase() {
  if (process.env.DATABASE_URL) {
    try {
      await prisma.$executeRawUnsafe('SELECT 1');
      console.log('✅ Database connected successfully');
    } catch (e: any) {
      console.warn('⚠️ Database Authentication Failed - Disabling DATABASE_URL for Mock Mode');
      delete process.env.DATABASE_URL; // This triggers all the fallback logics automatically
    }
  }
}

async function startServer() {
  await checkDatabase();

  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Mount central API router
  app.use('/api', apiRouter);

  // Vite middleware for development routing
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production serving static compiled files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ClinicSaaS] Server running on http://localhost:${PORT}`);
  });
}

startServer();
