import { NextRequest } from 'next/server'
import prisma from '../../../lib/prisma'
import { readAuthCookie, verifyToken, adminWritesEnabled } from '../../../lib/auth'

export async function GET() {
  const collections = await prisma.collection.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return new Response(JSON.stringify(collections), { status: 200 })
}

export async function POST(req: NextRequest) {
  // AuthZ
  try {
    const token = readAuthCookie(req)
    const payload = token ? (verifyToken(token) as any) : null
    if (!payload || !payload.isSuperadmin) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    if (!adminWritesEnabled()) return new Response(JSON.stringify({ error: 'Writes disabled' }), { status: 403 })
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
  try {
    const body = await req.json()
    const { slug, label, schema } = body || {}
    if (!slug || !label) return new Response(JSON.stringify({ error: 'slug and label required' }), { status: 400 })
    const upserted = await prisma.collection.upsert({
      where: { slug },
      update: { label, schema },
      create: { slug, label, schema },
    })
    return new Response(JSON.stringify(upserted), { status: 201 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 })
  }
}


