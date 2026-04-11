export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:.4} }
        .sk { animation: shimmer 1.4s ease infinite; background: #e5e7eb; borderRadius: 6px; }
      `}</style>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="sk" style={{ height: 32, width: 160, margin: '0 auto 32px' }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div className="sk" style={{ height: 16, width: '100%', marginBottom: 8 }} />
            <div className="sk" style={{ height: 40, width: '100%' }} />
          </div>
        ))}
        <div className="sk" style={{ height: 44, width: '100%', marginTop: 24 }} />
      </div>
    </div>
  )
}
