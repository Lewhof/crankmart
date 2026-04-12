export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '24px 20px' }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:.4} }
        .sk { animation: shimmer 1.4s ease infinite; background: #e5e7eb; borderRadius: 6px; }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="sk" style={{ height: 40, width: 200, marginBottom: 32 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 20 }}>
          <div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ padding: 12, marginBottom: 8, background: i === 0 ? '#e5e7eb' : '#fff', borderRadius: 6, cursor: 'pointer' }}>
                <div className="sk" style={{ height: 16, width: '80%' }} />
              </div>
            ))}
          </div>
          <div>
            <div className="sk" style={{ height: 24, width: '60%', marginBottom: 16 }} />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ marginBottom: 16, padding: 12 }}>
                <div className="sk" style={{ height: 16, width: '100%', marginBottom: 8 }} />
                <div className="sk" style={{ height: 14, width: '95%' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
