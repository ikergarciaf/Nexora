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

export const PRICING_PLANS = {
  STARTER: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER || 'price_starter_mock_123',
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
    priceId: process.env.STRIPE_PRICE_PRO || 'price_pro_mock_456',
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
    priceId: process.env.STRIPE_PRICE_PREMIUM || 'price_premium_mock_789',
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
  const entries = Object.entries(PRICING_PLANS);
  for (const [key, plan] of entries) {
    if (plan.priceId === priceId) return key;
  }
  return null;
}
