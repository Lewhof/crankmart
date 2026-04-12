'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle, Zap } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function SuccessInner() {
  const params  = useSearchParams()
  const boostId = params.get('boost_id')

  return (
    <div style={{ background:'#f8f8f8', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'48px 32px', textAlign:'center', maxWidth:440, width:'100%', border:'1px solid #ebebeb', boxShadow:'0 4px 24px rgba(0,0,0,.06)' }}>

        <div style={{ width:64, height:64, background:'#F0FDF4', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <CheckCircle size={32} style={{ color:'#16A34A' }} />
        </div>

        <h1 style={{ fontSize:24, fontWeight:900, color:'#1a1a1a', margin:'0 0 10px' }}>Boost Activated! 🚀</h1>
        <p style={{ fontSize:14, color:'#6B7280', margin:'0 0 28px', lineHeight:1.6 }}>
          Payment confirmed. Your boost is now live and working for you.
        </p>

        <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:10, padding:'14px 18px', marginBottom:28, textAlign:'left' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <Zap size={14} style={{ color:'#16A34A' }} />
            <span style={{ fontSize:13, fontWeight:700, color:'#15803D' }}>What happens next</span>
          </div>
          <ul style={{ margin:0, padding:'0 0 0 18px', fontSize:13, color:'#374151', lineHeight:1.8 }}>
            <li>Your listing is now appearing in its boosted position</li>
            <li>PayFast will send a payment confirmation to your email</li>
            <li>View and manage boosts from your account</li>
          </ul>
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/account?tab=listings" style={{ background:'#1a1a2e', color:'#fff', padding:'11px 24px', borderRadius:8, fontWeight:700, fontSize:14, textDecoration:'none' }}>
            My Listings
          </Link>
          <Link href="/browse" style={{ background:'#f5f5f5', color:'#1a1a1a', padding:'11px 24px', borderRadius:8, fontWeight:700, fontSize:14, textDecoration:'none', border:'1px solid #ebebeb' }}>
            Browse Listings
          </Link>
        </div>

        {boostId && <p style={{ fontSize:11, color:'#D1D5DB', marginTop:20 }}>Ref: {boostId}</p>}
      </div>
    </div>
  )
}

export default function BoostSuccessPage() {
  return <Suspense fallback={null}><SuccessInner /></Suspense>
}
