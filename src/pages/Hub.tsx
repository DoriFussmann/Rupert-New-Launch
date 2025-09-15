import { useRef, useState } from 'react'
import Button from '../components/Button'
import type { Advisor } from '../state/AdvisorsContext'
import { useAdvisors } from '../state/AdvisorsContext'

function Hub() {
  const { advisors, upsertAdvisor, deleteAdvisor } = useAdvisors()
  const [editing, setEditing] = useState<Advisor | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
              <li key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderTop: '1px solid #f2f2f2' }}>
                <img src={a.imageUrl} alt="" style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover', background: '#f2f2f2' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>{a.name || '(no name)'} — {a.title || '—'}</div>
                  <div style={{ fontSize: 12, color: '#525252' }}>{a.tagline}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button label="Edit" onClick={() => onEdit(a)} />
                  <Button label="Delete" onClick={() => onDelete(a.id)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editing && (
        <section className="stack" style={{ borderTop: '1px solid #f2f2f2', paddingTop: 16 }}>
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


