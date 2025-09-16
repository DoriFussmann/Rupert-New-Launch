import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

export const allowedCollections = ["advisors", "companies", "structures"] as const
export type Collection = typeof allowedCollections[number]

export function isAllowedCollection(input: string): input is Collection {
  return (allowedCollections as readonly string[]).includes(input)
}

const contentDir = path.join(process.cwd(), 'content')

function fileFor(collection: Collection) {
  return path.join(contentDir, `${collection}.json`)
}

async function ensureFile(collection: Collection) {
  await fs.mkdir(contentDir, { recursive: true })
  const f = fileFor(collection)
  try {
    await fs.access(f)
  } catch {
    await atomicWrite(f, '[]')
  }
}

export async function getAll<T = any>(collection: Collection): Promise<T[]> {
  await ensureFile(collection)
  const buf = await fs.readFile(fileFor(collection), 'utf8')
  return JSON.parse(buf) as T[]
}

export async function save(collection: Collection, data: unknown): Promise<void> {
  await ensureFile(collection)
  const json = JSON.stringify(data, null, 2)
  await atomicWrite(fileFor(collection), json)
}

export async function upsertById<T extends { id?: string }>(collection: Collection, item: T): Promise<T> {
  const list = await getAll<T>(collection)
  let id = item.id
  if (!id) id = crypto.randomUUID()
  const withId = { ...item, id } as T
  const idx = list.findIndex((i: any) => i.id === id)
  if (idx >= 0) list[idx] = withId
  else list.push(withId)
  await save(collection, list)
  return withId
}

export async function deleteById(collection: Collection, id: string): Promise<void> {
  const list = await getAll<any>(collection)
  const next = list.filter((i: any) => i.id !== id)
  await save(collection, next)
}

async function atomicWrite(target: string, data: string): Promise<void> {
  const dir = path.dirname(target)
  const tmp = path.join(dir, `.${path.basename(target)}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`)
  await fs.writeFile(tmp, data, 'utf8')
  await fs.rename(tmp, target)
}


