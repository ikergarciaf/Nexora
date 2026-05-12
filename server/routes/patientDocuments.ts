import { Router } from 'express';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth, requireRole } from '../middlewares/auth.ts';
import logger from '../services/logger.ts';
import prisma from '../db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const documentRouter = Router({ mergeParams: true });

documentRouter.use(requireAuth);

documentRouter.get('/', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const patientId = (req.params as any).patientId;

    const docs = await prisma.patientDocument.findMany({
      where: { patientId, tenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        fileSize: true,
        filePath: true,
        createdAt: true,
      },
    });

    res.json(docs);
  } catch (error: any) {
    logger.error({ error }, 'Failed to fetch patient documents');
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

documentRouter.post('/', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const patientId = (req.params as any).patientId;
    const { file, fileName } = req.body;

    if (!file || !fileName) {
      return res.status(400).json({ error: 'file (base64) and fileName are required' });
    }

    const matches = file.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid file format. Use base64 data URI.' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const allowedMimes = [
      'application/pdf',
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    ];

    if (!allowedMimes.includes(mimeType)) {
      return res.status(400).json({ error: 'Only PDF and image files are allowed' });
    }

    const ext = path.extname(fileName) || (mimeType === 'application/pdf' ? '.pdf' : '.jpg');
    const storedName = `patient-${patientId}-${Date.now()}${ext}`;
    const uploadDir = path.resolve(__dirname, '..', '..', 'public', 'uploads', 'documents');

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, storedName), buffer);

    const filePath = `/uploads/documents/${storedName}`;

    const doc = await prisma.patientDocument.create({
      data: {
        tenantId,
        patientId,
        filePath,
        originalName: fileName,
        mimeType,
        fileSize: buffer.length,
      },
    });

    logger.info({ tenantId, patientId, fileName }, 'Patient document uploaded');

    res.status(201).json(doc);
  } catch (error: any) {
    logger.error({ error }, 'Patient document upload failed');
    res.status(500).json({ error: 'Upload failed' });
  }
});

documentRouter.delete('/:docId', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const patientId = (req.params as any).patientId;
    const docId = (req.params as any).docId;

    const doc = await prisma.patientDocument.findFirst({
      where: { id: docId, patientId, tenantId },
    });

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const absolutePath = path.resolve(__dirname, '..', '..', 'public', doc.filePath.replace(/^\//, ''));
    await unlink(absolutePath).catch(() => {});

    await prisma.patientDocument.delete({
      where: { id: docId },
    });

    res.json({ success: true });
  } catch (error: any) {
    logger.error({ error }, 'Failed to delete patient document');
    res.status(500).json({ error: 'Delete failed' });
  }
});
