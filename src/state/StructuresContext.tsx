import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Structure = {
  id: string
  name: string
  topics: Topic[]
}

export type Topic = {
  id: string
  name: string
  subtopics: Subtopic[]
}

export type Subtopic = {
  id: string
  name: string
  keyQuestions: string[]
}

type StructuresContextValue = {
  structures: Structure[]
  upsertStructure: (structure: Structure) => void
  deleteStructure: (id: string) => void
}

const StructuresContext = createContext<StructuresContextValue | null>(null)

export function StructuresProvider({ children }: { children: React.ReactNode }) {
  const [structures, setStructures] = useState<Structure[]>(() => {
    try {
      const raw = localStorage.getItem('structures')
      if (!raw) return []
      const parsed = JSON.parse(raw) as Structure[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('structures', JSON.stringify(structures))
    } catch {}
  }, [structures])

  const value = useMemo<StructuresContextValue>(() => ({
    structures,
    upsertStructure: (structure: Structure) => {
      setStructures(prev => {
        const exists = prev.some(s => s.id === structure.id)
        return exists ? prev.map(s => (s.id === structure.id ? structure : s)) : [...prev, structure]
      })
    },
    deleteStructure: (id: string) => setStructures(prev => prev.filter(s => s.id !== id)),
  }), [structures])

  return <StructuresContext.Provider value={value}>{children}</StructuresContext.Provider>
}

export function useStructures() {
  const ctx = useContext(StructuresContext)
  if (!ctx) throw new Error('useStructures must be used within StructuresProvider')
  return ctx
}


