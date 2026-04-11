export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '24px 20px' }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:.4} }
        .sk { animation: shimmer 1.4s ease infinite; background: #e5e7eb; borderRadius: 6px; }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="sk" style={{ height: 300, width: '100%', marginBottom: 24 }} />
        <div className="sk" style={{ height: 32, width: '60%', marginBottom: 16 }} />
        <div className="sk" style={{ height: 18, width: '40%', marginBottom: 32 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <div className="sk" style={{ height: 18, width: '25%', marginBottom: 12 }} />
                <div className="sk" style={{ height: 16, width: '100%', marginBottom: 6 }} />
                <div className="sk" style={{ height: 16, width: '95%' }} />
              </div>
            ))}
          </div>
          <div>
            <div className="sk" style={{ height: 180, width: '100%', marginBottom: 16 }} />
            <div className="sk" style={{ height: 40, width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
