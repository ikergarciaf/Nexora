import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db.ts', () => ({
  default: {
    tenant: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}));

vi.mock('../services/logger.ts', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('Billing / Subscription', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('validates checkout schema correctly', async () => {
    const { checkoutSchema } = await import('../validation.ts');
    const validMonth = checkoutSchema.safeParse({ planKey: 'STARTER', interval: 'month' });
    expect(validMonth.success).toBe(true);

    const validYear = checkoutSchema.safeParse({ planKey: 'PRO', interval: 'year' });
    expect(validYear.success).toBe(true);

    const validPremium = checkoutSchema.safeParse({ planKey: 'PREMIUM' });
    expect(validPremium.success).toBe(true);
    if (validPremium.success) {
      expect(validPremium.data.interval).toBe('month');
    }
  });

  it('rejects invalid plan keys', async () => {
    const { checkoutSchema } = await import('../validation.ts');
    const result = checkoutSchema.safeParse({ planKey: 'INVALID', interval: 'month' });
    expect(result.success).toBe(false);
  });

  it('PRICING_PLANS has correct structure', async () => {
    const { PRICING_PLANS } = await import('../services/stripeService.ts');
    expect(PRICING_PLANS).toHaveProperty('STARTER');
    expect(PRICING_PLANS).toHaveProperty('PRO');
    expect(PRICING_PLANS).toHaveProperty('PREMIUM');

    for (const [key, plan] of Object.entries(PRICING_PLANS)) {
      expect(plan).toHaveProperty('name');
      expect(plan).toHaveProperty('priceIds');
      expect(plan.priceIds).toHaveProperty('month');
      expect(plan.priceIds).toHaveProperty('year');
      expect(Array.isArray(plan.features)).toBe(true);
    }
  });

  it('getPlanByPriceId returns correct plan', async () => {
    const { getPlanByPriceId, PRICING_PLANS } = await import('../services/stripeService.ts');
    const proMonthPriceId = PRICING_PLANS.PRO.priceIds.month;
    const result = getPlanByPriceId(proMonthPriceId);
    expect(result).toBe('PRO');
  });

  it('requireActiveSubscription blocks without active sub', async () => {
    const { requireActiveSubscription } = await import('../middlewares/subscription.ts');
    const req = { user: { tenantId: 'tenant-1', isSuperAdmin: false, subscriptionStatus: 'canceled', trialEndsAt: null } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const next = vi.fn();
    
    await requireActiveSubscription(req, res, next);
    expect(res.status).toHaveBeenCalledWith(402);
    expect(next).not.toHaveBeenCalled();
  });

  it('requireActiveSubscription allows trial', async () => {
    const { requireActiveSubscription } = await import('../middlewares/subscription.ts');
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const req = { user: { tenantId: 'tenant-1', isSuperAdmin: false, subscriptionStatus: 'trialing', trialEndsAt: futureDate } } as any;
    const res = {} as any;
    const next = vi.fn();
    
    await requireActiveSubscription(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('requireActiveSubscription allows superadmin', async () => {
    const { requireActiveSubscription } = await import('../middlewares/subscription.ts');
    const req = { user: { tenantId: 'any-tenant', isSuperAdmin: true } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const next = vi.fn();
    
    await requireActiveSubscription(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
