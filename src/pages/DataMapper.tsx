function DataMapper() {
  return (
    <div className="stack">
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 400 }}>Data Mapper</h1>
      <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
        <section className="stack box" style={{ flex: '0 0 25%' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Controls</h2>
        </section>
        <section className="stack box" style={{ flex: '0 0 50%' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Outputs</h2>
        </section>
        <section className="stack box" style={{ flex: '0 0 25%' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 400 }}>Debug & Logs</h2>
        </section>
      </div>
    </div>
  )
}

export default DataMapper


