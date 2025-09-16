import { createContext, useContext, useEffect, useMemo, useState } from 'react'

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
  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const raw = localStorage.getItem('companies')
      if (!raw) return []
      const parsed = JSON.parse(raw) as Company[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('companies', JSON.stringify(companies))
    } catch {}
  }, [companies])

  const value = useMemo<CompaniesContextValue>(() => ({
    companies,
    upsertCompany: (company: Company) => {
      setCompanies(prev => {
        const exists = prev.some(c => c.id === company.id)
        return exists ? prev.map(c => (c.id === company.id ? company : c)) : [...prev, company]
      })
    },
    deleteCompany: (id: string) => setCompanies(prev => prev.filter(c => c.id !== id)),
  }), [companies])

  return <CompaniesContext.Provider value={value}>{children}</CompaniesContext.Provider>
}

export function useCompanies() {
  const ctx = useContext(CompaniesContext)
  if (!ctx) throw new Error('useCompanies must be used within CompaniesProvider')
  return ctx
}


