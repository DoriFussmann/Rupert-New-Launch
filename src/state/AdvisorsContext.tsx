import { createContext, useContext, useMemo, useState } from 'react'

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

  const value = useMemo<AdvisorsContextValue>(() => ({
    advisors,
    upsertAdvisor: (advisor: Advisor) => {
      setAdvisors(prev => {
        const exists = prev.some(a => a.id === advisor.id)
        return exists ? prev.map(a => (a.id === advisor.id ? advisor : a)) : [...prev, advisor]
      })
    },
    deleteAdvisor: (id: string) => setAdvisors(prev => prev.filter(a => a.id !== id)),
  }), [advisors])

  return <AdvisorsContext.Provider value={value}>{children}</AdvisorsContext.Provider>
}

export function useAdvisors() {
  const ctx = useContext(AdvisorsContext)
  if (!ctx) throw new Error('useAdvisors must be used within AdvisorsProvider')
  return ctx
}


