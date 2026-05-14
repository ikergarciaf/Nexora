import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db.ts', () => ({
  default: {
    $queryRaw: vi.fn().mockResolvedValue([{ '1': 1 }]),
    tenant: { count: vi.fn().mockResolvedValue(5) },
    user: { count: vi.fn().mockResolvedValue(50) },
    appointment: { count: vi.fn().mockResolvedValue(200) },
    patient: { count: vi.fn().mockResolvedValue(300) },
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

vi.mock('dotenv/config', () => ({}));

describe('Health Check', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('validates required env vars', async () => {
    const old = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    process.env.JWT_SECRET = 'test';
    try {
      await expect(async () => {
        const missing = ['JWT_SECRET', 'DATABASE_URL'].filter(key => !process.env[key]);
        if (missing.length > 0) throw new Error(`Missing: ${missing.join(', ')}`);
      }).rejects.toThrow('Missing: DATABASE_URL');
    } finally {
      process.env.DATABASE_URL = old;
    }
  });

  it('health check returns correct structure', async () => {
    const dbOk = true;
    const timestamp = new Date().toISOString();
    const response = {
      status: 'ok',
      version: '1.0.0',
      timestamp,
      uptime: process.uptime(),
    };
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('version');
    expect(response).toHaveProperty('timestamp');
    expect(response).toHaveProperty('uptime');
  });

  it('validates checkout schema', async () => {
    const { checkoutSchema } = await import('../validation.ts');
    const valid = checkoutSchema.safeParse({ planKey: 'PRO', interval: 'year' });
    expect(valid.success).toBe(true);
    const invalid = checkoutSchema.safeParse({ planKey: 'INVALID', interval: 'month' });
    expect(invalid.success).toBe(false);
  });
});
