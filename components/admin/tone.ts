export type PillTone = 'neutral' | 'success' | 'warn' | 'danger' | 'accent'

export function toneForStatus(status?: string): PillTone {
  switch (status) {
    case 'approved':
    case 'active':
    case 'verified':
    case 'published':
      return 'success'
    case 'pending':
    case 'pending_review':
    case 'draft':
      return 'warn'
    case 'rejected':
    case 'banned':
    case 'expired':
    case 'removed':
      return 'danger'
    case 'featured':
      return 'accent'
    default:
      return 'neutral'
  }
}
