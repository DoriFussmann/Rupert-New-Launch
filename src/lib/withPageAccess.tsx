'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function withPageAccess<T>(Comp: React.ComponentType<T>, slug: string) {
  return function Guarded(props: T) {
    const router = useRouter()
    const [ok, setOk] = useState<boolean | null>(null)

    useEffect(() => {
      let cancelled = false
      ;(async () => {
        try {
          const r = await fetch('/api/auth/me', { cache: 'no-store' })
          if (!r.ok) { if (!cancelled) router.push('/'); return }
          const me = await r.json()
          const allowed = !!me?.user?.pageAccess?.[slug]
          if (!cancelled) setOk(allowed)
          if (!allowed) router.push('/')
        } catch {
          if (!cancelled) router.push('/')
        }
      })()
      return () => { cancelled = true }
    }, [router])

    if (ok === null) return null
    return ok ? <Comp {...props} /> : null
  }
}


