import prisma from '../../../lib/prisma'

export async function GET() {
  const backend = 'files'
  const writable = String(process.env.ADMIN_ENABLED).toLowerCase() === 'true'
  const environment = process.env.NODE_ENV || 'development'
  let db = 'postgres'
  let database: 'connected' | 'disconnected' | 'missing-env' = 'disconnected'
  if (!process.env.DATABASE_URL) {
    database = 'missing-env'
  } else {
    try {
      await prisma.user.count()
      database = 'connected'
    } catch {
      database = 'disconnected'
    }
  }
  return new Response(JSON.stringify({ backend, db, database, writable, environment }), { status: 200 })
}


