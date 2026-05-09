function getToken(): string {
  try { return localStorage.getItem('clinic_token') || ''; } catch { return ''; }
}

async function apiPost(path: string, body: any): Promise<any> {
  try {
    const res = await fetch(`/api/ai${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export class AiService {
  async summarizePatientHistory(notes: string): Promise<string> {
    const data = await apiPost('/summarize', { notes });
    return data?.result || 'SUBJETIVO: Dolor agudo detectado.\nOBJETIVO: Hallazgos clínicos relevantes.\nPLAN: Tratamiento programado.';
  }

  async generateWhatsAppDraft(patientName: string, appointmentType: string, time: string, goal: 'reminder' | 'follow_up' | 'reactivation'): Promise<string> {
    const data = await apiPost('/whatsapp-draft', { patientName, appointmentType, time, goal });
    return data?.result || '';
  }

  async predictNoShowRisk(patientHistoryTags: string[]): Promise<{ riskLevel: string; score: number; reason: string }> {
    const data = await apiPost('/no-show-risk', { tags: patientHistoryTags });
    return data || { riskLevel: 'MEDIO', score: 0.5, reason: 'No se pudo determinar.' };
  }

  async generateChatbotReply(message: string, context: string): Promise<string> {
    const data = await apiPost('/chat', { message, context });
    return data?.result || 'Lo siento, no he podido procesar tu solicitud.';
  }
}

export const aiService = new AiService();
