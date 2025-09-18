import { NextRequest } from 'next/server'
import { readAuthCookie, verifyToken } from './auth'
import { getAll } from './contentStore'

type User = { id: string; pageAccess?: Record<string, boolean> }

export async function requirePage(req: NextRequest, slug: string): Promise<Response | null> {
  try {
    const token = readAuthCookie(req)
    if (!token) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    const payload = verifyToken(token) as any
    const users = await getAll<User>('users' as any)
    const user = users.find(u => u.id === payload.sub)
    if (!user || !user.pageAccess || user.pageAccess[slug] !== true) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    }
    return null
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }
}


