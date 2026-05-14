import { Router, raw } from 'express';
import { getStripe } from '../services/stripeService.ts';
import prisma from '../db.ts';
import logger from '../services/logger.ts';

export const webhookRouter = Router();

const processedEvents = new Set<string>();
const PROCESSED_EVENT_TTL = 60 * 60 * 1000;

setInterval(() => {
  if (processedEvents.size > 10000) processedEvents.clear();
}, PROCESSED_EVENT_TTL);

function isEventProcessed(eventId: string): boolean {
  if (processedEvents.has(eventId)) return true;
  processedEvents.add(eventId);
  if (processedEvents.size > 10000) {
    const iterator = processedEvents.values();
    for (let i = 0; i < 1000; i++) {
      const val = iterator.next();
      if (val.done) break;
      processedEvents.delete(val.value);
    }
  }
  return false;
}

webhookRouter.post('/stripe', raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    logger.warn('Webhook called but Stripe webhook secret is missing');
    return res.status(400).send('Webhook secret missing');
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
  } catch (err: any) {
    logger.error({ error: err.message }, 'Webhook signature verification failed');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (isEventProcessed(event.id)) {
    logger.info({ eventId: event.id, type: event.type }, 'Webhook already processed, skipping');
    return res.json({ received: true, deduplicated: true });
  }

  try {
    const stripe = getStripe();

    switch (event.type) {
      case 'customer.updated': {
        const customer = event.data.object as any;
        const tenantId = customer.metadata?.tenantId;
        if (tenantId) {
          await prisma.tenant.update({
            where: { id: tenantId },
            data: {
              name: customer.name || undefined,
              contactEmail: customer.email || undefined,
              contactPhone: customer.phone || undefined,
              address: customer.address?.line1 || undefined,
            },
          }).catch(() => {});
          logger.info({ tenantId }, 'Customer details synced from Stripe');
        }
        break;
      }
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        if (session.mode === 'subscription') {
          logger.info({ customer: session.customer, id: session.id, subscription: session.subscription }, 'Checkout session completed');
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const tenantId = subscription.metadata?.tenantId;
        const planKey = subscription.metadata?.planKey;
        const interval = subscription.metadata?.interval || 'month';

        if (tenantId) {
          const subscriptionId = subscription.id;
          const priceId = subscription.items?.data?.[0]?.price?.id;
          const status = subscription.status;
          const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;

          const existing = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { trialEndsAt: true },
          });

          const trialEndsAt = existing?.trialEndsAt && trialEnd && existing.trialEndsAt > trialEnd
            ? existing.trialEndsAt
            : trialEnd;

          await prisma.tenant.update({
            where: { id: tenantId },
            data: {
              stripeSubscriptionId: subscriptionId,
              stripePriceId: priceId || undefined,
              subscriptionStatus: status,
              subscriptionPlan: planKey || undefined,
              trialEndsAt,
            },
          });
          logger.info({ tenantId, status, plan: planKey, interval }, 'Subscription updated via webhook');
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const tenantId = subscription.metadata?.tenantId;

        if (tenantId) {
          await prisma.tenant.update({
            where: { id: tenantId },
            data: {
              subscriptionStatus: 'canceled',
              stripeSubscriptionId: null,
              stripePriceId: null,
            },
          });
          logger.info({ tenantId }, 'Subscription canceled via webhook');
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any;
        const tenantId = invoice.subscription_details?.metadata?.tenantId || invoice.metadata?.tenantId;
        const stripeInvoiceId = invoice.id;

        if (tenantId && stripeInvoiceId) {
          const existingInvoice = await prisma.invoice.findUnique({
            where: { stripeInvoiceId },
          });

          if (!existingInvoice) {
            await prisma.invoice.create({
              data: {
                id: `inv_${stripeInvoiceId.slice(0, 24)}`,
                tenantId,
                number: invoice.number || `STRIPE-${stripeInvoiceId.slice(0, 8)}`,
                amount: invoice.amount_paid / 100,
                currency: invoice.currency.toUpperCase(),
                status: 'PAID',
                description: `Suscripción ${invoice.lines?.data?.[0]?.description || ''}`,
                issuedDate: new Date(invoice.created * 1000),
                paidAt: new Date(),
                stripeInvoiceId,
              },
            });
          } else {
            await prisma.invoice.update({
              where: { stripeInvoiceId },
              data: { status: 'PAID', paidAt: new Date() },
            });
          }
          logger.info({ tenantId, invoiceId: stripeInvoiceId }, 'Invoice paid via webhook');
        }
        break;
      }

      case 'invoice.payment_failed': {
        const failedInvoice = event.data.object as any;
        const failedTenantId = failedInvoice.subscription_details?.metadata?.tenantId || failedInvoice.metadata?.tenantId;

        if (failedTenantId) {
          logger.warn({ tenantId: failedTenantId, invoiceId: failedInvoice.id }, 'Invoice payment failed');

          await prisma.tenant.update({
            where: { id: failedTenantId },
            data: { subscriptionStatus: 'past_due' },
          });

          await (stripe.invoices as any).retrieveUpcoming({
            subscription: failedInvoice.subscription,
          }).catch(() => {});
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const trialSub = event.data.object as any;
        const trialTenantId = trialSub.metadata?.tenantId;
        if (trialTenantId) {
          logger.info({ tenantId: trialTenantId }, 'Trial will end soon');
          const tenant = await prisma.tenant.findUnique({ where: { id: trialTenantId }, select: { name: true, contactEmail: true } });
          if (tenant?.contactEmail) {
            const { sendEmail } = await import('../services/emailService.ts');
            sendEmail({
              to: tenant.contactEmail,
              subject: 'Tu prueba gratuita de Nexora está terminando',
              text: `Hola,\n\nTu prueba gratuita de Nexora está por terminar. Para seguir usando todas las funciones, selecciona un plan.\n\n— Nexora`,
              html: `<p>Hola,</p><p>Tu prueba gratuita de <strong>Nexora</strong> está por terminar. Para seguir usando todas las funciones, selecciona un plan.</p><p>— Nexora</p>`,
            }).catch(err => logger.error({ error: err }, 'Failed to send trial ending email'));
          }
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (dbError) {
    logger.error({ error: dbError, eventId: event.id, type: event.type }, 'Webhook DB sync error');
    res.status(500).send('Internal synchronization error');
  }
});
