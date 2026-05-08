import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      console.warn("⚠️ STRIPE_SECRET_KEY environment variable is missing.");
    }
    stripeClient = new Stripe(key || 'mock_key', {
      // @ts-expect-error Types might mismatch depending on local stripe package version
      apiVersion: '2025-01-27.acacia',
    });
  }
  return stripeClient;
}

// Ensure these match your actual Stripe Dashboard Price IDs
export const PRICING_PLANS = {
  STARTER: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER || 'price_starter_mock_123',
    features: ['1 Practitioner', 'Basic Scheduling', 'Email Reminders']
  },
  PRO: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_PRO || 'price_pro_mock_456',
    features: ['3 Practitioners', 'AI Insights', 'WhatsApp Automation']
  },
  PREMIUM: {
    name: 'Premium',
    priceId: process.env.STRIPE_PRICE_PREMIUM || 'price_premium_mock_789',
    features: ['Unlimited Practitioners', 'Custom AI Models', 'Priority Support']
  }
};
