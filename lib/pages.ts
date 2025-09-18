import { promises as fs } from 'fs'
import path from 'path'

export type PageItem = { slug: string; label: string }

export async function readPages(): Promise<PageItem[]> {
  const file = path.join(process.cwd(), 'content', 'pages.json')
  const raw = await fs.readFile(file, 'utf8')
  const list = JSON.parse(raw)
  return Array.isArray(list) ? list : []
}

export function normalizePageAccess(pages: PageItem[], incoming: Record<string, boolean> | undefined): Record<string, boolean> {
  const base: Record<string, boolean> = Object.fromEntries(pages.map(p => [p.slug, false]))
  if (incoming && typeof incoming === 'object') {
    for (const [k, v] of Object.entries(incoming)) {
      if (k in base && typeof v === 'boolean') base[k] = v
    }
  }
  return base
}


