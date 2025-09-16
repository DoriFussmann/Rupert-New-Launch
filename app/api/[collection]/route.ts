import { NextRequest } from 'next/server'
import { getAll, isAllowedCollection, upsertById } from '../../../lib/contentStore'

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
  try {
    const body = await req.json()
    if (!body?.name || typeof body.name !== 'string') return new Response(JSON.stringify({ error: 'name is required' }), { status: 400 })
    const created = await upsertById(collection, body)
    return Response.json(created, { status: 201 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 })
  }
}


