import { createContext, useContext, useEffect, useMemo, useState } from 'react'

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
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem('tasks')
      if (!raw) return []
      const parsed = JSON.parse(raw) as Task[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks))
    } catch {}
  }, [tasks])

  const value = useMemo<TasksContextValue>(() => ({
    tasks,
    upsertTask: (task: Task) => {
      setTasks(prev => {
        const exists = prev.some(t => t.id === task.id)
        return exists ? prev.map(t => (t.id === task.id ? task : t)) : [...prev, task]
      })
    },
    deleteTask: (id: string) => setTasks(prev => prev.filter(t => t.id !== id)),
  }), [tasks])

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  const ctx = useContext(TasksContext)
  if (!ctx) throw new Error('useTasks must be used within TasksProvider')
  return ctx
}


