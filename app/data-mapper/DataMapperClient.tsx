"use client"
import dynamic from 'next/dynamic'

const DataMapper = dynamic(() => import('../../src/pages/DataMapper'), { ssr: false })

export default function DataMapperClient() {
  return <DataMapper />
}


