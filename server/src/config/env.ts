import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string()
    .min(1, 'DATABASE_URL is required')
    .refine((value) => /^postgres(ql)?:\/\//.test(value), {
      message: 'DATABASE_URL must start with postgres:// or postgresql://'
    }),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  CLIENT_URL: z.string().optional(),
  PORT: z.string().optional(),
  APP_URL: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment validation error:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration. Check required variables.');
}

export const env = parsed.data;
