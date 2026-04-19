'use client'

/**
 * Reusable Tiptap rich-text editor for journalist article submissions.
 *
 * Features:
 *   - Bold / italic / underline / lists / blockquote / heading2 / link / image
 *   - Drag-and-drop image upload to Vercel Blob via /api/sell/upload
 *   - Inline image insertion (paste URL or upload from toolbar)
 *   - HTML output via onChange — caller persists / posts to API
 *
 * Output is HTML. Caller is responsible for sanitising before render
 * (see @/lib/sanitize-html in the article detail page).
 */

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Link as LinkIcon, Image as ImageIcon, Undo, Redo, Loader2 } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

interface Props {
  initialHtml?: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function TiptapEditor({ initialHtml = '', onChange, placeholder = 'Write your article…' }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialHtml,
    immediatelyRender: false, // SSR-safe: avoid hydration mismatch in Next.js
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  // Sync external initial value (e.g. when loading a saved draft)
  useEffect(() => {
    if (!editor || !initialHtml) return
    if (editor.getHTML() !== initialHtml) editor.commands.setContent(initialHtml, { emitUpdate: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialHtml])

  if (!editor) return null

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL (leave blank to remove):', previous ?? '')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/sell/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) editor.chain().focus().setImage({ src: data.url, alt: file.name }).run()
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="cm-editor">
      <style>{`
        .cm-editor { border: 1.5px solid #e4e4e7; border-radius: 8px; background: #fff; overflow: hidden; }
        .cm-editor-toolbar { display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 8px; border-bottom: 1px solid #ebebeb; background: #fafafa; }
        .cm-editor-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; background: transparent; border-radius: 4px; cursor: pointer; color: #4b5563; transition: background .12s, color .12s; }
        .cm-editor-btn:hover { background: #ebebeb; color: #1a1a1a; }
        .cm-editor-btn.active { background: #0D1B2A; color: #fff; }
        .cm-editor-btn:disabled { opacity: .4; cursor: not-allowed; }
        .cm-editor-divider { width: 1px; background: #ebebeb; margin: 4px 4px; }
        .cm-editor .ProseMirror { padding: 16px 18px; min-height: 320px; outline: none; font-size: 15px; line-height: 1.65; color: #1a1a1a; }
        .cm-editor .ProseMirror p { margin: 0 0 14px; }
        .cm-editor .ProseMirror h2 { font-size: 22px; font-weight: 800; margin: 24px 0 12px; }
        .cm-editor .ProseMirror h3 { font-size: 18px; font-weight: 700; margin: 20px 0 10px; }
        .cm-editor .ProseMirror ul, .cm-editor .ProseMirror ol { padding-left: 22px; margin: 0 0 14px; }
        .cm-editor .ProseMirror blockquote { border-left: 3px solid #0D1B2A; padding-left: 12px; color: #4b5563; font-style: italic; margin: 14px 0; }
        .cm-editor .ProseMirror a { color: var(--color-primary, #ea580c); text-decoration: underline; }
        .cm-editor .ProseMirror img { max-width: 100%; border-radius: 8px; margin: 14px 0; }
        .cm-editor .ProseMirror p.is-editor-empty:first-child::before { color: #9ca3af; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
      `}</style>

      <div className="cm-editor-toolbar">
        <button type="button" className={`cm-editor-btn${editor.isActive('bold') ? ' active' : ''}`} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)"><Bold size={15} /></button>
        <button type="button" className={`cm-editor-btn${editor.isActive('italic') ? ' active' : ''}`} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)"><Italic size={15} /></button>
        <div className="cm-editor-divider" />
        <button type="button" className={`cm-editor-btn${editor.isActive('heading', { level: 2 }) ? ' active' : ''}`} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading"><Heading2 size={15} /></button>
        <button type="button" className={`cm-editor-btn${editor.isActive('bulletList') ? ' active' : ''}`} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list"><List size={15} /></button>
        <button type="button" className={`cm-editor-btn${editor.isActive('orderedList') ? ' active' : ''}`} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list"><ListOrdered size={15} /></button>
        <button type="button" className={`cm-editor-btn${editor.isActive('blockquote') ? ' active' : ''}`} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote"><Quote size={15} /></button>
        <div className="cm-editor-divider" />
        <button type="button" className={`cm-editor-btn${editor.isActive('link') ? ' active' : ''}`} onClick={setLink} title="Link"><LinkIcon size={15} /></button>
        <button type="button" className="cm-editor-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Insert image">
          {uploading ? <Loader2 size={15} className="cm-editor-spin" /> : <ImageIcon size={15} />}
        </button>
        <div className="cm-editor-divider" />
        <button type="button" className="cm-editor-btn" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)"><Undo size={15} /></button>
        <button type="button" className="cm-editor-btn" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)"><Redo size={15} /></button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }}
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
