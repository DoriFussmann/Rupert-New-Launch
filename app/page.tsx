import Link from 'next/link'
import PageHeader from './components/PageHeader'

export default function Page() {
  return (
    <div className="stack">
      <PageHeader title="Home" />
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 400 }}>Home</h1>
      <p style={{ margin: 0, fontSize: 14, lineHeight: '20px' }}>Welcome.</p>
      <div>
        <Link href="/hub" className="btn">Hub</Link>
        <span style={{ marginLeft: 8 }} />
        <Link href="/data-mapper" className="btn">Data Mapper</Link>
      </div>
    </div>
  )
}


