import { useEffect, useRef, useState } from 'react'
import Button from '../components/Button'
import type { Advisor } from '../state/AdvisorsContext'
import { useAdvisors } from '../state/AdvisorsContext'
import { useStructures } from '../state/StructuresContext'
import { useTasks } from '../state/TasksContext'
import { useCompanies } from '../state/CompaniesContext'

function Hub() {
  const { advisors, upsertAdvisor, deleteAdvisor } = useAdvisors()
  const { structures, upsertStructure, deleteStructure } = useStructures()
  const { tasks, upsertTask, deleteTask } = useTasks()
  const { companies, upsertCompany, deleteCompany } = useCompanies()
  const [editing, setEditing] = useState<Advisor | null>(null)
  const [editingStructure, setEditingStructure] = useState<ReturnType<typeof createEmptyStructure> | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [editingTask, setEditingTask] = useState<{ id: string, name: string, details: string } | null>(null)
  const companyFileRef = useRef<HTMLInputElement | null>(null)
  const [editingCompany, setEditingCompany] = useState<{ id: string, name: string, imageUrl?: string, rawData: string } | null>(null)

  const onAdd = () => {
    setEditing({
      id: crypto.randomUUID(),
      name: '',
      title: '',
      tagline: '',
      role: '',
      personality: 'Analytical',
      knowledgeField: '',
      engagement: 'Balanced',
    })
  }

  const onEdit = (a: Advisor) => setEditing(a)
  const onDelete = (id: string) => deleteAdvisor(id)

  const onSave = (advisor: Advisor) => { upsertAdvisor(advisor); setEditing(null) }

  // Structures helpers
  const onAddStructure = () => setEditingStructure(createEmptyStructure())
  const onEditStructure = (id: string) => {
    const s = structures.find(x => x.id === id)
    if (s) setEditingStructure(JSON.parse(JSON.stringify(s)))
  }
  const onDeleteStructure = (id: string) => deleteStructure(id)
  const onSaveStructure = (s: ReturnType<typeof createEmptyStructure>) => {
    upsertStructure(s); setEditingStructure(null)
  }

  // Tasks helpers
  const onAddTask = () => setEditingTask({ id: crypto.randomUUID(), name: '', details: '' })
  const onEditTask = (id: string) => {
    const t = tasks.find(x => x.id === id)
    if (t) setEditingTask({ ...t })
  }
  const onDeleteTask = (id: string) => deleteTask(id)
  const onSaveTask = (t: { id: string, name: string, details: string }) => { upsertTask(t); setEditingTask(null) }

  // Companies helpers
  const onAddCompany = () => setEditingCompany({ id: crypto.randomUUID(), name: '', rawData: '' })
  const onEditCompany = (id: string) => {
    const c = companies.find(x => x.id === id)
    if (c) setEditingCompany({ ...c })
  }
  const onDeleteCompany = (id: string) => deleteCompany(id)
  const onSaveCompany = (c: { id: string, name: string, imageUrl?: string, rawData: string }) => { upsertCompany(c); setEditingCompany(null) }

  return (
    <div className="stack">
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 400 }}>Hub</h1>

      <section className="stack">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Advisors</h2>
          <Button label="Add Advisor" onClick={onAdd} />
        </div>

        {advisors.length === 0 ? (
          <p style={{ margin: 0, fontSize: 14 }}>No advisors yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {advisors.map(a => (
              <li key={a.id} onClick={() => onEdit(a)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderTop: '1px solid #f2f2f2', cursor: 'pointer' }}>
                <img src={a.imageUrl} alt="" style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover', background: '#f2f2f2' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>{a.name || '(no name)'} — {a.title || '—'}</div>
                  <div style={{ fontSize: 12, color: '#525252' }}>{a.tagline}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                  <Button label="Edit" onClick={() => onEdit(a)} />
                  <Button label="Delete" onClick={() => onDelete(a.id)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editing && (
        <section className="stack box" style={{ marginTop: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Advisor Details</h3>
          <AdvisorForm
            value={editing}
            onChange={setEditing}
            onCancel={() => setEditing(null)}
            onSave={() => onSave(editing)}
            fileInputRef={fileInputRef}
            onPickImage={() => fileInputRef.current?.click()}
          />
        </section>
      )}

      <section className="stack" style={{ borderTop: '1px solid #f2f2f2', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Structures</h2>
          <Button label="Add Structure" onClick={onAddStructure} />
        </div>
        {structures.length === 0 ? (
          <p style={{ margin: 0, fontSize: 14 }}>No structures yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {structures.map(s => (
              <li key={s.id} onClick={() => onEditStructure(s.id)} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderTop: '1px solid #f2f2f2', cursor: 'pointer' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>{s.name || '(no name)'}</div>
                  <div style={{ fontSize: 12, color: '#525252' }}>{s.topics.length} topics</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                  <Button label="Edit" onClick={() => onEditStructure(s.id)} />
                  <Button label="Delete" onClick={() => onDeleteStructure(s.id)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editingStructure && (
        <section className="stack box" style={{ marginTop: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Structure Details</h3>
          <StructureForm
            value={editingStructure}
            onChange={setEditingStructure}
            onCancel={() => setEditingStructure(null)}
            onSave={() => onSaveStructure(editingStructure)}
          />
        </section>
      )}

      <section className="stack" style={{ borderTop: '1px solid #f2f2f2', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Tasks</h2>
          <Button label="Add Task" onClick={onAddTask} />
        </div>
        {tasks.length === 0 ? (
          <p style={{ margin: 0, fontSize: 14 }}>No tasks yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {tasks.map(t => (
              <li key={t.id} onClick={() => onEditTask(t.id)} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderTop: '1px solid #f2f2f2', cursor: 'pointer' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>{t.name || '(no name)'}</div>
                  <div style={{ fontSize: 12, color: '#525252' }}>{t.details?.slice(0, 120)}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                  <Button label="Edit" onClick={() => onEditTask(t.id)} />
                  <Button label="Delete" onClick={() => onDeleteTask(t.id)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editingTask && (
        <section className="stack box" style={{ marginTop: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Task Details</h3>
          <TaskForm
            value={editingTask}
            onChange={setEditingTask}
            onCancel={() => setEditingTask(null)}
            onSave={() => onSaveTask(editingTask)}
          />
        </section>
      )}

      <section className="stack" style={{ borderTop: '1px solid #f2f2f2', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Companies</h2>
          <Button label="Add Company" onClick={onAddCompany} />
        </div>
        {companies.length === 0 ? (
          <p style={{ margin: 0, fontSize: 14 }}>No companies yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {companies.map(c => (
              <li key={c.id} onClick={() => onEditCompany(c.id)} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderTop: '1px solid #f2f2f2', cursor: 'pointer' }}>
                <img src={c.imageUrl} alt="" style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover', background: '#f2f2f2' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>{c.name || '(no name)'}</div>
                  <div style={{ fontSize: 12, color: '#525252' }}>{c.rawData?.slice(0, 120)}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                  <Button label="Edit" onClick={() => onEditCompany(c.id)} />
                  <Button label="Delete" onClick={() => onDeleteCompany(c.id)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editingCompany && (
        <section className="stack box" style={{ marginTop: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Company Details</h3>
          <CompanyForm
            value={editingCompany}
            onChange={setEditingCompany}
            onCancel={() => setEditingCompany(null)}
            onSave={() => onSaveCompany(editingCompany)}
            fileInputRef={companyFileRef}
          />
        </section>
      )}
    </div>
  )
}

function AdvisorForm({ value, onChange, onCancel, onSave, fileInputRef, onPickImage }: {
  value: Advisor
  onChange: (a: Advisor) => void
  onCancel: () => void
  onSave: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  onPickImage: () => void
}) {
  const onFile = async (file: File) => {
    const url = await readFileAsDataUrl(file)
    onChange({ ...value, imageUrl: url })
  }

  return (
    <div className="stack">
      <div className="row">
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" type="text" value={value.name} onChange={e => onChange({ ...value, name: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" type="text" value={value.title} onChange={e => onChange({ ...value, title: e.target.value })} />
        </div>
      </div>

      <div className="row" style={{ alignItems: 'flex-end' }}>
        <div className="field" style={{ maxWidth: 160 }}>
          <label>Image</label>
          <div className="stack">
            <div style={{ width: 160, height: 120, background: '#f2f2f2', borderRadius: 4, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {value.imageUrl ? (
                <img src={value.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 12, color: '#525252' }}>No image</span>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
              const file = e.target.files?.[0]
              if (file) onFile(file)
            }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button label={value.imageUrl ? 'Replace' : 'Upload'} onClick={onPickImage} />
              {value.imageUrl && (
                <Button label="Remove" onClick={() => onChange({ ...value, imageUrl: undefined })} />
              )}
            </div>
          </div>
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor="tagline">Tagline</label>
          <input id="tagline" type="text" value={value.tagline} onChange={e => onChange({ ...value, tagline: e.target.value })} />
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="role">Role</label>
          <input id="role" type="text" value={value.role} onChange={e => onChange({ ...value, role: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="personality">Personality</label>
          <select id="personality" value={value.personality} onChange={e => onChange({ ...value, personality: e.target.value as Advisor['personality'] })}>
            <option>Analytical</option>
            <option>Strategic</option>
            <option>Pragmatic</option>
            <option>Empathetic</option>
            <option>Challenging</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="engagement">Engagement</label>
          <select id="engagement" value={value.engagement} onChange={e => onChange({ ...value, engagement: e.target.value as Advisor['engagement'] })}>
            <option>Engaging</option>
            <option>Balanced</option>
            <option>Minimal</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="knowledge">Knowledge Field</label>
        <textarea id="knowledge" rows={6} value={value.knowledgeField} onChange={e => onChange({ ...value, knowledgeField: e.target.value })} />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button label="Cancel" onClick={onCancel} />
        <Button label="Save" onClick={onSave} />
      </div>
    </div>
  )
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default Hub

// -------- Structures UI --------
type StructureDraft = ReturnType<typeof createEmptyStructure>

function createEmptyStructure() {
  return { id: crypto.randomUUID(), name: '', topics: [] as Array<{ id: string, name: string, subtopics: Array<{ id: string, name: string, keyQuestions: string[] }> }> }
}

function StructureForm({ value, onChange, onCancel, onSave }: {
  value: StructureDraft
  onChange: (s: StructureDraft) => void
  onCancel: () => void
  onSave: () => void
}) {
  const update = (next: Partial<StructureDraft>) => onChange({ ...value, ...next })

  const addTopic = () => update({ topics: [...value.topics, { id: crypto.randomUUID(), name: '', subtopics: [] }] })
  const updateTopic = (id: string, patch: Partial<StructureDraft['topics'][number]>) => update({ topics: value.topics.map(t => t.id === id ? { ...t, ...patch } : t) })
  const removeTopic = (id: string) => update({ topics: value.topics.filter(t => t.id !== id) })

  const addSubtopic = (topicId: string) => updateTopic(topicId, { subtopics: [...value.topics.find(t => t.id === topicId)!.subtopics, { id: crypto.randomUUID(), name: '', keyQuestions: [] }] })
  const updateSubtopic = (topicId: string, subId: string, patch: Partial<StructureDraft['topics'][number]['subtopics'][number]>) => updateTopic(topicId, { subtopics: value.topics.find(t => t.id === topicId)!.subtopics.map(s => s.id === subId ? { ...s, ...patch } : s) })
  const removeSubtopic = (topicId: string, subId: string) => updateTopic(topicId, { subtopics: value.topics.find(t => t.id === topicId)!.subtopics.filter(s => s.id !== subId) })

  const addQuestion = (topicId: string, subId: string) => {
    const topic = value.topics.find(t => t.id === topicId)!
    const sub = topic.subtopics.find(s => s.id === subId)!
    updateSubtopic(topicId, subId, { keyQuestions: [...sub.keyQuestions, ''] })
  }
  const updateQuestion = (topicId: string, subId: string, idx: number, text: string) => {
    const topic = value.topics.find(t => t.id === topicId)!
    const sub = topic.subtopics.find(s => s.id === subId)!
    const next = [...sub.keyQuestions]
    next[idx] = text
    updateSubtopic(topicId, subId, { keyQuestions: next })
  }
  const removeQuestion = (topicId: string, subId: string, idx: number) => {
    const topic = value.topics.find(t => t.id === topicId)!
    const sub = topic.subtopics.find(s => s.id === subId)!
    const next = sub.keyQuestions.filter((_, i) => i !== idx)
    updateSubtopic(topicId, subId, { keyQuestions: next })
  }

  // Selection state for 3-column layout
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(value.topics[0]?.id ?? null)
  const selectedTopic = selectedTopicId ? value.topics.find(t => t.id === selectedTopicId) ?? null : null
  const [selectedSubId, setSelectedSubId] = useState<string | null>(selectedTopic?.subtopics[0]?.id ?? null)
  const selectedSub = selectedTopic && selectedSubId ? selectedTopic.subtopics.find(s => s.id === selectedSubId) ?? null : null

  // Keep selections valid as data changes
  useEffect(() => {
    if (!value.topics.some(t => t.id === selectedTopicId!)) {
      setSelectedTopicId(value.topics[0]?.id ?? null)
    }
  }, [value.topics, selectedTopicId])
  useEffect(() => {
    if (!selectedTopic) {
      setSelectedSubId(null)
      return
    }
    if (!selectedTopic.subtopics.some(s => s.id === selectedSubId!)) {
      setSelectedSubId(selectedTopic.subtopics[0]?.id ?? null)
    }
  }, [selectedTopic, selectedSubId])

  return (
    <div className="stack">
      <div className="field">
        <label htmlFor="s-name">Name</label>
        <input id="s-name" type="text" value={value.name} onChange={e => update({ name: e.target.value })} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
        {/* Topics (left) */}
        <div className="stack">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 400 }}>Topics</h4>
            <AddTopicInline onAdd={(topicName, subtopicsLines) => {
              const newId = crypto.randomUUID()
              const subs = subtopicsLines
                .split('\n')
                .map(s => s.trim())
                .filter(Boolean)
                .map(line => ({ id: crypto.randomUUID(), name: line, keyQuestions: [] as string[] }))
              update({ topics: [...value.topics, { id: newId, name: topicName, subtopics: subs }] })
              setSelectedTopicId(newId)
              setSelectedSubId(subs[0]?.id ?? null)
            }} />
          </div>
          {value.topics.length === 0 ? (
            <p style={{ margin: 0, fontSize: 14 }}>No topics yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {value.topics.map(topic => (
                <li key={topic.id}
                    onClick={() => { setSelectedTopicId(topic.id); setSelectedSubId(value.topics.find(t => t.id === topic.id)!.subtopics[0]?.id ?? null) }}
                    style={{ padding: '8px', borderTop: '1px solid #f2f2f2', cursor: 'pointer', background: topic.id === selectedTopicId ? '#f9f9f9' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14 }}>{topic.name || '(no name)'}</span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Button label="Remove" onClick={() => removeTopic(topic.id)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Subtopics (middle) */}
        <div className="stack">
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 400 }}>Subtopics</h4>
          {!selectedTopic ? (
            <p style={{ margin: 0, fontSize: 14 }}>Select a topic.</p>
          ) : (
            <div className="stack">
              <div className="field">
                <label>Topic name</label>
                <input type="text" value={selectedTopic.name} onChange={e => updateTopic(selectedTopic.id, { name: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Button label="Add Subtopic" onClick={() => addSubtopic(selectedTopic.id)} />
              </div>
              {selectedTopic.subtopics.length === 0 ? (
                <p style={{ margin: 0, fontSize: 14 }}>No subtopics yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {selectedTopic.subtopics.map(sub => (
                    <li key={sub.id}
                        onClick={() => setSelectedSubId(sub.id)}
                        style={{ padding: '8px', borderTop: '1px solid #f2f2f2', cursor: 'pointer', background: sub.id === selectedSubId ? '#f9f9f9' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14 }}>{sub.name || '(no name)'}</span>
                      <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: 8 }}>
                        <Button label="Rename" onClick={() => setSelectedSubId(sub.id)} />
                        <Button label="Remove" onClick={() => removeSubtopic(selectedTopic.id, sub.id)} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Questions (right) */}
        <div className="stack">
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 400 }}>Key Questions</h4>
          {!selectedTopic || !selectedSub ? (
            <p style={{ margin: 0, fontSize: 14 }}>Select a subtopic.</p>
          ) : (
            <div className="stack">
              <div className="field">
                <label>Subtopic name</label>
                <input type="text" value={selectedSub.name} onChange={e => updateSubtopic(selectedTopic.id, selectedSub.id, { name: e.target.value })} />
              </div>
              <div>
                <Button label="Add Question" onClick={() => addQuestion(selectedTopic.id, selectedSub.id)} />
              </div>
              {selectedSub.keyQuestions.length === 0 ? (
                <p style={{ margin: 0, fontSize: 14 }}>No questions yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {selectedSub.keyQuestions.map((q, i) => (
                    <li key={i} className="row" style={{ alignItems: 'flex-end', paddingTop: 8 }}>
                      <div className="field" style={{ flex: 1 }}>
                        <label>Question</label>
                        <input type="text" value={q} onChange={e => updateQuestion(selectedTopic.id, selectedSub.id, i, e.target.value)} />
                      </div>
                      <div>
                        <Button label="Remove" onClick={() => removeQuestion(selectedTopic.id, selectedSub.id, i)} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button label="Cancel" onClick={onCancel} />
        <Button label="Save" onClick={onSave} />
      </div>
    </div>
  )
}

function TaskForm({ value, onChange, onCancel, onSave }: {
  value: { id: string, name: string, details: string }
  onChange: (t: { id: string, name: string, details: string }) => void
  onCancel: () => void
  onSave: () => void
}) {
  return (
    <div className="stack">
      <div className="field">
        <label htmlFor="t-name">Name</label>
        <input id="t-name" type="text" value={value.name} onChange={e => onChange({ ...value, name: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="t-details">Details</label>
        <textarea id="t-details" rows={6} value={value.details} onChange={e => onChange({ ...value, details: e.target.value })} />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button label="Cancel" onClick={onCancel} />
        <Button label="Save" onClick={onSave} />
      </div>
    </div>
  )
}

function AddTopicInline({ onAdd }: { onAdd: (name: string, subtopics: string) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [subs, setSubs] = useState('')
  const canAdd = name.trim().length > 0

  if (!open) return <Button label="Add Topic" onClick={() => setOpen(true)} />

  return (
    <div className="stack box" style={{ marginTop: 8 }}>
      <div className="field">
        <label>Topic name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="field">
        <label>Subtopics (one per line)</label>
        <textarea rows={6} value={subs} onChange={e => setSubs(e.target.value)} placeholder="Subtopic A\nSubtopic B\nSubtopic C" />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button label="Cancel" onClick={() => { setOpen(false); setName(''); setSubs('') }} />
        <Button label="Add" onClick={() => { if (!canAdd) return; onAdd(name.trim(), subs); setOpen(false); setName(''); setSubs('') }} />
      </div>
    </div>
  )
}

function CompanyForm({ value, onChange, onCancel, onSave, fileInputRef }: {
  value: { id: string, name: string, imageUrl?: string, rawData: string }
  onChange: (c: { id: string, name: string, imageUrl?: string, rawData: string }) => void
  onCancel: () => void
  onSave: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
}) {
  const onFile = async (file: File) => {
    const url = await readFileAsDataUrl(file)
    onChange({ ...value, imageUrl: url })
  }

  return (
    <div className="stack">
      <div className="row" style={{ alignItems: 'flex-end' }}>
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor="c-name">Name</label>
          <input id="c-name" type="text" value={value.name} onChange={e => onChange({ ...value, name: e.target.value })} />
        </div>
        <div className="field" style={{ maxWidth: 160 }}>
          <label>Image</label>
          <div className="stack">
            <div style={{ width: 160, height: 120, background: '#f2f2f2', borderRadius: 4, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {value.imageUrl ? (
                <img src={value.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 12, color: '#525252' }}>No image</span>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
              const file = e.target.files?.[0]
              if (file) onFile(file)
            }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button label={value.imageUrl ? 'Replace' : 'Upload'} onClick={() => fileInputRef.current?.click()} />
              {value.imageUrl && (
                <Button label="Remove" onClick={() => onChange({ ...value, imageUrl: undefined })} />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="field">
        <label htmlFor="c-raw">Raw Data</label>
        <textarea id="c-raw" rows={8} value={value.rawData} onChange={e => onChange({ ...value, rawData: e.target.value })} />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button label="Cancel" onClick={onCancel} />
        <Button label="Save" onClick={onSave} />
      </div>
    </div>
  )
}


