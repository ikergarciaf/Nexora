import { Router } from 'express';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth, getTenantId } from '../middlewares/auth.ts';
import logger from '../services/logger.ts';
import prisma from '../db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadRouter = Router();

uploadRouter.use(requireAuth);

uploadRouter.post('/logo', async (req, res) => {
  try {
    const tenantId = getTenantId(req);

    const rawBody = req.body;
    if (!rawBody || !rawBody.image) return res.status(400).json({ error: 'No image provided' });

    const base64Data = rawBody.image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const ext = rawBody.image.startsWith('data:image/png') ? 'png' : 'jpg';
    const filename = `logo-${tenantId}-${Date.now()}.${ext}`;
    const uploadDir = path.resolve(__dirname, '..', '..', 'public', 'uploads');

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const logoUrl = `/uploads/${filename}`;

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { logoUrl },
    });

    logger.info({ tenantId, filename }, 'Logo uploaded');

    res.json({ logoUrl });
  } catch (error) {
    logger.error({ error }, 'Logo upload failed');
    res.status(500).json({ error: 'Upload failed' });
  }
});

uploadRouter.delete('/logo', async (req, res) => {
  try {
    const tenantId = getTenantId(req);

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (tenant?.logoUrl?.startsWith('/uploads/')) {
      const filePath = path.resolve(__dirname, '..', '..', 'public', tenant.logoUrl.slice(1));
      await unlink(filePath).catch(() => {});
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { logoUrl: null },
    });

    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Logo delete failed');
    res.status(500).json({ error: 'Delete failed' });
  }
});
