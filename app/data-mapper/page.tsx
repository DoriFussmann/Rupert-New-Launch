import PageHeader from '../components/PageHeader'
import DataMapperClient from './DataMapperClient'

export default function DataMapperPage() {
  return (
    <div className="stack">
      <PageHeader title="Data Mapper" />
      <DataMapperClient />
    </div>
  )
}


