require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
;(async () => {
  try {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set')
    await prisma.$queryRaw`SELECT 1`
    console.log('[DB] OK:', (process.env.DATABASE_URL.split('@').pop()||'').split('?')[0])
    process.exit(0)
  } catch (e) {
    console.error('[DB] ERROR:', e.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()


