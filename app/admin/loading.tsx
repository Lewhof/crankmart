export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '24px 20px' }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:.4} }
        .sk { animation: shimmer 1.4s ease infinite; background: #e5e7eb; borderRadius: 6px; }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="sk" style={{ height: 40, width: 200, marginBottom: 32 }} />
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', marginBottom: 32 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ padding: 16, background: '#fff', borderRadius: 8 }}>
              <div className="sk" style={{ height: 14, width: '60%', marginBottom: 8 }} />
              <div className="sk" style={{ height: 24, width: '80%' }} />
            </div>
          ))}
        </div>
        <div>
          <div className="sk" style={{ height: 32, width: 150, marginBottom: 16 }} />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 16, marginBottom: 12, padding: 12 }}>
              <div className="sk" style={{ height: 16 }} />
              <div className="sk" style={{ height: 16 }} />
              <div className="sk" style={{ height: 16 }} />
              <div className="sk" style={{ height: 16 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
