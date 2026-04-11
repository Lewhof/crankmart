export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '24px 20px' }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:.4} }
        .sk { animation: shimmer 1.4s ease infinite; background: #e5e7eb; borderRadius: 6px; }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="sk" style={{ height: 48, width: '100%', marginBottom: 32 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div className="sk" style={{ height: 18, width: '100%', marginBottom: 8 }} />
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="sk" style={{ height: 14, width: '100%', marginBottom: 4 }} />
                ))}
              </div>
            ))}
          </div>
          <div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12, marginBottom: 16, padding: 12 }}>
                <div className="sk" style={{ height: 80, width: 80 }} />
                <div>
                  <div className="sk" style={{ height: 18, width: '100%', marginBottom: 8 }} />
                  <div className="sk" style={{ height: 14, width: '85%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
