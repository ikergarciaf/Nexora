import { Router } from 'express';

export const integrationRouter = Router();

integrationRouter.get('/doctoralia', (_req, res) => {
  res.json({
    available: false,
    message: 'Integración con Doctoralia próximamente. Permítenos mostrar tu clínica en Doctoralia con reserva directa.',
    docs: 'https://nexora.co/integrations/doctoralia',
  });
});

integrationRouter.get('/google-reserve', (_req, res) => {
  res.json({
    available: false,
    message: 'Integración con Google Reserve próximamente. Aparece en Google Search y Maps con reserva directa.',
    docs: 'https://nexora.co/integrations/google-reserve',
  });
});
