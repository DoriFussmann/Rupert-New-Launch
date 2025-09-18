import { NextRequest } from 'next/server'
import bcrypt from 'bcrypt'
import { getAll } from '../../../../lib/contentStore'
import { signToken, writeAuthCookie } from '../../../../lib/auth'

type User = { id: string; email: string; firstName?: string; lastName?: string; password: string; isSuperadmin: boolean; pageAccess?: Record<string, boolean> }

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'email and password required' }), { status: 400 })
    }
    const users = await getAll<User>('users' as any)
    const user = users.find(u => String(u.email).toLowerCase() === String(email).toLowerCase())
    if (!user || !user.password) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })

    const token = signToken({ sub: user.id, email: user.email, isSuperadmin: !!user.isSuperadmin })
    const headers = writeAuthCookie(token)
    const { password: _pw, ...safeUser } = user
    return new Response(JSON.stringify(safeUser), { status: 200, headers })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 })
  }
}


