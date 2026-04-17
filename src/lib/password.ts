import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core'
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'

let configured = false

function configure() {
  if (configured) return
  zxcvbnOptions.setOptions({
    translations: zxcvbnEnPackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...zxcvbnEnPackage.dictionary,
    },
  })
  configured = true
}

export interface PasswordCheckResult {
  ok: boolean
  score: number
  message?: string
}

export function checkPasswordStrength(password: string, userInputs: string[] = []): PasswordCheckResult {
  if (password.length < 8) {
    return { ok: false, score: 0, message: 'Password must be at least 8 characters.' }
  }
  configure()
  const result = zxcvbn(password, userInputs)
  if (result.score < 2) {
    const suggestion = result.feedback.warning || result.feedback.suggestions[0] || 'Choose a stronger password.'
    return { ok: false, score: result.score, message: suggestion }
  }
  return { ok: true, score: result.score }
}
