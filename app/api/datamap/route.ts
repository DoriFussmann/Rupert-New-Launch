import { NextRequest } from 'next/server'
import { readDataMap, writeDataMapAtomic, getEmptyDataMap, mergeDataMap } from '../../../lib/datamap'

export async function GET() {
  const data = await readDataMap()
  return new Response(JSON.stringify(data), { status: 200 })
}

export async function POST(req: NextRequest) {
  try {
    const incoming = await req.json()
    const existing = await readDataMap()
    const merged = mergeDataMap(existing, incoming)
    await writeDataMapAtomic(merged)
    return new Response(JSON.stringify(merged), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Invalid JSON' }), { status: 400 })
  }
}

export async function DELETE() {
  const empty = getEmptyDataMap()
  await writeDataMapAtomic(empty)
  return new Response(JSON.stringify(empty), { status: 200 })
}


