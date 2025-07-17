import { z } from 'zod';

export const createCheckoutSessionSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
  successUrl: z.string().url('Invalid success URL'),
  cancelUrl: z.string().url('Invalid cancel URL'),
});

export const createPortalSessionSchema = z.object({
  returnUrl: z.string().url('Invalid return URL'),
});

export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;
export type CreatePortalSessionInput = z.infer<typeof createPortalSessionSchema>; 