import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.ts';
import { getStripe, PRICING_PLANS } from '../services/stripeService.ts';
import prisma from '../db.ts';

export const billingRouter = Router();

billingRouter.use(requireAuth);

/**
 * Initiates a Stripe Checkout Session for a specific plan upgrade.
 * Supports a 7-day trial period if not already leveraged.
 */
billingRouter.post('/checkout', async (req, res) => {
  try {
    const { planKey } = req.body; // 'STARTER', 'PRO', 'PREMIUM'
    const tenantId = req.user!.tenantId;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(200).json({ url: '/mock-checkout-success-redirect' });
    }

    const stripe = getStripe();
    const plan = PRICING_PLANS[planKey as keyof typeof PRICING_PLANS];
    if (!plan) return res.status(400).json({ error: 'Invalid Plan Type' });

    let tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    // Ensure Stripe Customer exists for this Tenant
    if (!tenant.stripeCustomerId) {
      const customer = await stripe.customers.create({
        metadata: { tenantId },
      });
      tenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: { stripeCustomerId: customer.id }
      });
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: tenant.stripeCustomerId!,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7, // Native 7 day trial integration
        metadata: { tenantId, planKey }
      },
      success_url: `${appUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * Creates a Stripe portal link for users to self-manage cards & plans
 */
billingRouter.post('/portal', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(200).json({ url: '/mock-portal-redirect' });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant || !tenant.stripeCustomerId) {
      return res.status(400).json({ error: 'No active Stripe customer found.' });
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${appUrl}/billing`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Portal Error:', error);
    res.status(500).json({ error: 'Failed to generate portal link' });
  }
});
