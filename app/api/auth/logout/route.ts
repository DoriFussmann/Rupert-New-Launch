import { clearAuthCookie } from '../../../../lib/auth'

export async function POST() {
  const headers = clearAuthCookie()
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
}


