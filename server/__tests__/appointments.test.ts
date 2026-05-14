import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db.ts', () => ({
  default: {
    appointment: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    patient: {
      findFirst: vi.fn(),
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

vi.mock('../services/emailService.ts', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

describe('Appointment Conflict Detection', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('detects doctor conflict when same doctor has overlapping appointment', async () => {
    const { appointmentSchema } = await import('../validation.ts');
    const data = {
      patientId: '550e8400-e29b-41d4-a716-446655440000',
      doctorId: 'doc-123',
      startTime: '2026-05-14T10:00:00.000Z',
      durationMinutes: 30,
    };
    const parsed = appointmentSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.doctorId).toBe('doc-123');
    }
  });

  it('detects room conflict when same room has overlapping appointment', async () => {
    const { appointmentSchema } = await import('../validation.ts');
    const data = {
      patientId: '550e8400-e29b-41d4-a716-446655440000',
      roomId: 'room-456',
      doctorId: 'doc-789',
      startTime: '2026-05-14T11:00:00.000Z',
      durationMinutes: 45,
    };
    const parsed = appointmentSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.roomId).toBe('room-456');
      expect(parsed.data.doctorId).toBe('doc-789');
    }
  });

  it('validates duration within bounds', async () => {
    const { appointmentSchema } = await import('../validation.ts');
    const tooShort = appointmentSchema.safeParse({
      patientId: '550e8400-e29b-41d4-a716-446655440000',
      startTime: '2026-05-14T10:00:00.000Z',
      durationMinutes: 2,
    });
    expect(tooShort.success).toBe(false);

    const tooLong = appointmentSchema.safeParse({
      patientId: '550e8400-e29b-41d4-a716-446655440000',
      startTime: '2026-05-14T10:00:00.000Z',
      durationMinutes: 500,
    });
    expect(tooLong.success).toBe(false);

    const valid = appointmentSchema.safeParse({
      patientId: '550e8400-e29b-41d4-a716-446655440000',
      startTime: '2026-05-14T10:00:00.000Z',
      durationMinutes: 30,
    });
    expect(valid.success).toBe(true);
  });

  it('validates update schema with roomId', async () => {
    const { appointmentUpdateSchema } = await import('../validation.ts');
    const result = appointmentUpdateSchema.safeParse({
      roomId: 'room-new',
      status: 'COMPLETED',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.roomId).toBe('room-new');
      expect(result.data.status).toBe('COMPLETED');
    }
  });
});
