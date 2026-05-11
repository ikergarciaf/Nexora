import { Router, raw } from 'express';
import { getStripe } from '../services/stripeService.ts';
import prisma from '../db.ts';
import logger from '../services/logger.ts';

export const webhookRouter = Router();

webhookRouter.post('/stripe', raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    logger.warn('Webhook called but Stripe Webhook Signature is missing.');
    return res.status(400).send('Webhook secret missing');
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    logger.error({ error: err.message }, 'Webhook signature verification failed');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        if (session.mode === 'subscription') {
          logger.info({ customer: session.customer, id: session.id }, 'Checkout session completed');
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const tenantId = subscription.metadata?.tenantId;
        const planKey = subscription.metadata?.planKey;

        if (tenantId) {
          const existing = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { trialEndsAt: true },
          });
          const stripeTrialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;
          const trialEndsAt = existing?.trialEndsAt && stripeTrialEnd && existing.trialEndsAt > stripeTrialEnd
            ? existing.trialEndsAt
            : stripeTrialEnd;

          await prisma.tenant.update({
            where: { id: tenantId },
            data: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              subscriptionStatus: subscription.status,
              subscriptionPlan: planKey || undefined,
              trialEndsAt,
            },
          });
          logger.info({ tenantId, status: subscription.status }, 'Subscription updated via webhook');
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const tenantId = subscription.metadata?.tenantId;

        if (tenantId) {
          await prisma.tenant.update({
            where: { id: tenantId },
            data: { subscriptionStatus: 'canceled' },
          });
          logger.info({ tenantId }, 'Subscription canceled via webhook');
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any;
        const tenantId = invoice.subscription_details?.metadata?.tenantId || invoice.metadata?.tenantId;

        if (tenantId) {
          await prisma.invoice.upsert({
            where: { id: invoice.id, tenantId },
            create: {
              id: invoice.id,
              tenantId,
              patientId: undefined,
              number: invoice.number || `STRIPE-${invoice.id.slice(0, 8)}`,
              amount: invoice.amount_paid / 100,
              currency: invoice.currency.toUpperCase(),
              status: 'PAID',
              description: `Subscription ${invoice.lines?.data?.[0]?.description || ''}`,
              issuedDate: new Date(invoice.created * 1000),
              paidAt: new Date(),
              stripeInvoiceId: invoice.id,
            },
            update: {
              status: 'PAID',
              paidAt: new Date(),
            },
          });
          logger.info({ tenantId, invoiceId: invoice.id }, 'Invoice paid via webhook');
        }
        break;
      }

      case 'invoice.payment_failed': {
        const failedInvoice = event.data.object as any;
        const failedTenantId = failedInvoice.subscription_details?.metadata?.tenantId || failedInvoice.metadata?.tenantId;

        if (failedTenantId) {
          logger.warn({ tenantId: failedTenantId, invoiceId: failedInvoice.id }, 'Invoice payment failed');
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const trialSub = event.data.object as any;
        const trialTenantId = trialSub.metadata?.tenantId;
        if (trialTenantId) {
          logger.info({ tenantId: trialTenantId }, 'Trial will end soon');
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (dbError) {
    logger.error({ error: dbError }, 'Webhook DB sync error');
    res.status(500).send('Internal synchronization error');
  }
});
