import { promises as fs } from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')
const dataMapPath = path.join(dataDir, 'DataMap.json')

async function ensureDirAndFile() {
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch {}
  try {
    await fs.access(dataMapPath)
  } catch {
    const empty = getEmptyDataMap()
    await writeDataMapAtomic(empty)
  }
}

export function getEmptyDataMap() {
  return {
    meta: {
      structureVersion: 'v1.0',
      generatedAt: new Date().toISOString(),
    },
    global: {
      answeredCountTotal: 0,
      totalQuestionsAll: 0,
      totalCompletion: 0,
      unanswered: [],
    },
    topics: [],
  }
}

export async function readDataMap(): Promise<any> {
  await ensureDirAndFile()
  const raw = await fs.readFile(dataMapPath, 'utf8')
  try {
    return JSON.parse(raw)
  } catch {
    const empty = getEmptyDataMap()
    await writeDataMapAtomic(empty)
    return empty
  }
}

export async function writeDataMapAtomic(data: any): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true })
  const tmp = dataMapPath + '.tmp'
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8')
  await fs.rename(tmp, dataMapPath)
}

function topicKey(topic: any): string {
  if (!topic) return ''
  return String(topic.id || topic.key || topic.title || topic.name || '').trim().toLowerCase()
}

function subtopicKey(sub: any): string {
  if (!sub) return ''
  return String(sub.id || sub.key || sub.title || sub.name || '').trim().toLowerCase()
}

export function mergeDataMap(existing: any, incoming: any): any {
  if (!existing || typeof existing !== 'object') existing = getEmptyDataMap()
  if (!incoming || typeof incoming !== 'object') return existing

  const merged = { ...existing }

  if (incoming.meta) {
    merged.meta = { ...existing.meta, ...incoming.meta, generatedAt: new Date().toISOString() }
  }

  if (incoming.global) {
    merged.global = { ...existing.global, ...incoming.global }
  }

  const existingTopics = Array.isArray(existing.topics) ? [...existing.topics] : []
  const incomingTopics = Array.isArray(incoming.topics) ? incoming.topics : []

  const topicKeyToIndex = new Map<string, number>()
  existingTopics.forEach((t, idx) => topicKeyToIndex.set(topicKey(t), idx))

  for (const tNew of incomingTopics) {
    const key = topicKey(tNew)
    if (!key) continue
    const idx = topicKeyToIndex.get(key)
    if (idx == null) {
      // New topic, just append
      existingTopics.push(tNew)
      topicKeyToIndex.set(key, existingTopics.length - 1)
      continue
    }
    const tOld = existingTopics[idx] || {}
    const mergedTopic: any = { ...tOld }
    if (tNew.title || tNew.name) mergedTopic.title = tNew.title || tNew.name
    if (tNew.completion != null) mergedTopic.completion = tNew.completion

    const oldSubs = Array.isArray(tOld.subtopics) ? [...tOld.subtopics] : []
    const newSubs = Array.isArray(tNew.subtopics) ? tNew.subtopics : []
    const subKeyToIndex = new Map<string, number>()
    oldSubs.forEach((s, j) => subKeyToIndex.set(subtopicKey(s), j))
    for (const sNew of newSubs) {
      const sKey = subtopicKey(sNew)
      if (!sKey) continue
      const j = subKeyToIndex.get(sKey)
      if (j == null) {
        oldSubs.push(sNew)
        subKeyToIndex.set(sKey, oldSubs.length - 1)
        continue
      }
      const sOld = oldSubs[j] || {}
      const mergedSub: any = { ...sOld }
      if (sNew.title || sNew.name) mergedSub.title = sNew.title || sNew.name
      if (sNew.summary != null) mergedSub.summary = sNew.summary
      if (sNew.subtopicSummary != null) mergedSub.summary = sNew.subtopicSummary
      if (sNew.completion != null) mergedSub.completion = sNew.completion
      const newUnanswered = sNew.unansweredQuestions || sNew.unanswered || sNew.outstandingQuestions
      if (Array.isArray(newUnanswered)) mergedSub.unanswered = newUnanswered
      oldSubs[j] = mergedSub
    }
    mergedTopic.subtopics = oldSubs
    existingTopics[idx] = mergedTopic
  }

  merged.topics = existingTopics
  return merged
}


