import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

const baseUrl = process.env.BETTER_AUTH_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.V0_RUNTIME_URL)
const origins = [baseUrl, process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`, process.env.V0_RUNTIME_URL].filter(Boolean) as string[]

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || 'barbiebeast-build-secret-change-in-runtime-32chars',
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  baseURL: baseUrl,
  trustedOrigins: origins,
  emailAndPassword: { enabled: true },
  advanced: process.env.NODE_ENV === 'development' ? { defaultCookieAttributes: { sameSite: 'none', secure: true } } : undefined,
})
