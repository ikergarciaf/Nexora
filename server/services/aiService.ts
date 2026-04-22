import { GoogleGenAI } from '@google/genai';

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
   * Summarize clinical notes to save doctor's time
   */
  async summarizePatientHistory(notes: string): Promise<string> {
    if (this.isMockMode || !this.ai) {
      return "Patient has had 3 cleanings in 12 months. Recommend preventive sealant for lower molars during today's visit.";
    }

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert clinical assistant. Provide a highly concise, 2-sentence summary of the following patient history. Focus purely on actionable insights for today's visit. \n\nHistory: ${notes}`,
    });
    
    return response.text || "Summary unavailable.";
  }

  /**
   * Generate a professional WhatsApp message
   */
  async generateWhatsAppDraft(patientName: string, appointmentType: string, time: string, goal: 'reminder' | 'follow_up' | 'reactivation'): Promise<string> {
    if (this.isMockMode || !this.ai) {
      const mocks = {
        reminder: `Hi ${patientName}, confirming your ${appointmentType} at ${time} today! Do you need directions to the clinic?`,
        follow_up: `Hi ${patientName}, just checking in to see how you feel after your ${appointmentType}. Let us know if you need anything!`,
        reactivation: `Hi ${patientName}, it's been a while! We noticed you haven't scheduled your next check-up. Would you like to see available times?`
      };
      return mocks[goal];
    }

    const goalPrompts = {
      reminder: 'a polite and warm appointment reminder',
      follow_up: 'a caring post-treatment follow-up to check on their recovery',
      reactivation: 'a gentle reactivation message for an inactive patient'
    };

    const prompt = `Write a short, engaging WhatsApp message for a dental clinic patient.
    Patient Name: ${patientName}
    Context: ${appointmentType} at ${time}. 
    Goal: Write ${goalPrompts[goal]}. 
    Constraint: Keep it under 250 characters, friendly but professional. Do not use placeholders like [Clinic Name], just speak directly.`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.replace(/"/g, '').trim() || "";
  }

  /**
   * Predict the No-Show probability based on historical tags and metrics
   */
  async predictNoShowRisk(patientHistoryTags: string[]): Promise<{ riskLevel: string, score: number, reason: string }> {
    if (this.isMockMode || !this.ai) {
      return { riskLevel: "HIGH", score: 0.82, reason: "Historical pattern indicates frequent rescheduling." };
    }

    const prompt = `Based on the following patient tags, predict the probability of a no-show for their next appointment. 
    Tags: ${patientHistoryTags.join(', ')}
    Format your response exactly as JSON like this: {"riskLevel": "LOW|MEDIUM|HIGH", "score": 0.0-1.0, "reason": "brief explanation"}`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      // Simple extraction of JSON from the response text (in case of markdown blocks)
      const jsonStr = response.text?.replace(/```json|```/g, '').trim() || "{}";
      const parsed = JSON.parse(jsonStr);
      return {
        riskLevel: parsed.riskLevel || "MEDIUM",
        score: parsed.score || 0.5,
        reason: parsed.reason || "Unable to determine precise reasoning."
      };
    } catch (e) {
      return { riskLevel: "MEDIUM", score: 0.5, reason: "Error computing risk." };
    }
  }
  /**
   * Draft a reactivation campaign strategy for a list of inactive patients
   */
  async draftReactivationStrategy(patients: any[]): Promise<string> {
    if (this.isMockMode || !this.ai) {
      return "Based on the " + patients.length + " inactive patients found, send a 'We Miss You' discount on teeth whitening via WhatsApp next Tuesday at 10 AM.";
    }

    const patientProfiles = patients.map(p => p.tags || "No specific tags").join("; ");
    const prompt = `You are a dental clinic marketing expert. I have ${patients.length} inactive patients.
    Their historical tags: ${patientProfiles}
    Write a 2-3 sentence highly effective reactivation strategy via WhatsApp to get them back in the chair.`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Strategy unavailable.";
  }
}

// Export a singleton instance
export const aiService = new AiService();
