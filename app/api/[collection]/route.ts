import { NextRequest } from 'next/server'
import { getAll, isAllowedCollection, upsertById, save } from '../../../lib/contentStore'
import bcrypt from 'bcrypt'
import { readPages, normalizePageAccess } from '../../../lib/pages'
import { readAuthCookie, verifyToken, adminWritesEnabled } from '../../../lib/auth'

export async function GET(req: NextRequest, { params }: { params: { collection: string } }) {
  const { collection } = params
  if (!isAllowedCollection(collection)) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  try {
    const data = await getAll(collection)
    return Response.json(data)
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { collection: string } }) {
  const { collection } = params
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
    // Hash user password on create/update
    if (collection === 'users' && body.password && !String(body.password).startsWith('$2b$')) {
      body.password = await bcrypt.hash(body.password, 10)
    }
    if (collection === 'users') {
      const pages = await readPages()
      body.pageAccess = normalizePageAccess(pages, body.pageAccess)
    }
    const created = await upsertById(collection, body)
    return Response.json(created, { status: 201 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 })
  }
}


