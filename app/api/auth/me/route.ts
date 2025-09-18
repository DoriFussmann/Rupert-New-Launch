import { NextRequest } from 'next/server'
import { getAll } from '../../../../lib/contentStore'
import { readAuthCookie, verifyToken } from '../../../../lib/auth'

type User = { id: string; email: string; firstName?: string; lastName?: string; password?: string; isSuperadmin: boolean; pageAccess?: Record<string, boolean> }

export async function GET(req: NextRequest) {
  try {
    const token = readAuthCookie(req)
    if (!token) return new Response(JSON.stringify({ user: null }), { status: 200 })
    const payload = verifyToken(token) as any
    const users = await getAll<User>('users' as any)
    const user = users.find(u => u.id === payload.sub)
    if (!user) return new Response(JSON.stringify({ user: null }), { status: 200 })
    const { password: _pw, ...safeUser } = user
    return new Response(JSON.stringify({ user: safeUser }), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ user: null, error: e?.message || 'Invalid token' }), { status: 200 })
  }
}


