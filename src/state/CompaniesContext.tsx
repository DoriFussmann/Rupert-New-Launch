import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiGet, apiJson } from '../lib/api'

export type Company = {
  id: string
  name: string
  imageUrl?: string
  rawData: string
}

type CompaniesContextValue = {
  companies: Company[]
  upsertCompany: (company: Company) => void
  deleteCompany: (id: string) => void
}

const CompaniesContext = createContext<CompaniesContextValue | null>(null)

export function CompaniesProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([])

  // Initial load from API
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await apiGet<Company[]>('/api/companies')
        if (!cancelled) setCompanies(Array.isArray(list) ? list : [])
      } catch {
        if (!cancelled) setCompanies([])
      }
    })()
    return () => { cancelled = true }
  }, [])

  const value = useMemo<CompaniesContextValue>(() => ({
    companies,
    upsertCompany: (company: Company) => {
      void (async () => {
        try {
          const hasId = Boolean(company?.id)
          const saved = hasId
            ? await apiJson<Company>(`/api/companies/${company.id}`, 'PUT', company)
            : await apiJson<Company>('/api/companies', 'POST', company)
          setCompanies(prev => {
            const exists = prev.some(c => c.id === saved.id)
            return exists ? prev.map(c => (c.id === saved.id ? saved : c)) : [...prev, saved]
          })
        } catch {}
      })()
    },
    deleteCompany: (id: string) => {
      void (async () => {
        try { await apiJson<{ ok: boolean }>(`/api/companies/${id}`, 'DELETE') } catch {}
        setCompanies(prev => prev.filter(c => c.id !== id))
      })()
    },
  }), [companies])

  return <CompaniesContext.Provider value={value}>{children}</CompaniesContext.Provider>
}

export function useCompanies() {
  const ctx = useContext(CompaniesContext)
  if (!ctx) throw new Error('useCompanies must be used within CompaniesProvider')
  return ctx
}


