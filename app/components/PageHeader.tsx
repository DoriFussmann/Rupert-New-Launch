"use client"
import Link from 'next/link'

export default function PageHeader({ title }: { title: string }) {
  return (
    <header style={{ paddingTop: 16, paddingBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: 16, textAlign: 'left' }}>Rupert</div>
        </Link>
        <div>
          <span style={{ fontSize: 12, background: '#e6f0ff', color: '#1d4ed8', padding: '4px 8px', borderRadius: 4 }}>{title}</span>
        </div>
      </div>
    </header>
  )
}


