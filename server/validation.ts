import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().uuid(),
  password: z.string().min(8).max(128),
});

export const patientSchema = z.object({
  fullName: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  medicalRecord: z.string().optional(),
  nutritionalPlan: z.string().optional(),
});

export const patientUpdateSchema = patientSchema.partial();

export const appointmentSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().optional(),
  startTime: z.string().datetime(),
  durationMinutes: z.number().int().min(5).max(480).default(30),
});

export const appointmentUpdateSchema = z.object({
  patientId: z.string().uuid().optional(),
  doctorId: z.string().optional(),
  startTime: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  status: z.string().max(50).optional(),
});

export const tenantConfigSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  owner: z.string().max(200).optional(),
  specialty: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  logoUrl: z.string().max(500).optional(),
  contactPhone: z.string().max(50).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  publicBookingEnabled: z.boolean().optional(),
  locale: z.string().max(10).optional(),
});

export const checkoutSchema = z.object({
  planKey: z.enum(['STARTER', 'PRO', 'PREMIUM']),
});

export const demoRegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional().or(z.literal('')),
  clinicType: z.string().max(100).optional(),
  clinicName: z.string().min(1).max(200),
  password: z.string().min(8).max(128),
});

export const createTenantSchema = z.object({
  name: z.string().min(1).max(200),
  specialty: z.string().max(100).optional(),
});

export const publicBookingSchema = z.object({
  startTime: z.string().datetime(),
  fullName: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
});

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
