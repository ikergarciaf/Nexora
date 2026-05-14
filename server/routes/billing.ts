import { Router } from 'express';
import { requireAuth, getTenantId } from '../middlewares/auth.ts';
import { getStripe, PRICING_PLANS, BillingInterval } from '../services/stripeService.ts';
import prisma from '../db.ts';
import logger from '../services/logger.ts';
import { validate, checkoutSchema } from '../validation.ts';

export const billingRouter = Router();

billingRouter.use(requireAuth);

billingRouter.post('/checkout', validate(checkoutSchema), async (req, res) => {
  try {
    const { planKey, interval = 'month' } = req.body;
    let tenantId: string;
    try { tenantId = getTenantId(req); } catch {
      return res.status(400).json({ error: 'Selecciona una clínica primero' });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return res.status(503).json({ error: 'Pasarela de pago no disponible. Inténtalo más tarde.' });
    }

    const stripe = getStripe();
    const plan = PRICING_PLANS[planKey as keyof typeof PRICING_PLANS];
    if (!plan) return res.status(400).json({ error: 'Plan no válido' });

    const validInterval: BillingInterval = interval === 'year' ? 'year' : 'month';
    const priceId = plan.priceIds[validInterval];
    if (!priceId) return res.status(400).json({ error: `No hay precio configurado para el plan ${planKey} en modalidad ${validInterval}` });

    let tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ error: 'Clínica no encontrada' });

    if (!tenant.stripeCustomerId) {
      const customer = await stripe.customers.create({
        metadata: { tenantId },
        name: tenant.name || undefined,
        email: tenant.contactEmail || undefined,
        phone: tenant.contactPhone || undefined,
        address: tenant.address ? {
          line1: tenant.address,
          country: 'ES',
        } : undefined,
      });
      tenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: { stripeCustomerId: customer.id },
      });
    } else {
      await stripe.customers.update(tenant.stripeCustomerId, {
        metadata: { tenantId },
        name: tenant.name || undefined,
        email: tenant.contactEmail || undefined,
        phone: tenant.contactPhone || undefined,
      }).catch(() => {});
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const trialDays = !tenant.stripeSubscriptionId && (!tenant.trialEndsAt || new Date() < new Date(tenant.trialEndsAt)) ? 14 : 0;

    const paymentMethods = process.env.STRIPE_PAYMENT_METHODS
      ? process.env.STRIPE_PAYMENT_METHODS.split(',').map(s => s.trim()).filter(Boolean)
      : ['card'];

    const sessionParams: any = {
      customer: tenant.stripeCustomerId!,
      mode: 'subscription',
      payment_method_types: paymentMethods,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { tenantId, planKey, interval: validInterval },
      },
      customer_update: {
        name: 'auto',
        address: 'auto',
      },
      billing_address_collection: 'required',
      tax_id_collection: { enabled: true },
      consent_collection: {
        terms_of_service: 'required',
      },
      success_url: `${appUrl}/dashboard?purchase=success&plan=${planKey}&interval=${validInterval}`,
      cancel_url: `${appUrl}/pricing?purchase=canceled`,
    };

    if (trialDays > 0) {
      sessionParams.subscription_data.trial_period_days = trialDays;
    }

    if (tenant.stripeSubscriptionId) {
      const existingSubscriptions = await stripe.subscriptions.list({
        customer: tenant.stripeCustomerId!,
        status: 'active',
        limit: 1,
      });
      if (existingSubscriptions.data.length > 0) {
        const subscription = await stripe.subscriptions.retrieve(existingSubscriptions.data[0].id);
        const currentPriceId = subscription.items.data[0].price.id;
        if (currentPriceId !== priceId) {
          const portalSession = await stripe.billingPortal.sessions.create({
            customer: tenant.stripeCustomerId!,
            return_url: `${appUrl}/dashboard`,
          });
          res.json({ url: portalSession.url, portal: true });
          return;
        }
      }
    }

    const idempotencyKey = `checkout_${tenantId}_${planKey}_${validInterval}_${Date.now()}`;
    const session = await stripe.checkout.sessions.create(sessionParams, {
      idempotencyKey,
    });

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { subscriptionPlan: planKey },
    });

    res.json({ url: session.url });
  } catch (error) {
    logger.error({ error }, 'Stripe checkout error');
    res.status(500).json({ error: 'Error al iniciar el pago' });
  }
});

billingRouter.post('/portal', async (req, res) => {
  try {
    let tenantId: string;
    try { tenantId = getTenantId(req); } catch {
      return res.status(400).json({ error: 'Selecciona una clínica primero' });
    }

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

billingRouter.get('/subscription', async (req, res) => {
  try {
    let tenantId: string;
    try { tenantId = getTenantId(req); } catch {
      return res.status(400).json({ error: 'Selecciona una clínica primero' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        subscriptionPlan: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
      },
    });
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    res.json(tenant);
  } catch (error) {
    logger.error({ error }, 'Get subscription error');
    res.status(500).json({ error: 'Error al obtener suscripción' });
  }
});

billingRouter.get('/plans', async (_req, res) => {
  const plans = Object.entries(PRICING_PLANS).map(([key, plan]) => ({
    key,
    name: plan.name,
    priceIds: plan.priceIds,
    features: plan.features,
  }));
  res.json(plans);
});
