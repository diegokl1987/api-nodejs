import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(5),
  JWT_REFRESH_SECRET: z.string().min(5),
  CORS_ORIGINS: z.string().min(1),
  CORS_CREDENTIALS: z.coerce.boolean().default(true),
});

export function validateEnv(env: Record<string, any>) {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Env inválido');
  }
  return parsed.data;
}