'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'

interface SaveButtonProps {
  listingId: string
  initialSaved?: boolean
  size?: 'sm' | 'md'
  showCount?: boolean
}

export default function SaveButton({
  listingId,
  initialSaved = false,
  size = 'md',
  showCount = false,
}: SaveButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)
  const [saveCount, setSaveCount] = useState(0)

  const sizeMap = {
    sm: { button: 32, icon: 13 },
    md: { button: 40, icon: 16 },
  }

  const dims = sizeMap[size]

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname))
      return
    }

    setLoading(true)
    const optimisticSaved = !saved
    setSaved(optimisticSaved)

    try {
      const res = await fetch('/api/listings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })

      if (!res.ok) throw new Error('Failed to save')

      const data = await res.json()
      setSaved(data.saved)
      if (showCount) setSaveCount(data.saveCount || 0)
    } catch (error) {
      console.error('Save error:', error)
      setSaved(!optimisticSaved) // Revert on error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          width: dims.button,
          height: dims.button,
          borderRadius: '50%',
          background: '#fff',
          border: '1.5px solid #e4e4e7',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,.1)',
          transition: 'all .15s',
          opacity: loading ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,.15)'
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 3px rgba(0,0,0,.1)'
        }}
      >
        <Heart
          size={dims.icon}
          style={{
            fill: saved ? '#ef4444' : 'none',
            stroke: saved ? '#ef4444' : '#999',
            strokeWidth: 1.5,
            transition: 'all .15s',
          }}
        />
      </button>
      {showCount && saveCount > 0 && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#9a9a9a',
            minWidth: 24,
            textAlign: 'center',
          }}
        >
          {saveCount}
        </span>
      )}
    </div>
  )
}
