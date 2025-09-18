import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiGet, apiJson } from '../lib/api'

export type Task = {
  id: string
  name: string
  details: string
}

type TasksContextValue = {
  tasks: Task[]
  upsertTask: (task: Task) => void
  deleteTask: (id: string) => void
}

const TasksContext = createContext<TasksContextValue | null>(null)

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])

  // Initial load from API
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await apiGet<Task[]>('/api/tasks')
        if (!cancelled) setTasks(Array.isArray(list) ? list : [])
      } catch {
        if (!cancelled) setTasks([])
      }
    })()
    return () => { cancelled = true }
  }, [])

  const value = useMemo<TasksContextValue>(() => ({
    tasks,
    upsertTask: (task: Task) => {
      void (async () => {
        try {
          const hasId = Boolean(task?.id)
          const saved = hasId
            ? await apiJson<Task>(`/api/tasks/${task.id}`, 'PUT', task)
            : await apiJson<Task>('/api/tasks', 'POST', task)
          setTasks(prev => {
            const exists = prev.some(t => t.id === saved.id)
            return exists ? prev.map(t => (t.id === saved.id ? saved : t)) : [...prev, saved]
          })
        } catch {}
      })()
    },
    deleteTask: (id: string) => {
      void (async () => {
        try { await apiJson<{ ok: boolean }>(`/api/tasks/${id}`, 'DELETE') } catch {}
        setTasks(prev => prev.filter(t => t.id !== id))
      })()
    },
  }), [tasks])

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  const ctx = useContext(TasksContext)
  if (!ctx) throw new Error('useTasks must be used within TasksProvider')
  return ctx
}


