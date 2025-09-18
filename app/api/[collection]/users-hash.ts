import bcrypt from 'bcrypt'
import { NextRequest } from 'next/server'
import { getAll, save } from '../../../lib/contentStore'

type User = { id: string; email: string; password?: string; isSuperadmin: boolean; [k: string]: any }

// Utility endpoint (optional) to ensure all user passwords are hashed; not linked from UI
export async function POST(_req: NextRequest) {
  const users = await getAll<User>('users' as any)
  let changed = false
  const next = await Promise.all(users.map(async u => {
    if (u.password && !u.password.startsWith('$2b$')) {
      changed = true
      const hashed = await bcrypt.hash(u.password, 10)
      return { ...u, password: hashed }
    }
    return u
  }))
  if (changed) await save('users' as any, next)
  return new Response(JSON.stringify({ ok: true, changed }), { status: 200 })
}


