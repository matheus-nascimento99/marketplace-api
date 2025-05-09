import { execSync } from 'child_process'
import { randomUUID } from 'crypto'

import { PrismaClient } from '@prisma/client'

import { envSchema } from '@/infra/env/env'

import { config } from 'dotenv'

config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

const env = envSchema.parse(process.env)

const prisma = new PrismaClient()

const generateDatabaseUrl = (schema: string) => {
  if (!env.DATABASE_URL) {
    throw new Error('Environment variable DATABASE_URL not found.')
  }

  const url = new URL(env.DATABASE_URL)
  url.searchParams.set('schema', schema)

  return url.toString()
}

const schema = randomUUID()

beforeAll(async () => {
  const newUrlDatabase = generateDatabaseUrl(schema)

  process.env.DATABASE_URL = newUrlDatabase

  execSync(`npx prisma migrate deploy`)
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
  await prisma.$disconnect()
})
