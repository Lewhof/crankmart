/**
 * Sanitise HTML coming from the journalist submission editor (Tiptap).
 *
 * Allowlist matches the Tiptap toolbar features:
 *   - inline: strong, em, a, img
 *   - block: p, h2, h3, ul, ol, li, blockquote, br
 *
 * Strips scripts, iframes, event handlers, javascript: URLs etc.
 * Runs on both server (jsdom) and client (browser DOM) via isomorphic-dompurify.
 */

import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'a', 'img', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote']
const ALLOWED_ATTR = ['href', 'src', 'alt', 'rel', 'target']

export function sanitizeArticleHtml(dirty: string): string {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  })
}
