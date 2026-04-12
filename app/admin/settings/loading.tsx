export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '24px 20px' }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:.4} }
        .sk { animation: shimmer 1.4s ease infinite; background: #e5e7eb; borderRadius: 6px; }
      `}</style>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="sk" style={{ height: 40, width: 250, marginBottom: 32 }} />
        <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: i < 11 ? '1px solid #e5e7eb' : 'none' }}>
              <div className="sk" style={{ height: 16, width: '30%', marginBottom: 12 }} />
              <div className="sk" style={{ height: 40, width: '100%' }} />
            </div>
          ))}
          <div className="sk" style={{ height: 44, width: '150px', marginTop: 24 }} />
        </div>
      </div>
    </div>
  )
}
