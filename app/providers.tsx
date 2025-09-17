"use client"
import type { ReactNode } from 'react'
import { AdvisorsProvider } from '../src/state/AdvisorsContext'
import { TasksProvider } from '../src/state/TasksContext'
import { CompaniesProvider } from '../src/state/CompaniesContext'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AdvisorsProvider>
      <TasksProvider>
        <CompaniesProvider>{children}</CompaniesProvider>
      </TasksProvider>
    </AdvisorsProvider>
  )
}


