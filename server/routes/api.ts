import { Router } from 'express';
import { patientRouter } from './patients.ts';
import { appointmentRouter } from './appointments.ts';
import { tenantRouter } from './tenant.ts';
import { clinicRouter } from './clinic.ts';
import { authRouter } from './auth.ts';
import { billingRouter } from './billing.ts';
import { dashboardRouter } from './dashboard.ts';
import { staffRouter } from './staff.ts';
import { aiRouter } from './ai.ts';
import { whatsappRouter } from './whatsapp.ts';
import { treatmentRouter } from './treatments.ts';
import { invoiceRouter } from './invoices.ts';
import { adminRouter } from './admin.ts';
import { importRouter } from './import.ts';
import { consentRouter } from './consents.ts';
import { requireActiveSubscription } from '../middlewares/subscription.ts';

import { requireAuth } from '../middlewares/auth.ts';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/billing', billingRouter);
apiRouter.use('/whatsapp', whatsappRouter);
apiRouter.use('/clinic', clinicRouter);

const enforceBilling = process.env.NODE_ENV === 'production' ? requireActiveSubscription : (_req: any, _res: any, next: any) => next();

apiRouter.use('/dashboard', requireAuth, enforceBilling, dashboardRouter);
apiRouter.use('/patients', requireAuth, enforceBilling, patientRouter);
apiRouter.use('/appointments', requireAuth, enforceBilling, appointmentRouter);
apiRouter.use('/staff', requireAuth, enforceBilling, staffRouter);
apiRouter.use('/tenant', requireAuth, enforceBilling, tenantRouter);
apiRouter.use('/treatments', requireAuth, enforceBilling, treatmentRouter);
apiRouter.use('/invoices', requireAuth, enforceBilling, invoiceRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/admin', requireAuth, adminRouter);
apiRouter.use('/import', requireAuth, enforceBilling, importRouter);
apiRouter.use('/consents', requireAuth, enforceBilling, consentRouter);

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    message: 'ClinicSaaS Platform API is online'
  });
});
