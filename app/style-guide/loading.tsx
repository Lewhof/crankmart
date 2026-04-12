export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '24px 20px' }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:.4} }
        .sk { animation: shimmer 1.4s ease infinite; background: #e5e7eb; borderRadius: 6px; }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="sk" style={{ height: 40, width: 250, marginBottom: 32 }} />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 40 }}>
            <div className="sk" style={{ height: 24, width: '30%', marginBottom: 20 }} />
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))' }}>
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="sk" style={{ height: 100 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
