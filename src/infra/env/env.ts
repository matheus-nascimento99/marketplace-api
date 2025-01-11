import { string, z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  PORT: z.coerce.number().int().optional().default(3333),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: string(),
  DATABASE_URL: z.string().url(),
})

export type Env = z.infer<typeof envSchema>
