import crypto from 'crypto'

export const PAYFAST_SANDBOX = process.env.PAYFAST_SANDBOX === 'true'

export const PAYFAST_HOST = PAYFAST_SANDBOX
  ? 'https://sandbox.payfast.co.za'
  : 'https://www.payfast.co.za'

export const PAYFAST_CHECKOUT_URL = `${PAYFAST_HOST}/eng/process`

export const PAYFAST_MERCHANT_ID  = process.env.PAYFAST_MERCHANT_ID  ?? ''
export const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY ?? ''
export const PAYFAST_PASSPHRASE   = process.env.PAYFAST_PASSPHRASE   ?? ''

export function buildPayfastPayload(params: Record<string, string>): {
  fields: Record<string, string>
  signature: string
} {
  const sorted = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)
  )

  let paramString = Object.entries(sorted)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v)).replace(/%20/g, '+')}`)
    .join('&')

  if (PAYFAST_PASSPHRASE) {
    paramString += `&passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE).replace(/%20/g, '+')}`
  }

  const signature = crypto.createHash('md5').update(paramString).digest('hex')
  return { fields: sorted, signature }
}

export function validateItnSignature(data: Record<string, string>, receivedSignature: string): boolean {
  const { signature: _sig, ...rest } = data
  let paramString = Object.entries(rest)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, '+')}`)
    .join('&')

  if (PAYFAST_PASSPHRASE) {
    paramString += `&passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE).replace(/%20/g, '+')}`
  }

  const expected = crypto.createHash('md5').update(paramString).digest('hex')
  return expected === receivedSignature
}

const PAYFAST_IPS = [
  '197.97.145.144','41.74.179.192','41.74.179.193','41.74.179.194',
  '41.74.179.195','41.74.179.196','41.74.179.197','41.74.179.198',
  '41.74.179.199','41.74.179.200','41.74.179.201','41.74.179.202',
  '41.74.179.203','41.74.179.204','41.74.179.205','41.74.179.206',
  '196.33.227.224','196.33.227.225','196.33.227.226',
]

export function isPayfastIp(ip: string): boolean {
  if (PAYFAST_SANDBOX) return true
  return PAYFAST_IPS.includes(ip)
}
