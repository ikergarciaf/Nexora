import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/logger.ts', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('CSRF Protection', () => {
  let csrfProtection: any;
  let generateCsrfToken: any;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret';
    const mod = await import('../middlewares/auth.ts');
    csrfProtection = mod.csrfProtection;
    generateCsrfToken = mod.generateCsrfToken;
  });

  it('skips validation for GET requests', () => {
    const req = { method: 'GET' } as any;
    const res = {} as any;
    const next = vi.fn();
    csrfProtection(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('skips validation for HEAD requests', () => {
    const req = { method: 'HEAD' } as any;
    const res = {} as any;
    const next = vi.fn();
    csrfProtection(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects POST without CSRF tokens', () => {
    const req = { method: 'POST', cookies: {}, headers: {} } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();
    csrfProtection(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'CSRF token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects POST when cookie and header mismatch', () => {
    const req = {
      method: 'POST',
      cookies: { nexora_csrf: 'valid-token' },
      headers: { 'x-csrf-token': 'wrong-token' },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();
    csrfProtection(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows POST when CSRF tokens match', () => {
    const req = {
      method: 'POST',
      cookies: { nexora_csrf: 'matching-token' },
      headers: { 'x-csrf-token': 'matching-token' },
    } as any;
    const res = {} as any;
    const next = vi.fn();
    csrfProtection(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('generateCsrfToken produces unique tokens', () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();
    expect(token1).not.toBe(token2);
    expect(token1.length).toBe(64);
  });
});
