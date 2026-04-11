'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function CancelInner() {
  const params     = useSearchParams()
  const boostId    = params.get('boost_id')

  return (
    <div style={{ background:'#f8f8f8', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'48px 32px', textAlign:'center', maxWidth:420, width:'100%', border:'1px solid #ebebeb' }}>

        <div style={{ width:64, height:64, background:'#FEF2F2', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <XCircle size={32} style={{ color:'#DC2626' }} />
        </div>

        <h1 style={{ fontSize:22, fontWeight:900, color:'#1a1a1a', margin:'0 0 10px' }}>Payment Cancelled</h1>
        <p style={{ fontSize:14, color:'#6B7280', margin:'0 0 28px', lineHeight:1.6 }}>
          No charge was made. Your listing is unchanged.
        </p>

        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/account?tab=listings" style={{ background:'var(--color-primary)', color:'#fff', padding:'11px 24px', borderRadius:8, fontWeight:700, fontSize:14, textDecoration:'none' }}>
            Try Again
          </Link>
          <Link href="/account" style={{ background:'#f5f5f5', color:'#1a1a1a', padding:'11px 24px', borderRadius:8, fontWeight:700, fontSize:14, textDecoration:'none', border:'1px solid #ebebeb' }}>
            My Account
          </Link>
        </div>

        {boostId && <p style={{ fontSize:11, color:'#D1D5DB', marginTop:20 }}>Ref: {boostId}</p>}
      </div>
    </div>
  )
}

export default function BoostCancelPage() {
  return <Suspense fallback={null}><CancelInner /></Suspense>
}
