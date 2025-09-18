import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const file = path.join(process.cwd(), 'content', 'pages.json')
    const raw = await fs.readFile(file, 'utf8')
    const list = JSON.parse(raw)
    return new Response(JSON.stringify(list), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Failed to read pages' }), { status: 500 })
  }
}


