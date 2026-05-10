import { describe, it, expect } from 'vitest';

describe('isValidJSON', () => {
  const isValidJSON = (str: string) => { try { JSON.parse(str); return true; } catch { return false; } };

  it('accepts valid JSON object', () => {
    expect(isValidJSON('{"key":"value"}')).toBe(true);
  });

  it('accepts valid JSON array', () => {
    expect(isValidJSON('[1,2,3]')).toBe(true);
  });

  it('rejects invalid JSON string', () => {
    expect(isValidJSON('not json')).toBe(false);
  });

  it('rejects truncated JSON', () => {
    expect(isValidJSON('{"key":"val')).toBe(false);
  });
});

describe('sanitize', () => {
  const sanitize = (str: string) => str.replace(/[<>&"']/g, '');

  it('removes HTML tags', () => {
    expect(sanitize('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script');
  });

  it('removes angle brackets', () => {
    expect(sanitize('<<>>')).toBe('');
  });

  it('keeps normal text unchanged', () => {
    expect(sanitize('hello world')).toBe('hello world');
  });
});
