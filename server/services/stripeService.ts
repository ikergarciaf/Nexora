import Stripe from 'stripe';
import logger from './logger.ts';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      logger.warn('STRIPE_SECRET_KEY environment variable is missing.');
    }
    stripeClient = new Stripe(key || '', {
      apiVersion: '2025-01-27.acacia' as any,
      maxNetworkRetries: 3,
      timeout: 30000,
    });
  }
  return stripeClient;
}

export type BillingInterval = 'month' | 'year';

export interface PlanConfig {
  name: string;
  priceIds: Record<BillingInterval, string>;
  features: string[];
}

export const PRICING_PLANS: Record<string, PlanConfig> = {
  STARTER: {
    name: 'Starter',
    priceIds: {
      month: process.env.STRIPE_PRICE_STARTER || 'price_starter_month_mock',
      year: process.env.STRIPE_PRICE_STARTER_YEAR || 'price_starter_year_mock',
    },
    features: [
      'Gestión de pacientes ilimitada',
      'Agenda inteligente',
      'Historial clínico digital',
      'Recordatorios automáticos',
      'Facturación básica',
      '1 profesional',
    ],
  },
  PRO: {
    name: 'Pro',
    priceIds: {
      month: process.env.STRIPE_PRICE_PRO || 'price_pro_month_mock',
      year: process.env.STRIPE_PRICE_PRO_YEAR || 'price_pro_year_mock',
    },
    features: [
      'Todo lo de Starter',
      'Hasta 5 profesionales',
      'IA generativa',
      'Asistente IA en WhatsApp',
      'Firma digital',
      'Facturación avanzada + Stripe',
      'Campañas de email marketing',
      'Gestión de inventario',
      'Soporte prioritario',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    priceIds: {
      month: process.env.STRIPE_PRICE_PREMIUM || 'price_premium_month_mock',
      year: process.env.STRIPE_PRICE_PREMIUM_YEAR || 'price_premium_year_mock',
    },
    features: [
      'Todo lo de Pro',
      'Profesionales ilimitados',
      'Web médica personalizada',
      'Reserva online pública',
      'SEO local premium',
      'Portal del paciente',
      'Panel de análisis',
      'Soporte dedicado 24/7',
    ],
  },
};

export function getPlanByPriceId(priceId: string): string | null {
  for (const [key, plan] of Object.entries(PRICING_PLANS)) {
    if (Object.values(plan.priceIds).includes(priceId)) return key;
  }
  return null;
}
