import { useEffect, useMemo, useState } from 'react'
import { useAdvisors } from '../state/AdvisorsContext'
// removed Structure selection
import { useTasks } from '../state/TasksContext'
import { useCompanies } from '../state/CompaniesContext'

function DataMapper() {
  // Local control state (placeholder defaults)
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>('')
  const [model, setModel] = useState<string>('gpt-4o-mini')
  const [temperature, setTemperature] = useState<number>(0.2)
  const [maxTokens, setMaxTokens] = useState<number>(3000)
  // removed Structure selection
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [apiStatus, setApiStatus] = useState<'idle' | 'working' | 'success' | 'error'>('idle')
  const [compileOpen, setCompileOpen] = useState(false)
  const [compiledPayload, setCompiledPayload] = useState<any>(null)
  const [prepareOpen, setPrepareOpen] = useState(false)
  const [preparedPayload, setPreparedPayload] = useState<any>(null)
  const [apiCallStatus, setApiCallStatus] = useState<'idle' | 'working' | 'error' | 'success'>('idle')
  const [apiOutput, setApiOutput] = useState<any>(null)
  const [rawOpen, setRawOpen] = useState(false)
  // Separate API Chat controls state
  const [chatTaskId, setChatTaskId] = useState<string>('')
  const [chatModel, setChatModel] = useState<string>('gpt-4o-mini')
  const [chatTemperature, setChatTemperature] = useState<number>(0.2)
  const [chatMaxTokens, setChatMaxTokens] = useState<number>(500)

  const { advisors } = useAdvisors()
  const advisorsByName = useMemo(() => {
    return [...advisors].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [advisors])

  // removed structures list

  const { tasks } = useTasks()
  const tasksByName = useMemo(() => {
    return [...tasks].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [tasks])

  const { companies } = useCompanies()
  const companiesByName = useMemo(() => {
    return [...companies].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [companies])

  useEffect(() => {
    if (!selectedAdvisorId && advisorsByName.length > 0) {
      setSelectedAdvisorId(advisorsByName[0].id)
    }
  }, [selectedAdvisorId, advisorsByName])

  // removed default structure selection

  useEffect(() => {
    if (!selectedTaskId && tasksByName.length > 0) {
      setSelectedTaskId(tasksByName[0].id)
    }
  }, [selectedTaskId, tasksByName])

  useEffect(() => {
    if (!selectedCompanyId && companiesByName.length > 0) {
      setSelectedCompanyId(companiesByName[0].id)
    }
  }, [selectedCompanyId, companiesByName])
  useEffect(() => {
    if (!chatTaskId && tasksByName.length > 0) {
      setChatTaskId(tasksByName[0].id)
    }
  }, [chatTaskId, tasksByName])

  const selectedAdvisor = advisorsByName.find(a => a.id === selectedAdvisorId) || null
  // no selectedStructure

  async function handleApiTest() {
    try {
      setApiStatus('working')
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined
      if (!apiKey) throw new Error('Missing VITE_OPENAI_API_KEY')
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setApiStatus('success')
      setTimeout(() => setApiStatus('idle'), 1000)
    } catch (e) {
      setApiStatus('error')
      setTimeout(() => setApiStatus('idle'), 1500)
    }
  }

  function buildCompiledBlocks() {
    const pageName = 'DataMapper'
    const variableName = `${pageName}_API_Call_Combined`
    const advisorBlock = selectedAdvisor
      ? {
          title: selectedAdvisor.name || 'Advisor',
          content: {
            name: selectedAdvisor.name,
            title: selectedAdvisor.title,
            tagline: selectedAdvisor.tagline,
            role: selectedAdvisor.role,
            personality: selectedAdvisor.personality,
            knowledgeField: selectedAdvisor.knowledgeField,
            engagement: selectedAdvisor.engagement,
          },
        }
      : null

    const selectedTask = tasksByName.find(t => t.id === selectedTaskId) || null
    const taskBlock = selectedTask
      ? {
          title: selectedTask.name || 'Task',
          content: {
            name: selectedTask.name,
            details: (selectedTask as any).details,
          },
        }
      : null

    const selectedCompany = companiesByName.find(c => c.id === selectedCompanyId) || null
    const companyBlock = selectedCompany
      ? {
          title: selectedCompany.name || 'Company',
          content: {
            name: selectedCompany.name,
            rawData: selectedCompany.rawData,
          },
        }
      : null

    // Order matches the visible Controls from top down to Compile
    const payload = [advisorBlock, taskBlock, companyBlock].filter(Boolean)
    return { variableName, payload }
  }

  function handleCompile() {
    const { variableName, payload } = buildCompiledBlocks()
    ;(window as any)[variableName] = payload
    setCompiledPayload({ variable: variableName, data: payload })
    setCompileOpen(true)
  }

  function handleApiPrepare() {
    const { variableName, payload: compiledBlocks } = buildCompiledBlocks()
    ;(window as any)[variableName] = compiledBlocks
    const payload = {
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: JSON.stringify(compiledBlocks),
        },
      ],
    }
    setPreparedPayload(payload)
    setPrepareOpen(true)
  }

  async function handleApiCall() {
    try {
      setApiCallStatus('working')
      // Build the same payload as API Prepare
      const { variableName, payload: compiledBlocks } = buildCompiledBlocks()
      ;(window as any)[variableName] = compiledBlocks
      const body = {
        model,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: 'user', content: JSON.stringify(compiledBlocks) },
        ],
      }
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined
      if (!apiKey) throw new Error('Missing VITE_OPENAI_API_KEY')
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      setApiOutput(json)
      setApiCallStatus(res.ok ? 'success' : 'error')
    } catch (e) {
      setApiCallStatus('error')
      setApiOutput({ error: String(e) })
    }
  }

  // Auto-compile whenever selections or source data change
  useEffect(() => {
    const { variableName, payload } = buildCompiledBlocks()
    ;(window as any)[variableName] = payload
    setCompiledPayload({ variable: variableName, data: payload })
  }, [
    selectedAdvisorId,
    selectedTaskId,
    selectedCompanyId,
    advisorsByName,
    tasksByName,
    companiesByName,
  ])

  // Parse API output into topics/subtopics/summaries for display
  const parsedSummaries = useMemo(() => {
    try {
      if (!apiOutput) return null
      // If OpenAI chat completion
      const content = apiOutput?.choices?.[0]?.message?.content
      if (typeof content === 'string') {
        try {
          return JSON.parse(content)
        } catch {
          const start = content.indexOf('{')
          const end = content.lastIndexOf('}')
          if (start >= 0 && end > start) {
            const slice = content.slice(start, end + 1)
            return JSON.parse(slice)
          }
        }
      }
      // If already an object with topics
      if (apiOutput?.topics) return apiOutput
      return null
    } catch {
      return null
    }
  }, [apiOutput])

  const normalized = useMemo(() => {
    if (!parsedSummaries) return null
    const topicsSource = parsedSummaries.topics || parsedSummaries.structure?.topics || []
    const topics = topicsSource.map((t: any) => {
      const subtopics = (t.subtopics || []).map((s: any) => ({
        name: s.name || s.title,
        summary: s.summary || s.subtopicSummary || '',
        completion: s.completion ?? s.completionPercent ?? s.percent ?? null,
        unanswered: s.unansweredQuestions || s.unanswered || s.outstandingQuestions || [],
      }))
      return { name: t.name || t.title, subtopics }
    })
    const globalUnanswered =
      parsedSummaries.unansweredQuestions ||
      parsedSummaries.unanswered ||
      parsedSummaries.outstandingQuestions ||
      parsedSummaries.structure?.unansweredQuestions ||
      parsedSummaries.structure?.unanswered ||
      parsedSummaries.structure?.outstandingQuestions ||
      []
    return { topics, globalUnanswered }
  }, [parsedSummaries])

  async function handleCopyPrepared() {
    try {
      const text = JSON.stringify(preparedPayload ?? {}, null, 2)
      await navigator.clipboard.writeText(text)
    } catch {}
  }

  async function handleCopyRaw() {
    try {
      const text = apiOutput ? JSON.stringify(apiOutput, null, 2) : ''
      await navigator.clipboard.writeText(text)
    } catch {}
  }

  async function handleCopyClean() {
    try {
      const text = normalized ? JSON.stringify(normalized, null, 2) : ''
      await navigator.clipboard.writeText(text)
    } catch {}
  }

  return (
    <div className="stack">
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 400 }}>Data Mapper</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 'var(--space-4)' }}>
        <div className="stack">
        <section className="stack box">
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>API Call Controls</h2>
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
              <label htmlFor="task">Task</label>
              <select id="task" value={selectedTaskId} onChange={e => setSelectedTaskId(e.target.value)}>
                {tasksByName.length === 0 ? (
                  <option value="" disabled>No tasks yet</option>
                ) : null}
                {tasksByName.map(t => (
                  <option key={t.id} value={t.id}>{t.name || '(no name)'}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="company">Company</label>
              <select id="company" value={selectedCompanyId} onChange={e => setSelectedCompanyId(e.target.value)}>
                {companiesByName.length === 0 ? (
                  <option value="" disabled>No companies yet</option>
                ) : null}
                {companiesByName.map(c => (
                  <option key={c.id} value={c.id}>{c.name || '(no name)'}</option>
                ))}
              </select>
            </div>

            {/* Compile above the new separator */}
            <div>
              <button className="btn" onClick={handleCompile}>Compile</button>
            </div>

            {/* New separator between Company and AI Model */}
            <div style={{ borderTop: '1px solid #f2f2f2', marginTop: 8, paddingTop: 8 }} />

            

            

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
                <option value="3000">3000</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" aria-busy={apiStatus === 'working' ? 'true' : undefined} onClick={handleApiTest}>
                {apiStatus === 'success' ? 'Test ✓' : apiStatus === 'error' ? 'Test ✕' : 'Test'}
              </button>
              <button className="btn" onClick={handleApiPrepare}>Prepare</button>
              <button className="btn" aria-busy={apiCallStatus === 'working' ? 'true' : undefined} onClick={handleApiCall}>
                {apiCallStatus === 'working' && <span className="spinner" aria-hidden="true" />}Call
              </button>
            </div>
          </div>
        </section>
        <section className="stack box">
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>API Chat Controls</h2>
          <div className="stack">
            <div className="field">
              <label htmlFor="chat-task">Task</label>
              <select id="chat-task" value={chatTaskId} onChange={e => setChatTaskId(e.target.value)}>
                {tasksByName.length === 0 ? (
                  <option value="" disabled>No tasks yet</option>
                ) : null}
                {tasksByName.map(t => (
                  <option key={t.id} value={t.id}>{t.name || '(no name)'}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="chat-model">AI Model</label>
              <select id="chat-model" value={chatModel} onChange={e => setChatModel(e.target.value)}>
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="o3-mini">o3-mini</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="chat-temp">Temperature</label>
              <select id="chat-temp" value={String(chatTemperature)} onChange={e => setChatTemperature(Number(e.target.value))}>
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
              <label htmlFor="chat-maxTokens">Max Tokens</label>
              <select id="chat-maxTokens" value={String(chatMaxTokens)} onChange={e => setChatMaxTokens(Number(e.target.value))}>
                <option value="500">500</option>
                <option value="128">128</option>
                <option value="256">256</option>
                <option value="512">512</option>
                <option value="1024">1024</option>
                <option value="2048">2048</option>
                <option value="3000">3000</option>
              </select>
            </div>
          </div>
        </section>
        </div>
        <section className="stack box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Outputs</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={handleCopyClean} disabled={!normalized}>Copy Clean</button>
              <button className="btn" onClick={() => setRawOpen(true)} disabled={!apiOutput}>Show Raw</button>
            </div>
          </div>
          {apiCallStatus === 'working' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="spinner" aria-hidden="true" />
              <span style={{ fontSize: 14 }}>Calling...</span>
            </div>
          )}

          {normalized ? (
            <div className="stack">
              {normalized.topics.map((t: any, idx: number) => (
                <div key={idx} className="stack">
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>{t.name}</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {t.subtopics.map((s: any, j: number) => (
                      <li key={j} style={{ borderTop: '1px solid #f2f2f2', padding: '8px 0' }}>
                        <div style={{ fontSize: 14 }}>{s.name}</div>
                        {s.summary && (
                          <div style={{ fontSize: 12, color: '#525252' }}>{s.summary}</div>
                        )}
                        {s.completion != null && (
                          <div style={{ fontSize: 12, color: '#525252' }}>Completion: {Math.round(Number(s.completion))}%</div>
                        )}
                        {Array.isArray(s.unanswered) && s.unanswered.length > 0 && (
                          <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
                            {s.unanswered.map((q: any, k: number) => (
                              <li key={k} style={{ fontSize: 12, color: '#525252' }}>{typeof q === 'string' ? q : q?.text || ''}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {Array.isArray(normalized.globalUnanswered) && normalized.globalUnanswered.length > 0 && (
                <div className="stack">
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Outstanding Questions</h3>
                  <ul style={{ margin: 0 }}>
                    {normalized.globalUnanswered.map((q: any, i: number) => (
                      <li key={i} style={{ fontSize: 12, color: '#525252' }}>{typeof q === 'string' ? q : q?.text || ''}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            apiOutput ? (
              <pre style={{ margin: 0, fontSize: 12, lineHeight: '18px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
{JSON.stringify(apiOutput, null, 2)}
              </pre>
            ) : (
              <p style={{ margin: 0, fontSize: 14 }}>No API output yet.</p>
            )
          )}
        </section>
        <section className="stack box">
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Debug & Logs</h2>
        </section>
      </div>

      {compileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="box" style={{ maxWidth: 840, width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Compiled Payload</h3>
              <button className="btn" onClick={() => setCompileOpen(false)}>Close</button>
            </div>
            <pre style={{ margin: 0, fontSize: 12, lineHeight: '18px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
{JSON.stringify(compiledPayload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {prepareOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="box" style={{ maxWidth: 840, width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>API Payload Preview</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={handleCopyPrepared}>Copy</button>
                <button className="btn" onClick={() => setPrepareOpen(false)}>Close</button>
              </div>
            </div>
            <pre style={{ margin: 0, fontSize: 12, lineHeight: '18px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
{JSON.stringify(preparedPayload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {rawOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="box" style={{ maxWidth: 840, width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Raw API Response</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={handleCopyRaw} disabled={!apiOutput}>Copy</button>
                <button className="btn" onClick={() => setRawOpen(false)}>Close</button>
              </div>
            </div>
            <pre style={{ margin: 0, fontSize: 12, lineHeight: '18px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
{apiOutput ? JSON.stringify(apiOutput, null, 2) : ''}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataMapper


