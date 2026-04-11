'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Analytics() {
  const pathname = usePathname()
  
  useEffect(() => {
    // Don't track admin pages
    if (pathname?.startsWith('/admin')) return
    
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {})
  }, [pathname])
  
  return null
}
