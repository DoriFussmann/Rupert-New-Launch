import { NextRequest } from 'next/server'

export async function GET(_req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not set on the server' }), { status: 500 })
  }
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
    })
    if (!res.ok) {
      const text = await res.text()
      return new Response(JSON.stringify({ error: `OpenAI HTTP ${res.status}`, detail: text }), { status: res.status })
    }
    return Response.json({ ok: true })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 })
  }
}


