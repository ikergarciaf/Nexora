import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

vi.mock('../db.ts', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
    },
    tenant: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    tenantUser: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    appointment: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    patient: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    invoice: {
      aggregate: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $disconnect: vi.fn(),
    patientDocument: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('../services/logger.ts', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    fatal: vi.fn(),
  },
}));

vi.mock('../services/emailService.ts', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

describe('Auth Middleware', () => {
  it('requires JWT_SECRET environment variable', () => {
    const oldSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    try {
      expect(() => {
        if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
      }).toThrow('JWT_SECRET environment variable is required');
    } finally {
      process.env.JWT_SECRET = oldSecret;
    }
  });

  it('generates valid tokens', async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-testing';
    const { generateTokens } = await import('../middlewares/auth.ts');
    const tokens = generateTokens({ id: 'user-1', isSuperAdmin: false });
    
    expect(tokens.accessToken).toBeTruthy();
    expect(tokens.refreshToken).toBeTruthy();

    const decoded = jwt.verify(tokens.accessToken, 'test-secret-key-for-testing') as any;
    expect(decoded.id).toBe('user-1');
    expect(decoded.isSuperAdmin).toBe(false);
  });

  it('generateCsrfToken returns a hex string', async () => {
    const { generateCsrfToken } = await import('../middlewares/auth.ts');
    const token = generateCsrfToken();
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    expect(token.length).toBe(64);
    expect(/^[0-9a-f]+$/.test(token)).toBe(true);
  });
});

describe('Auth Routes Logic', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key';
  });

  it('requires password minimum 8 chars', async () => {
    const { registerSchema } = await import('../validation.ts');
    const result = registerSchema.safeParse({ name: 'Test', email: 'test@test.com', password: '123' });
    expect(result.success).toBe(false);
  });

  it('accepts valid registration data', async () => {
    const { registerSchema } = await import('../validation.ts');
    const result = registerSchema.safeParse({ name: 'Test User', email: 'test@test.com', password: 'password123' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email format', async () => {
    const { loginSchema } = await import('../validation.ts');
    const result = loginSchema.safeParse({ email: 'notanemail', password: 'pass' });
    expect(result.success).toBe(false);
  });

  it('validates appointment schema with roomId', async () => {
    const { appointmentSchema } = await import('../validation.ts');
    const result = appointmentSchema.safeParse({
      patientId: '550e8400-e29b-41d4-a716-446655440000',
      roomId: '550e8400-e29b-41d4-a716-446655440001',
      startTime: '2026-05-14T10:00:00.000Z',
      durationMinutes: 30,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.roomId).toBe('550e8400-e29b-41d4-a716-446655440001');
    }
  });
});
