import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';

const router = Router();
const prisma = new PrismaClient();

// This simulates a webhook that WhatsApp would hit when a user sends a message
router.post('/webhook', async (req, res) => {
  try {
    const { fromPhone, message, clinicSlug } = req.body;

    const clinic = await prisma.tenant.findFirst({
      where: { 
        OR: [
          { slug: clinicSlug },
          { id: clinicSlug }
        ]
      }
    });

    if (!clinic) {
      return res.json({ reply: 'Clínica no encontrada.' });
    }

    // Find patient by phone
    const patient = await prisma.patient.findFirst({
      where: { 
        tenantId: clinic.id,
        phone: {
          contains: fromPhone.replace(/\D/g, '').slice(-9) // match last 9 digits
        }
      },
      include: {
        appointments: {
          where: {
            startTime: { gte: new Date() }
          },
          orderBy: { startTime: 'asc' },
          take: 3
        }
      }
    });

    if (!patient) {
      return res.json({ reply: `Hola! No te encuentro en la base de datos de ${clinic.name}. Por favor, regístrate primero o llámanos directamente.` });
    }

    // Context for AI
    const now = new Date();
    const patientContext = `
    Clínica: ${clinic.name}
    Especialidad: ${clinic.specialty}
    Paciente: ${patient.fullName}
    Fecha actual: ${now.toLocaleString('es-ES')}
    Citas futuras: ${patient.appointments.length > 0 ? patient.appointments.map(a => `${a.type} el ${a.startTime.toLocaleString()}`).join(', ') : 'Ninguna'}
    `;

    let reply = '';
    
    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const prompt = `
      Eres el asistente inteligente de la clínica "${clinic.name}". Especialidad: ${clinic.specialty}.
      OBJETIVO: Ayudar al paciente a gestionar sus citas de forma natural y cercana.
      
      CONTEXTO DEL PACIENTE:
      ${patientContext}
      
      MENSAJE DEL PACIENTE:
      "${message}"
      
      REGLAS:
      1. Si el paciente quiere agendar una cita (menciona fecha, hora o intención clara):
         - Primero verifica si ha dicho una hora/fecha específica.
         - Dile que le confirmarás la cita de inmediato.
         - Tu respuesta final debe terminar con el tag técnico [ACTION:BOOK:FECHA:DESCRIPCION] donde FECHA sea en formato ISO y DESCRIPCION sea el motivo.
      2. Si solo saluda o pregunta algo general, responde de forma corta y amable (máximo 2 frases).
      3. No uses lenguaje robótico.
      
      Si el usuario NO especifica fecha pero quiere cita, dile: "Dime qué día y a qué hora te vendría bien pasar por la clínica".
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      reply = result.text || 'Lo siento, no he podido procesar tu solicitud.';

      // Check if AI included an action tag
      if (reply.includes('[ACTION:BOOK:')) {
        try {
          const match = reply.match(/\[ACTION:BOOK:(.*?):(.*?)\]/);
          if (match) {
            const requestedDate = new Date(match[1]);
            const description = match[2];

            if (!isNaN(requestedDate.getTime())) {
              // Create the appointment automatically
              const endTime = new Date(requestedDate.getTime() + 30 * 60000); // Default 30 mins
              await prisma.appointment.create({
                data: {
                  tenantId: clinic.id,
                  patientId: patient.id,
                  startTime: requestedDate,
                  endTime: endTime,
                  type: description || 'Visita por WhatsApp',
                  status: 'SCHEDULED'
                }
              });
              reply = reply.replace(/\[ACTION:BOOK:.*?\]/, `✅ ¡Perfecto! He agendado tu cita para el ${requestedDate.toLocaleString('es-ES')}. ¡Te esperamos!`);
            }
          }
        } catch (bookingError) {
          console.error('Auto-booking error:', bookingError);
          reply = reply.replace(/\[ACTION:BOOK:.*?\]/, ' (Hubo un error agendando técnicamente, te llamaremos pronto)');
        }
      }
    } else {
      reply = `Hola ${patient.fullName}. En este momento estamos en modo mantenimiento. Para citas llama al receptor de ${clinic.name}.`;
    }

    res.json({ reply });

  } catch (error) {
    console.error('WhatsApp Bot Error:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

export const whatsappRouter = router;
