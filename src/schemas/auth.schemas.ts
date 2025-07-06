import { z } from 'zod';

// User registration schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  platform: z.enum(['mobile', 'web']).default('mobile'),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

// Update profile schema
export const updateProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
  medical_info: z.string().optional(),
  crisis_detection_enabled: z.boolean().optional(),
});

// Token validation schema
export const tokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// Inferred types from schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type TokenInput = z.infer<typeof tokenSchema>; 