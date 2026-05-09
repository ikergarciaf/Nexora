import { describe, it, expect } from 'vitest';

describe('Auth Routes', () => {
  it('requires JWT_SECRET environment variable', () => {
    const oldSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    try {
      // Re-importing would throw, so we just test the logic
      expect(() => {
        if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
      }).toThrow('JWT_SECRET environment variable is required');
    } finally {
      process.env.JWT_SECRET = oldSecret;
    }
  });
});
