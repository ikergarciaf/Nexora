import { Router } from 'express';
import prisma from '../db.ts';
import logger from '../services/logger.ts';

export const integrationRouter = Router();

integrationRouter.get('/doctoralia', async (req, res) => {
  res.json({
    available: false,
    message: 'Integración con Doctoralia próximamente. Permítenos mostrar tu clínica en Doctoralia con reserva directa.',
    docs: 'https://nexora.co/integrations/doctoralia',
  });
});

integrationRouter.get('/google-reserve', async (req, res) => {
  res.json({
    available: false,
    message: 'Integración con Google Reserve próximamente. Aparece en Google Search y Maps con reserva directa.',
    docs: 'https://nexora.co/integrations/google-reserve',
  });
});
