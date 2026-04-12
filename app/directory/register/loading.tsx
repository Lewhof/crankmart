export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '24px 20px' }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:.4} }
        .sk { animation: shimmer 1.4s ease infinite; background: #e5e7eb; borderRadius: 6px; }
      `}</style>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="sk" style={{ height: 40, width: 300, marginBottom: 32 }} />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <div className="sk" style={{ height: 16, width: '100%', marginBottom: 8 }} />
            <div className="sk" style={{ height: 40, width: '100%' }} />
          </div>
        ))}
        <div className="sk" style={{ height: 44, width: '100%', marginTop: 24 }} />
      </div>
    </div>
  )
}
