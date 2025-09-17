import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not set on the server' }), { status: 500 })
  }
  try {
    const body = await req.json()
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    const json = await res.json()
    return new Response(JSON.stringify(json), { status: res.status })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 })
  }
}


