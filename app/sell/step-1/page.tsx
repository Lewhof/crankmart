'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'

interface Category { id: number; slug: string; name: string; parentId: number | null }

const STEPS = ['Category', 'Details', 'Photos', 'Location & Price']

export default function SellStep1() {
  const router = useRouter()
  const [parents, setParents] = useState<Category[]>([])
  const [children, setChildren] = useState<Category[]>([])
  const [selectedParent, setSelectedParent] = useState<Category | null>(null)
  const [selectedChild, setSelectedChild] = useState<Category | null>(null)
  const [tier, setTier] = useState<'one' | 'two'>('one')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => { setParents(d.parents || []); setChildren(d.children || []) })
      .finally(() => setLoading(false))
  }, [])

  const childrenFor = (parentId: number) => children.filter(c => c.parentId === parentId)

  const handleParentClick = (p: Category) => {
    const kids = childrenFor(p.id)
    setSelectedParent(p)
    setSelectedChild(null)
    if (kids.length > 0) {
      setTier('two')
    }
    // No children → stays on tier 1, selected directly
  }

  const handleBack = () => {
    setTier('one')
    setSelectedChild(null)
    // Keep selectedParent highlighted (Option B)
  }

  const handleContinue = () => {
    if (!selectedParent) return
    const finalSlug = selectedChild?.slug ?? selectedParent.slug
    localStorage.setItem('cyclemart-sell-category', finalSlug)
    router.push(`/sell/step-2?category=${finalSlug}`)
  }

  const currentChildren = selectedParent ? childrenFor(selectedParent.id) : []
  const canContinue = selectedParent && (currentChildren.length === 0 || tier === 'one' || selectedChild)

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 100 }}>
      <style>{`
        .sell-wrap { max-width: 640px; margin: 0 auto; }
        .progress-bar { background: #fff; border-bottom: 1px solid #ebebeb; padding: 0 20px; }
        .progress-inner { max-width: 640px; margin: 0 auto; display: flex; align-items: center; height: 52px; }
        .step-dot { display: flex; align-items: center; gap: 8px; flex: 1; }
        .step-dot:last-child { flex: 0; }
        .dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .dot.active { background: var(--color-primary); color: #fff; box-shadow: 0 0 0 3px #E9ECF5; }
        .dot.todo { background: #f0f0f0; color: #9a9a9a; }
        .step-label { font-size: 12px; font-weight: 600; }
        .step-line { flex: 1; height: 2px; background: #ebebeb; margin: 0 6px; }
        .sell-topbar { background: #fff; border-bottom: 1px solid #ebebeb; padding: 12px 20px; display: flex; align-items: center; gap: 12px; }
        .sell-card { background: #fff; margin: 0; padding: 20px; }
        @media(min-width:768px) { .sell-card { border-radius: 8px; margin-bottom: 12px; } }
        .cat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .cat-row { display: flex; flex-direction: column; gap: 6px; }
        .cat-grid .cat-option { flex-direction: column; align-items: flex-start; gap: 2px; }
        .cat-option { display: flex; align-items: center; justify-content: space-between; padding: 14px; border: 1.5px solid #e4e4e7; border-radius: 8px; cursor: pointer; background: #fff; text-align: left; transition: all .12s; width: 100%; font-size: 13px; font-weight: 600; color: #1a1a1a; }
        .cat-option:hover { border-color: #0D1B2A; background: #f8f9ff; color: #1a1a1a; }
        .cat-option.sel { border-color: #0D1B2A; background: #E9ECF5; color: #0D1B2A; font-weight: 700; }
        .sell-footer { position: fixed; bottom: 60px; left: 0; right: 0; background: #fff; border-top: 1px solid #ebebeb; padding: 12px 20px; z-index: 40; }
        @media(min-width:768px) { .sell-footer { bottom: 0; } }
        .btn-next { width: 100%; height: 50px; background: var(--color-primary); color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-next:disabled { opacity: .4; cursor: not-allowed; }
        .btn-next:not(:disabled):hover { background: #1e2d5a; }
        .skel { animation: pulse 1.4s infinite; background: #efefef; border-radius: 8px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      {/* Top bar */}
      <div className="sell-topbar">
        <Link href="/browse" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1a1a1a', textDecoration: 'none' }}>
          <ArrowLeft size={18} />
        </Link>
        <span style={{ fontWeight: 800, fontSize: 16, color: '#1a1a1a' }}>Post a listing</span>
      </div>

      {/* Progress */}
      <div className="progress-bar">
        <div className="progress-inner">
          {STEPS.map((s, i) => (
            <div key={s} className="step-dot">
              <div className={`dot ${i === 0 ? 'active' : 'todo'}`}>{i + 1}</div>
              <span className="step-label" style={{ color: i === 0 ? '#0D1B2A' : '#9a9a9a' }}>{s}</span>
              {i < STEPS.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>
      </div>

      <div className="sell-wrap">
        <div className="sell-card">

          {/* ── Tier 1 ── */}
          {tier === 'one' && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>What are you selling?</h2>
              <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 16 }}>Pick a category</p>

              {loading ? (
                <div className="cat-grid">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="skel" style={{ height: 62 }} />
                  ))}
                </div>
              ) : (
                <div className="cat-grid">
                  {parents.map(p => {
                    const kids = childrenFor(p.id)
                    const isSel = selectedParent?.slug === p.slug
                    return (
                      <button key={p.slug}
                        className={`cat-option${isSel ? ' sel' : ''}`}
                        onClick={() => handleParentClick(p)}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: isSel ? '#0D1B2A' : '#1a1a1a' }}>{p.name}</span>
                        {kids.length > 0 && (
                          <span style={{ fontSize: 11, color: isSel ? '#0D1B2A' : '#9a9a9a' }}>
                            {kids.length} types ›
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* ── Tier 2 ── */}
          {tier === 'two' && selectedParent && (
            <>
              {/* Back + heading */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <button onClick={handleBack}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 13, fontWeight: 700, padding: 0 }}>
                  ← Back
                </button>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a' }}>{selectedParent.name}</span>
              </div>

              <div className="cat-row">
                {/* "All [parent]" option */}
                <button
                  className={`cat-option${!selectedChild ? ' sel' : ''}`}
                  onClick={() => setSelectedChild(null)}>
                  <span>All {selectedParent.name}</span>
                </button>

                {currentChildren.map(c => (
                  <button key={c.slug}
                    className={`cat-option${selectedChild?.slug === c.slug ? ' sel' : ''}`}
                    onClick={() => setSelectedChild(c)}>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}

        </div>
      </div>

      <div className="sell-footer">
        <button className="btn-next" disabled={!canContinue} onClick={handleContinue}>
          {tier === 'two' && selectedChild
            ? `Continue with "${selectedChild.name}"`
            : tier === 'two' && !selectedChild && selectedParent
              ? `Continue with "All ${selectedParent.name}"`
              : selectedParent && currentChildren.length === 0
                ? `Continue with "${selectedParent.name}"`
                : 'Select a category'
          }
          {canContinue && <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  )
}
