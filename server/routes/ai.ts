import { Router } from 'express';
import { aiService } from '../services/aiService.ts';
import { requireAuth } from '../middlewares/auth.ts';
import prisma from '../db.ts';

export const aiRouter = Router();

// Mandatory Multi-Tenant Security
aiRouter.use(requireAuth);

/**
 * 1. PATIENT SUMMARY (With Caching for Cost Reduction)
 */
aiRouter.post('/summary', async (req, res) => {
  try {
    const { patientId, notes } = req.body;
    if (!notes && !patientId) return res.status(400).json({ error: 'Patient ID or notes required' });

    // Fallback if DB isn't running
    if (!process.env.DATABASE_URL || !patientId) {
      const summary = await aiService.summarizePatientHistory(notes);
      return res.json({ summary });
    }

    // COST REDUCTION: DB Caching Check
    const patient = await prisma.patient.findUnique({
      where: { id: patientId, tenantId: req.user!.tenantId }
    });

    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    // If cache exists and is fresh (< 24 hours old), do not hit Gemini!
    const cacheAgeThresold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (patient.aiSummary && patient.cachedAt && patient.cachedAt > cacheAgeThresold) {
      console.log(`[AI Cache Hit] Returned saved summary for ${patientId}`);
      return res.json({ summary: patient.aiSummary, cached: true });
    }

    // 2. Generate New Summary
    const textToSummarize = notes || patient.medicalHistoryNotes || "Standard historical checkup";
    const summary = await aiService.summarizePatientHistory(textToSummarize);

    // 3. Save to DB strictly isolating by Tenant
    await prisma.patient.update({
      where: { id: patient.id },
      data: {
        aiSummary: summary,
        cachedAt: new Date()
      }
    });

    res.json({ summary, cached: false });
  } catch (error) {
    console.error('AI Summary Error:', error);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

/**
 * 2. CRM OUTREACH DRAFTING
 */
aiRouter.post('/whatsapp-draft', async (req, res) => {
  try {
    const { patientName, appointmentType, time, goal } = req.body;
    
    if (!patientName || !goal) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const draft = await aiService.generateWhatsAppDraft(patientName, appointmentType, time, goal);
    
    // (Optional) We could cache this draft inside an `OutreachLog` table here
    res.json({ draft });
  } catch (error) {
    console.error('AI Draft Error:', error);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

/**
 * 3. NO-SHOW PREDICTION (Hooked to Appointment Save)
 */
aiRouter.post('/predict-risk', async (req, res) => {
  try {
    const { tags, appointmentId } = req.body;
    const prediction = await aiService.predictNoShowRisk(tags || []);
    
    // Cost Reduction: Save to DB
    if (process.env.DATABASE_URL && appointmentId) {
      await prisma.appointment.update({
        where: { id: appointmentId, tenantId: req.user!.tenantId },
        data: {
          aiConflictScore: prediction.score,
          aiAlertReason: prediction.reason
        }
      });
    }

    res.json(prediction);
  } catch (error) {
    console.error('AI Risk Error:', error);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

/**
 * 4. DETECT INACTIVE PATIENTS & BUILD CAMPAIGN
 * Business Logic Pattern: DB Filtering -> AI Strategy Generation
 */
aiRouter.get('/inactive-campaign', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.json({ strategy: "Mock DB mode. Connect Postgres to find real inactive patients." });
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // 1. Fast, Deterministic Database Query (Do not use AI for Search!)
    const inactivePatients = await prisma.patient.findMany({
      where: {
        tenantId: req.user!.tenantId,
        // Has no appointments that occur AFTER sixMonthsAgo
        appointments: {
          none: {
            startTime: { gte: sixMonthsAgo }
          }
        }
      },
      select: { fullName: true, lastVisit: true, tags: true },
      take: 10 // Limit context window
    });

    if (inactivePatients.length === 0) {
      return res.json({ message: "Great news! No inactive patients found." });
    }

    // 2. Value-Add AI Generation
    const strategy = await aiService.draftReactivationStrategy(inactivePatients);
    res.json({ targetCount: inactivePatients.length, strategy });

  } catch (error) {
     console.error('AI Strategy Error:', error);
     res.status(500).json({ error: 'Failed to generate campaign.' });
  }
});
