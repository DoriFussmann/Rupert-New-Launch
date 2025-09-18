import { NextRequest } from 'next/server'
import { deleteById, getAll, isAllowedCollection, save, upsertById } from '../../../../lib/contentStore'
import bcrypt from 'bcrypt'
import { readPages, normalizePageAccess } from '../../../../lib/pages'
import { readAuthCookie, verifyToken, adminWritesEnabled } from '../../../../lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { collection: string, id: string } }) {
  const { collection, id } = params
  if (!isAllowedCollection(collection)) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  // AuthZ for writes
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
    if (!body?.name || typeof body.name !== 'string') return new Response(JSON.stringify({ error: 'name is required' }), { status: 400 })
    if (collection === 'users' && body.password && !String(body.password).startsWith('$2b$')) {
      body.password = await bcrypt.hash(body.password, 10)
    }
    if (collection === 'users') {
      const pages = await readPages()
      body.pageAccess = normalizePageAccess(pages, body.pageAccess)
    }
    const updated = await upsertById(collection, { ...body, id })
    return Response.json(updated)
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { collection: string, id: string } }) {
  const { collection, id } = params
  if (!isAllowedCollection(collection)) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  // AuthZ for writes
  try {
    const token = readAuthCookie(req)
    const payload = token ? (verifyToken(token) as any) : null
    if (!payload || !payload.isSuperadmin) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    if (!adminWritesEnabled()) return new Response(JSON.stringify({ error: 'Writes disabled' }), { status: 403 })
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
  try {
    await deleteById(collection, id)
    return Response.json({ ok: true })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 })
  }
}


