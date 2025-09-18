import { NextRequest } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { readAuthCookie, verifyToken, adminWritesEnabled } from '../../../../../lib/auth'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit') || 20)))
  const skip = (page - 1) * limit
  const { slug } = params
  const col = await prisma.collection.findUnique({ where: { slug } })
  if (!col) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  const [total, items] = await Promise.all([
    prisma.item.count({ where: { collectionId: col.id } }),
    prisma.item.findMany({ where: { collectionId: col.id }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
  ])
  return new Response(JSON.stringify({ items, page, limit, total }), { status: 200 })
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const token = readAuthCookie(req)
    const payload = token ? (verifyToken(token) as any) : null
    if (!payload || !payload.isSuperadmin) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    if (!adminWritesEnabled()) return new Response(JSON.stringify({ error: 'Writes disabled' }), { status: 403 })
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
  try {
    const { slug } = params
    const col = await prisma.collection.findUnique({ where: { slug } })
    if (!col) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    const body = await req.json()
    const { data } = body || {}
    const created = await prisma.item.create({ data: { collectionId: col.id, data } })
    return new Response(JSON.stringify(created), { status: 201 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 })
  }
}


