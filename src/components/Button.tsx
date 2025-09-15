import { useEffect, useRef, useState } from 'react'

type ButtonProps = {
  label: string
  disabled?: boolean
  onClick?: () => Promise<void> | void
}

function Button({ label, disabled, onClick }: ButtonProps) {
  const [state, setState] = useState<'idle' | 'working' | 'done'>('idle')
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleClick = async () => {
    if (disabled || state === 'working') return
    setState('working')
    try {
      await onClick?.()
    } finally {
      timeoutRef.current = window.setTimeout(() => {
        setState('done')
        timeoutRef.current = window.setTimeout(() => setState('idle'), 500)
      }, 1000)
    }
  }

  const busy = disabled || state === 'working'

  return (
    <button className="btn" aria-busy={busy ? 'true' : undefined} disabled={disabled} onClick={handleClick}>
      {state === 'working' && <span className="spinner" aria-hidden="true" />}
      {state === 'done' ? '✓' : label}
    </button>
  )
}

export default Button


