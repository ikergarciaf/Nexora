import dotenv from 'dotenv';
dotenv.config({ override: true });
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
      console.log('⏳ Verifying database connection...');
      await prisma.$connect();
      await prisma.$executeRawUnsafe('SELECT 1');
      console.log('✅ Database connected successfully');
    } catch (e: any) {
      console.error('❌ Database Authentication Failed - The DATABASE_URL is invalid or credentials expired.');
      console.warn('⚠️ Disabling DATABASE_URL and falling back to Mock Mode for this session.');
      delete process.env.DATABASE_URL; 
    }
  } else {
    console.log('ℹ️ No DATABASE_URL provided. Operating in Mock Mode.');
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
