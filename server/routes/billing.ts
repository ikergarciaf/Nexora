import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.ts';
import { getStripe, PRICING_PLANS } from '../services/stripeService.ts';
import prisma from '../db.ts';
import logger from '../services/logger.ts';

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

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return res.status(503).json({ error: 'Pasarela de pago no disponible. Inténtalo más tarde.' });
    }

    const stripe = getStripe();
    const plan = PRICING_PLANS[planKey as keyof typeof PRICING_PLANS];
    if (!plan) return res.status(400).json({ error: 'Plan no válido' });

    let tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ error: 'Clínica no encontrada' });

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

    // Optimistically update the tenant's plan (webhook will confirm)
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { subscriptionPlan: planKey },
    });

    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: tenant.stripeCustomerId!,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { tenantId, planKey }
      },
      success_url: `${appUrl}/dashboard?purchase=success`,
      cancel_url: `${appUrl}/?purchase=canceled`,
    });

    res.json({ url: session.url });
  } catch (error) {
    logger.error({ error }, 'Stripe checkout error');
    res.status(500).json({ error: 'Error al iniciar el pago' });
  }
});

/**
 * Creates a Stripe portal link for users to self-manage cards & plans
 */
billingRouter.post('/portal', async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: 'Pasarela de pago no disponible.' });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant || !tenant.stripeCustomerId) {
      return res.status(400).json({ error: 'No hay un cliente de Stripe activo.' });
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${appUrl}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (error) {
    logger.error({ error }, 'Stripe portal error');
    res.status(500).json({ error: 'Error al generar el enlace del portal' });
  }
});
