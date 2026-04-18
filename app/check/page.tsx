import { permanentRedirect } from 'next/navigation'

/**
 * Legacy landing — /check was G4's original path. Promoted into /community/check
 * as part of G5 (community launch). 308-redirect keeps external SEO + WhatsApp
 * links working.
 */
export default function CheckLandingRedirect() {
  permanentRedirect('/community/check')
}
