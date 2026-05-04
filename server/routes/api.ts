import { Router } from 'express';
import { patientRouter } from './patients.ts';
import { appointmentRouter } from './appointments.ts';
import { aiRouter } from './ai.ts';
import { authRouter } from './auth.ts';
import { billingRouter } from './billing.ts';
import { dashboardRouter } from './dashboard.ts';
import { staffRouter } from './staff.ts';
import { whatsappRouter } from './whatsapp.ts';
import { tenantRouter } from './tenant.ts';
import { clinicRouter } from './clinic.ts';
import { webDevRouter } from './webdev.ts';
import { smsRouter } from './sms.ts';
import { requireActiveSubscription } from '../middlewares/subscription.ts';

import { requireAuth } from '../middlewares/auth.ts';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter); // Fully open public endpoints (Login/Register)
apiRouter.use('/billing', billingRouter); // Handles Stripe Checkout & Portals
apiRouter.use('/whatsapp', whatsappRouter); // WhatsApp integration bot
apiRouter.use('/clinic', clinicRouter); // Public clinic info (minimal)

// The following routes are only accessible to Authenticated Clinics with active trials or subscriptions!
const enforceBilling = process.env.NODE_ENV === 'production' ? requireActiveSubscription : requireActiveSubscription;
// Added to the router chain
apiRouter.use('/dashboard', requireAuth, enforceBilling, dashboardRouter);
apiRouter.use('/patients', requireAuth, enforceBilling, patientRouter);
apiRouter.use('/appointments', requireAuth, enforceBilling, appointmentRouter);
apiRouter.use('/ai', requireAuth, enforceBilling, aiRouter);
apiRouter.use('/staff', requireAuth, enforceBilling, staffRouter);
apiRouter.use('/tenant', requireAuth, enforceBilling, tenantRouter);
apiRouter.use('/webdev', requireAuth, enforceBilling, webDevRouter); // Web development requests
apiRouter.use('/sms', requireAuth, enforceBilling, smsRouter); // SMS notifications

apiRouter.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '1.0.0', 
    message: 'ClinicSaaS Platform API is online' 
  });
});
