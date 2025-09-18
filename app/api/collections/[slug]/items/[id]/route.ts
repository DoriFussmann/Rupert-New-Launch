import { NextRequest } from 'next/server'
import prisma from '../../../../../../lib/prisma'
import { readAuthCookie, verifyToken, adminWritesEnabled } from '../../../../../../lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { slug: string, id: string } }) {
  try {
    const token = readAuthCookie(req)
    const payload = token ? (verifyToken(token) as any) : null
    if (!payload || !payload.isSuperadmin) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    if (!adminWritesEnabled()) return new Response(JSON.stringify({ error: 'Writes disabled' }), { status: 403 })
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
  try {
    const { slug, id } = params
    const col = await prisma.collection.findUnique({ where: { slug } })
    if (!col) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    const body = await req.json()
    const { data } = body || {}
    const updated = await prisma.item.update({ where: { id }, data: { data } })
    return new Response(JSON.stringify(updated), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string, id: string } }) {
  try {
    const token = readAuthCookie(req)
    const payload = token ? (verifyToken(token) as any) : null
    if (!payload || !payload.isSuperadmin) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    if (!adminWritesEnabled()) return new Response(JSON.stringify({ error: 'Writes disabled' }), { status: 403 })
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
  try {
    const { slug, id } = params
    const col = await prisma.collection.findUnique({ where: { slug } })
    if (!col) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    await prisma.item.delete({ where: { id } })
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 })
  }
}


