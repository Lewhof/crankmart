export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '24px 20px' }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:.4} }
        .sk { animation: shimmer 1.4s ease infinite; background: #e5e7eb; borderRadius: 6px; }
      `}</style>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="sk" style={{ height: 40, width: 200, marginBottom: 32 }} />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <div className="sk" style={{ height: 20, width: '100%', marginBottom: 12 }} />
            <div className="sk" style={{ height: 16, width: '95%', marginBottom: 6 }} />
            <div className="sk" style={{ height: 16, width: '90%' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
