export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '24px 20px' }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:.4} }
        .sk { animation: shimmer 1.4s ease infinite; background: #e5e7eb; borderRadius: 6px; }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="sk" style={{ height: 40, width: 200, marginBottom: 32 }} />
        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))' }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i}>
              <div className="sk" style={{ height: 180, marginBottom: 12 }} />
              <div className="sk" style={{ height: 18, width: '85%', marginBottom: 8 }} />
              <div className="sk" style={{ height: 14, width: '60%', marginBottom: 8 }} />
              <div className="sk" style={{ height: 14, width: '50%' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
