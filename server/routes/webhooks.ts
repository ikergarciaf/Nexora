import { Router, raw } from 'express';
import { getStripe } from '../services/stripeService.ts';
import prisma from '../db.ts';

export const webhookRouter = Router();

// Stripe requires the raw body signature, so we use `express.raw` here BEFORE `express.json` parses it elsewhere
webhookRouter.post('/stripe', raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.warn('⚠️ Webhook called but Stripe Webhook Signature is missing.');
    return res.status(400).send('Webhook secret missing');
  }

  let event;
  try {
    const stripe = getStripe();
    // Verify cryptographic signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        if (session.mode === 'subscription') {
          // You could run logic here, though we rely on customer.subscription.updated mainly
          console.log(`Checkout Session Completed for Customer: ${session.customer}`);
        }
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const tenantId = subscription.metadata?.tenantId;
        const planKey = subscription.metadata?.planKey;
        
        if (tenantId) {
          await prisma.tenant.update({
            where: { id: tenantId },
            data: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              subscriptionStatus: subscription.status,
              subscriptionPlan: planKey || undefined,
              trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
            }
          });
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
              subscriptionStatus: 'canceled'
            }
          });
        }
        break;
      }
    }
    
    res.json({ received: true });
  } catch (dbError) {
    console.error('Webhook DB Sync Error:', dbError);
    res.status(500).send('Internal synchronization error');
  }
});
