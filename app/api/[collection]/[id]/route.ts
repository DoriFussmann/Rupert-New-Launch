import { NextRequest } from 'next/server'
import { deleteById, getAll, isAllowedCollection, save, upsertById } from '../../../../lib/contentStore'

export async function PUT(req: NextRequest, { params }: { params: { collection: string, id: string } }) {
  const { collection, id } = params
  if (!isAllowedCollection(collection)) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  try {
    const body = await req.json()
    if (!body?.name || typeof body.name !== 'string') return new Response(JSON.stringify({ error: 'name is required' }), { status: 400 })
    const updated = await upsertById(collection, { ...body, id })
    return Response.json(updated)
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { collection: string, id: string } }) {
  const { collection, id } = params
  if (!isAllowedCollection(collection)) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  try {
    await deleteById(collection, id)
    return Response.json({ ok: true })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 })
  }
}


