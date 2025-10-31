import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signUpSchema = signInSchema.extend({
  role: z.enum(['trader', 'client']),
  displayName: z.string().min(2).max(80),
});

export const bookingSchema = z.object({
  traderId: z.string().uuid(),
  minutes: z.number().int().min(5).max(240),
  note: z.string().max(500).optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
