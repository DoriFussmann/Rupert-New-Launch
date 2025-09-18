import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiGet, apiJson } from '../lib/api'

export type Advisor = {
  id: string
  name: string
  title: string
  imageUrl?: string
  tagline: string
  role: string
  personality: 'Analytical' | 'Strategic' | 'Pragmatic' | 'Empathetic' | 'Challenging'
  knowledgeField: string
  engagement: 'Engaging' | 'Balanced' | 'Minimal'
}

type AdvisorsContextValue = {
  advisors: Advisor[]
  upsertAdvisor: (advisor: Advisor) => void
  deleteAdvisor: (id: string) => void
}

const AdvisorsContext = createContext<AdvisorsContextValue | null>(null)

export function AdvisorsProvider({ children }: { children: React.ReactNode }) {
  const [advisors, setAdvisors] = useState<Advisor[]>([])

  // Initial load from API
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await apiGet<Advisor[]>('/api/advisors')
        if (!cancelled) setAdvisors(Array.isArray(list) ? list : [])
      } catch {
        if (!cancelled) setAdvisors([])
      }
    })()
    return () => { cancelled = true }
  }, [])

  const value = useMemo<AdvisorsContextValue>(() => ({
    advisors,
    upsertAdvisor: (advisor: Advisor) => {
      void (async () => {
        try {
          const hasId = Boolean(advisor?.id)
          const saved = hasId
            ? await apiJson<Advisor>(`/api/advisors/${advisor.id}`, 'PUT', advisor)
            : await apiJson<Advisor>('/api/advisors', 'POST', advisor)
          setAdvisors(prev => {
            const exists = prev.some(a => a.id === saved.id)
            return exists ? prev.map(a => (a.id === saved.id ? saved : a)) : [...prev, saved]
          })
        } catch {}
      })()
    },
    deleteAdvisor: (id: string) => {
      void (async () => {
        try { await apiJson<{ ok: boolean }>(`/api/advisors/${id}`, 'DELETE') } catch {}
        setAdvisors(prev => prev.filter(a => a.id !== id))
      })()
    },
  }), [advisors])

  return <AdvisorsContext.Provider value={value}>{children}</AdvisorsContext.Provider>
}

export function useAdvisors() {
  const ctx = useContext(AdvisorsContext)
  if (!ctx) throw new Error('useAdvisors must be used within AdvisorsProvider')
  return ctx
}


