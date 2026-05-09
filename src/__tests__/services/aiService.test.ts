import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiService } from '../../services/aiService';

describe('AiService', () => {
  const service = new AiService();

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('returns fallback summary on network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    const result = await service.summarizePatientHistory('test notes');
    expect(result).toContain('SUBJETIVO');
  });

  it('returns fallback risk on network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    const result = await service.predictNoShowRisk(['tag1']);
    expect(result.riskLevel).toBe('MEDIO');
  });
});
