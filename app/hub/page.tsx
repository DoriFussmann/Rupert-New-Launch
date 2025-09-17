"use client"
import Hub from '../../src/pages/Hub'
import PageHeader from '../components/PageHeader'

export default function HubPage() {
  return (
    <div className="stack">
      <PageHeader title="Hub" />
      <Hub />
    </div>
  )
}


