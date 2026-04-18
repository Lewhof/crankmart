'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Heart, MessageCircle, MoreHorizontal, Loader } from 'lucide-react'
import { UserCard } from './UserCard'
import { FlagButton } from './FlagButton'
import type { CommentRow } from '@/app/api/community/comments/route'

/**
 * Drop-in comment thread. Handles fetch, optimistic post, reactions, single-level
 * replies, owner edit/delete, and flag. Anonymous users see the thread + a
 * "Sign in to comment" CTA instead of the form.
 */
export function CommentThread({
  targetType,
  targetId,
  title = 'Discussion',
}: {
  targetType: string
  targetId: string
  title?: string
}) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<CommentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [text, setText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [menuFor, setMenuFor] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/community/comments?targetType=${targetType}&targetId=${targetId}`)
      const data = await res.json()
      setComments(data.comments ?? [])
    } finally {
      setLoading(false)
    }
  }, [targetType, targetId])

  useEffect(() => { load() }, [load])

  async function postTop() {
    if (!text.trim() || posting) return
    setPosting(true)
    try {
      const res = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, body: text.trim() }),
      })
      if (res.ok) {
        const { comment } = await res.json()
        setComments(c => [comment, ...c])
        setText('')
      }
    } finally {
      setPosting(false)
    }
  }

  async function postReply(parentId: string) {
    if (!replyText.trim() || posting) return
    setPosting(true)
    try {
      const res = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, body: replyText.trim(), parentId }),
      })
      if (res.ok) {
        const { comment } = await res.json()
        setComments(c => [...c, comment])
        setReplyText('')
        setReplyingTo(null)
      }
    } finally {
      setPosting(false)
    }
  }

  async function toggleReaction(commentId: string) {
    if (!session?.user) return
    // Optimistic
    setComments(cs => cs.map(c => c.id === commentId ? {
      ...c,
      viewerHasReacted: !c.viewerHasReacted,
      reactionCount: c.reactionCount + (c.viewerHasReacted ? -1 : 1),
    } : c))
    const res = await fetch('/api/community/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId }),
    })
    if (!res.ok) {
      // Roll back on failure
      setComments(cs => cs.map(c => c.id === commentId ? {
        ...c,
        viewerHasReacted: !c.viewerHasReacted,
        reactionCount: c.reactionCount + (c.viewerHasReacted ? 1 : -1),
      } : c))
    }
  }

  async function saveEdit(id: string) {
    if (!editText.trim()) return
    const res = await fetch(`/api/community/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: editText.trim() }),
    })
    if (res.ok) {
      setComments(cs => cs.map(c => c.id === id
        ? { ...c, body: editText.trim(), editedAt: new Date().toISOString() }
        : c))
      setEditingId(null)
      setEditText('')
    }
  }

  async function removeComment(id: string) {
    if (!confirm('Delete this comment?')) return
    const res = await fetch(`/api/community/comments/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setComments(cs => cs.filter(c => c.id !== id))
    }
  }

  const topLevel = comments.filter(c => !c.parentId)
  const repliesFor = (parentId: string) => comments.filter(c => c.parentId === parentId)

  const currentUserId = (session?.user as { id?: string } | undefined)?.id

  return (
    <section style={{ marginTop: 32, padding: '24px 0', borderTop: '1px solid #ebebeb' }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
        <MessageCircle size={18} /> {title}
        <span style={{ fontSize: 13, color: '#9a9a9a', fontWeight: 500 }}>
          ({comments.length})
        </span>
      </h2>

      {/* Compose */}
      {session?.user ? (
        <div style={{ marginBottom: 20 }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add to the discussion…"
            style={{
              width: '100%', minHeight: 72, padding: '10px 12px', fontSize: 14,
              border: '1px solid #ebebeb', borderRadius: 8, resize: 'vertical',
              fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: '#9a9a9a' }}>
              Be kind. Keep it on-topic. Reports are reviewed.
            </span>
            <button
              onClick={postTop}
              disabled={!text.trim() || posting}
              style={{
                background: 'var(--color-primary)', color: '#fff', border: 'none',
                padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                cursor: text.trim() && !posting ? 'pointer' : 'default',
                opacity: text.trim() && !posting ? 1 : 0.5,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              {posting && <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />}
              Post
            </button>
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <div style={{
          padding: '14px 16px', background: '#f8f9ff', border: '1px solid #e4e4e7',
          borderRadius: 8, fontSize: 13, color: '#4b5563', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <span>Sign in to join the discussion.</span>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/')}`}
            style={{
              background: 'var(--color-primary)', color: '#fff', textDecoration: 'none',
              padding: '7px 14px', borderRadius: 6, fontSize: 13, fontWeight: 700,
            }}
          >
            Sign in
          </Link>
        </div>
      )}

      {/* Thread */}
      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: '#9a9a9a', fontSize: 13 }}>
          Loading comments…
        </div>
      ) : topLevel.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: '#9a9a9a', fontSize: 13 }}>
          No comments yet. Be the first to post.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {topLevel.map(c => {
            const replies = repliesFor(c.id)
            const isOwner = currentUserId === c.user.id
            return (
              <div key={c.id} style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: 14 }}>
                <CommentRowUI
                  c={c}
                  isOwner={isOwner}
                  onReact={() => toggleReaction(c.id)}
                  onReply={() => { setReplyingTo(c.id === replyingTo ? null : c.id); setReplyText('') }}
                  onMenu={() => setMenuFor(menuFor === c.id ? null : c.id)}
                  menuOpen={menuFor === c.id}
                  onStartEdit={() => { setEditingId(c.id); setEditText(c.body); setMenuFor(null) }}
                  onDelete={() => { removeComment(c.id); setMenuFor(null) }}
                  editing={editingId === c.id}
                  editText={editText}
                  setEditText={setEditText}
                  onSaveEdit={() => saveEdit(c.id)}
                  onCancelEdit={() => { setEditingId(null); setEditText('') }}
                />

                {/* Reply form */}
                {replyingTo === c.id && session?.user && (
                  <div style={{ marginLeft: 36, marginTop: 8 }}>
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder={`Reply to ${c.user.name}…`}
                      autoFocus
                      style={{
                        width: '100%', minHeight: 60, padding: '8px 10px', fontSize: 13,
                        border: '1px solid #ebebeb', borderRadius: 6, resize: 'vertical',
                        fontFamily: 'inherit', boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                      <button onClick={() => setReplyingTo(null)} style={{
                        background: '#fff', border: '1px solid #e4e4e7', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}>Cancel</button>
                      <button
                        onClick={() => postReply(c.id)}
                        disabled={!replyText.trim() || posting}
                        style={{
                          background: 'var(--color-primary)', color: '#fff', border: 'none',
                          padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                          cursor: replyText.trim() ? 'pointer' : 'default', opacity: replyText.trim() ? 1 : 0.5,
                        }}
                      >Reply</button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {replies.length > 0 && (
                  <div style={{ marginLeft: 36, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {replies.map(r => {
                      const rOwn = currentUserId === r.user.id
                      return (
                        <CommentRowUI
                          key={r.id}
                          c={r}
                          isOwner={rOwn}
                          isReply
                          onReact={() => toggleReaction(r.id)}
                          onReply={null}
                          onMenu={() => setMenuFor(menuFor === r.id ? null : r.id)}
                          menuOpen={menuFor === r.id}
                          onStartEdit={() => { setEditingId(r.id); setEditText(r.body); setMenuFor(null) }}
                          onDelete={() => { removeComment(r.id); setMenuFor(null) }}
                          editing={editingId === r.id}
                          editText={editText}
                          setEditText={setEditText}
                          onSaveEdit={() => saveEdit(r.id)}
                          onCancelEdit={() => { setEditingId(null); setEditText('') }}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function CommentRowUI({
  c, isOwner, isReply = false,
  onReact, onReply, onMenu, menuOpen,
  onStartEdit, onDelete,
  editing, editText, setEditText, onSaveEdit, onCancelEdit,
}: {
  c: CommentRow
  isOwner: boolean
  isReply?: boolean
  onReact: () => void
  onReply: (() => void) | null
  onMenu: () => void
  menuOpen: boolean
  onStartEdit: () => void
  onDelete: () => void
  editing: boolean
  editText: string
  setEditText: (s: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
}) {
  const when = new Date(c.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <UserCard
          handle={c.user.handle}
          name={c.user.name}
          avatarUrl={c.user.avatarUrl}
          size={isReply ? 24 : 28}
        />
        <span style={{ fontSize: 11, color: '#9a9a9a' }}>
          {when}{c.editedAt ? ' · edited' : ''}
        </span>
      </div>

      {editing ? (
        <div>
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            style={{
              width: '100%', minHeight: 60, padding: '8px 10px', fontSize: 13,
              border: '1px solid #ebebeb', borderRadius: 6, resize: 'vertical',
              fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
            <button onClick={onCancelEdit} style={{
              background: '#fff', border: '1px solid #e4e4e7', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>Cancel</button>
            <button onClick={onSaveEdit} style={{
              background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>Save</button>
          </div>
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 14, color: '#1a1a1a', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
          {c.body}
        </p>
      )}

      {!editing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#6b7280' }}>
          <button onClick={onReact} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            color: c.viewerHasReacted ? '#DC2626' : '#6b7280', fontWeight: c.viewerHasReacted ? 700 : 500, fontSize: 12,
          }}>
            <Heart size={13} fill={c.viewerHasReacted ? '#DC2626' : 'none'} />
            {c.reactionCount > 0 ? c.reactionCount : ''}
          </button>
          {onReply && (
            <button onClick={onReply} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#6b7280', fontSize: 12, fontWeight: 600,
            }}>
              Reply
            </button>
          )}
          <div style={{ flex: 1 }} />
          <div style={{ position: 'relative' }}>
            <button onClick={onMenu} style={{
              background: 'transparent', border: 'none', cursor: 'pointer', color: '#9a9a9a', padding: 2,
            }}>
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={onMenu} />
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#fff',
                  border: '1px solid #ebebeb', borderRadius: 6, boxShadow: '0 6px 20px rgba(0,0,0,.08)',
                  zIndex: 40, minWidth: 140, overflow: 'hidden',
                }}>
                  {isOwner ? (
                    <>
                      <button onClick={onStartEdit} style={menuItemStyle}>Edit</button>
                      <button onClick={onDelete} style={{ ...menuItemStyle, color: '#DC2626' }}>Delete</button>
                    </>
                  ) : (
                    <div style={{ padding: 6 }}>
                      <FlagButton targetType="comment" targetId={c.id} label="Report comment" compact={false} />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const menuItemStyle: React.CSSProperties = {
  display: 'block', width: '100%', textAlign: 'left',
  background: 'transparent', border: 'none', cursor: 'pointer',
  padding: '8px 12px', fontSize: 13, fontWeight: 600, color: '#1a1a1a',
}
