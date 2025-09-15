import { useEffect, useMemo, useState } from 'react'
import { useAdvisors } from '../state/AdvisorsContext'

function DataMapper() {
  // Local control state (placeholder defaults)
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>('')
  const [model, setModel] = useState<string>('gpt-4o-mini')
  const [temperature, setTemperature] = useState<number>(0.7)
  const [maxTokens, setMaxTokens] = useState<number>(512)

  const { advisors } = useAdvisors()
  const advisorsByName = useMemo(() => {
    return [...advisors].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [advisors])

  useEffect(() => {
    if (!selectedAdvisorId && advisorsByName.length > 0) {
      setSelectedAdvisorId(advisorsByName[0].id)
    }
  }, [selectedAdvisorId, advisorsByName])

  return (
    <div className="stack">
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 400 }}>Data Mapper</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 'var(--space-4)' }}>
        <section className="stack box">
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Controls</h2>
          <div className="stack">
            <div className="field">
              <label htmlFor="advisor">Advisor</label>
              <select id="advisor" value={selectedAdvisorId} onChange={e => setSelectedAdvisorId(e.target.value)}>
                {advisorsByName.length === 0 ? (
                  <option value="" disabled>No advisors yet</option>
                ) : null}
                {advisorsByName.map(a => (
                  <option key={a.id} value={a.id}>{a.name || '(no name)'}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="model">AI Model</label>
              <select id="model" value={model} onChange={e => setModel(e.target.value)}>
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="o3-mini">o3-mini</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="temp">Temperature</label>
              <select id="temp" value={String(temperature)} onChange={e => setTemperature(Number(e.target.value))}>
                <option value="0">0</option>
                <option value="0.2">0.2</option>
                <option value="0.4">0.4</option>
                <option value="0.6">0.6</option>
                <option value="0.7">0.7</option>
                <option value="0.8">0.8</option>
                <option value="1">1</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="maxTokens">Max Tokens</label>
              <select id="maxTokens" value={String(maxTokens)} onChange={e => setMaxTokens(Number(e.target.value))}>
                <option value="128">128</option>
                <option value="256">256</option>
                <option value="512">512</option>
                <option value="1024">1024</option>
                <option value="2048">2048</option>
              </select>
            </div>
          </div>
        </section>
        <section className="stack box">
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Outputs</h2>
        </section>
        <section className="stack box">
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Debug & Logs</h2>
        </section>
      </div>
    </div>
  )
}

export default DataMapper


