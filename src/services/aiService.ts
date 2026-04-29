import { GoogleGenAI, Type } from '@google/genai';

export class AiService {
  private ai: GoogleGenAI | null = null;
  private isMockMode: boolean = false;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } else {
      this.isMockMode = true;
      console.warn('[ClinicSaaS] GEMINI_API_KEY not found. Running AI in mock mode.');
    }
  }

  /**
   * Summarize or Structure clinical notes (SOAP format)
   */
  async summarizePatientHistory(notes: string): Promise<string> {
    if (this.isMockMode || !this.ai) {
      return "SUBJETIVO: Dolor agudo molar 3. \nOBJETIVO: Caries profunda detectada. \nPLAN: Endodoncia programada para la próxima semana.";
    }

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Eres un asistente clínico experto. Estructura las siguientes notas médicas en un formato profesional y accionable (estilo SOAP si es posible). Responde SIEMPRE en Español. \n\nNotas: ${notes}`,
    });
    
    return response.text || "Resumen no disponible.";
  }

  /**
   * Generate a professional WhatsApp message
   */
  async generateWhatsAppDraft(patientName: string, appointmentType: string, time: string, goal: 'reminder' | 'follow_up' | 'reactivation'): Promise<string> {
    if (this.isMockMode || !this.ai) {
      const mocks = {
        reminder: `Hola ${patientName}, ¡confirmamos tu cita de ${appointmentType} a las ${time}! ¿Necesitas indicaciones para llegar?`,
        follow_up: `Hola ${patientName}, ¿cómo te encuentras tras tu ${appointmentType}? ¡Avísanos si necesitas algo!`,
        reactivation: `Hola ${patientName}, ¡hace tiempo que no nos vemos! Notamos que no tienes programada tu próxima revisión. ¿Te gustaría ver horarios disponibles?`
      };
      return mocks[goal];
    }

    const goalPrompts = {
      reminder: 'un recordatorio de cita educado y cálido',
      follow_up: 'un seguimiento post-tratamiento atento para comprobar la recuperación',
      reactivation: 'un mensaje amable de reactivación para un paciente que lleva tiempo sin venir'
    };

    const prompt = `Escribe un mensaje corto y cercano para WhatsApp destinado a un paciente de clínica dental. Responde SIEMPRE en Español.
    Nombre Paciente: ${patientName}
    Contexto: ${appointmentType} a las ${time}. 
    Objetivo: Escribe ${goalPrompts[goal]}. 
    Restricción: Máximo 250 caracteres, tono cercano pero profesional. No uses placeholders como [Nombre Clínica], habla directamente. No uses comillas.`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.replace(/"/g, '').trim() || "";
  }

  /**
   * Predict the No-Show probability
   */
  async predictNoShowRisk(patientHistoryTags: string[]): Promise<{ riskLevel: string, score: number, reason: string }> {
    if (this.isMockMode || !this.ai) {
      return { riskLevel: "ALTO", score: 0.82, reason: "Patrón histórico indica frecuentes reprogramaciones." };
    }

    const prompt = `Basado en las siguientes etiquetas de historial de paciente, predice la probabilidad de inasistencia (no-show) para su próxima cita. Responde en Español.
    Etiquetas: ${patientHistoryTags.join(', ')}`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskLevel: {
                type: Type.STRING,
                description: "Nivel de riesgo: BAJO, MEDIO, o ALTO"
              },
              score: {
                type: Type.NUMBER,
                description: "Probabilidad predicha de 0.0 a 1.0"
              },
              reason: {
                type: Type.STRING,
                description: "Breve razonamiento en español"
              }
            },
            required: ["riskLevel", "score", "reason"]
          }
        }
      });

      const jsonStr = response.text || "{}";
      const parsed = JSON.parse(jsonStr);
      return {
        riskLevel: parsed.riskLevel || "MEDIO",
        score: parsed.score || 0.5,
        reason: parsed.reason || "No se ha podido determinar el razonamiento preciso."
      };
    } catch (e) {
      return { riskLevel: "MEDIO", score: 0.5, reason: "Error al computar el riesgo." };
    }
  }

  /**
   * Draft a reactivation campaign strategy
   */
  async draftReactivationStrategy(patients: any[]): Promise<string> {
    if (this.isMockMode || !this.ai) {
      return "Basado en los " + patients.length + " pacientes inactivos, envía un descuento 'Te echamos de menos' para limpieza dental el próximo Martes a las 10 AM.";
    }

    const patientProfiles = patients.map(p => p.tags || "Sin etiquetas").join("; ");
    const prompt = `Eres un experto en marketing dental. Tengo ${patients.length} pacientes inactivos.
    Sus perfiles históricos: ${patientProfiles}
    Escribe una estrategia de reactivación de 2-3 frases muy efectiva vía WhatsApp. Responde en Español.`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "Estrategia no disponible.";
  }
}

export const aiService = new AiService();
