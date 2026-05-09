import { Router } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { requireAuth } from '../middlewares/auth.ts';
import logger from '../services/logger.ts';

export const aiRouter = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

function getAI() {
  if (!GEMINI_API_KEY) return null;
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

aiRouter.post('/summarize', requireAuth, async (req, res) => {
  try {
    const { notes } = req.body;
    if (!notes) return res.status(400).json({ error: 'Notes are required' });

    const ai = getAI();
    if (!ai) {
      return res.json({ result: 'SUBJETIVO: Dolor agudo detectado.\nOBJETIVO: Hallazgos clínicos relevantes.\nPLAN: Tratamiento programado.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Eres un asistente clínico experto. Estructura las siguientes notas médicas en un formato profesional y accionable (estilo SOAP si es posible). Responde SIEMPRE en Español.\n\nNotas: ${notes}`,
    });

    res.json({ result: response.text || 'Resumen no disponible.' });
  } catch (error) {
    logger.error({ error }, 'AI summarize error');
    res.status(500).json({ error: 'AI processing failed' });
  }
});

aiRouter.post('/whatsapp-draft', requireAuth, async (req, res) => {
  try {
    const { patientName, appointmentType, time, goal } = req.body;
    if (!patientName || !goal) return res.status(400).json({ error: 'Missing required fields' });

    const ai = getAI();
    if (!ai) {
      const mocks: Record<string, string> = {
        reminder: `Hola ${patientName}, confirmamos tu cita de ${appointmentType} a las ${time}.`,
        follow_up: `Hola ${patientName}, ¿cómo te encuentras tras tu ${appointmentType}?`,
        reactivation: `Hola ${patientName}, ¡hace tiempo que no nos vemos! ¿Te gustaría agendar una cita?`,
      };
      return res.json({ result: mocks[goal] || mocks.reminder });
    }

    const goalPrompts: Record<string, string> = {
      reminder: 'un recordatorio de cita educado y cálido',
      follow_up: 'un seguimiento post-tratamiento atento',
      reactivation: 'un mensaje amable de reactivación',
    };

    const prompt = `Escribe un mensaje corto y cercano para WhatsApp destinado a un paciente de clínica. Responde SIEMPRE en Español.
    Nombre: ${patientName}
    Contexto: ${appointmentType} a las ${time}.
    Objetivo: ${goalPrompts[goal] || goalPrompts.reminder}
    Máximo 250 caracteres, tono profesional pero cercano.`;

    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    res.json({ result: response.text?.replace(/"/g, '').trim() || '' });
  } catch (error) {
    logger.error({ error }, 'AI WhatsApp draft error');
    res.status(500).json({ error: 'AI processing failed' });
  }
});

aiRouter.post('/no-show-risk', requireAuth, async (req, res) => {
  try {
    const { tags } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.json({ riskLevel: 'ALTO', score: 0.82, reason: 'Patrón histórico indica frecuentes reprogramaciones.' });
    }

    const prompt = `Basado en las siguientes etiquetas de historial de paciente, predice la probabilidad de inasistencia. Responde en Español.\nEtiquetas: ${(tags || []).join(', ')}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, description: 'Nivel de riesgo: BAJO, MEDIO, o ALTO' },
            score: { type: Type.NUMBER, description: 'Probabilidad de 0.0 a 1.0' },
            reason: { type: Type.STRING, description: 'Breve razonamiento en español' },
          },
          required: ['riskLevel', 'score', 'reason'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ riskLevel: parsed.riskLevel || 'MEDIO', score: parsed.score || 0.5, reason: parsed.reason || '' });
  } catch (error) {
    logger.error({ error }, 'AI no-show risk error');
    res.status(500).json({ error: 'AI processing failed' });
  }
});

aiRouter.post('/chat', requireAuth, async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const ai = getAI();
    if (!ai) {
      return res.json({ result: '¡Hola! Soy el asistente virtual. ¿En qué puedo ayudarte?' });
    }

    const prompt = `Eres el asistente inteligente de una clínica. Ayuda al paciente a gestionar sus citas.
    CONTEXTO: ${context || 'Paciente general'}
    MENSAJE: "${message}"
    Responde en español, máximo 2 frases. Si el paciente quiere agendar, termina con [ACTION:BOOK:FECHA:DESCRIPCION].`;

    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    res.json({ result: response.text || 'Lo siento, no he podido procesar tu solicitud.' });
  } catch (error) {
    logger.error({ error }, 'AI chat error');
    res.status(500).json({ error: 'AI processing failed' });
  }
});
