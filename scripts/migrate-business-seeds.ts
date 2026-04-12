/**
 * One-shot migration script.
 * Reads legacy business seed files, extracts inline data arrays,
 * normalises to BusinessSeed shape, dedupes on slug, groups by region,
 * and writes src/db/seeds/data/businesses/<region>.ts files plus index.
 *
 * Run: npx tsx scripts/migrate-business-seeds.ts
 */
import * as fs from 'fs'
import * as path from 'path'
import * as vm from 'vm'

type BusinessType = 'shop' | 'brand' | 'service_center' | 'tour_operator' | 'event_organiser'
type Status = 'pending' | 'verified' | 'suspended' | 'claimed' | 'removed'

interface BusinessSeed {
  name: string
  slug: string
  businessType: BusinessType
  description: string | null
  province: string | null
  city: string | null
  suburb: string | null
  address: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  website: string | null
  brandsStocked: string[]
  services: string[]
  specialisation: string[]
  seoTags: string[]
  logoUrl: string | null
  bannerUrl: string | null
  locationLat: string | null
  locationLng: string | null
  status: Status
  verified: boolean
  isPremium: boolean
  tier: string
}

const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'src/db/seeds/data/businesses')

const LEGACY_FILES: { file: string; arrayName: string; tag: string }[] = [
  { file: 'src/db/seed-directory-80.ts', arrayName: 'businesses', tag: 'directory-80' },
  { file: 'src/db/seed-businesses.ts', arrayName: 'businesses', tag: 'businesses' },
  { file: 'src/db/seed-bloemfontein-businesses.ts', arrayName: 'businesses', tag: 'bfn' },
  { file: 'src/db/seed-durban-businesses.ts', arrayName: 'businesses', tag: 'dbn' },
  { file: 'src/db/seed-east-london-businesses.ts', arrayName: 'businesses', tag: 'el' },
  { file: 'src/db/seed-pe-businesses.ts', arrayName: 'businesses', tag: 'pe' },
  { file: 'src/db/seed-stellenbosch-businesses.ts', arrayName: 'businesses', tag: 'stel' },
  { file: 'src/db/seed-missing-events.ts', arrayName: 'missing', tag: 'events-as-biz' },
]

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Evaluate a legacy TS file and return the named array as plain JS ──────────
function extractArrayFromSource(fullPath: string, arrayName: string): unknown[] {
  const src = fs.readFileSync(fullPath, 'utf-8')

  // Find the `const <arrayName>... = [` opening
  const openRe = new RegExp(`const\\s+${arrayName}\\b[^=]*=\\s*\\[`)
  const m = openRe.exec(src)
  if (!m) throw new Error(`Could not find const ${arrayName} in ${fullPath}`)
  const start = m.index + m[0].length - 1 // position of '['

  // Walk to find matching ']' — brace-aware, string-aware
  let i = start
  let depth = 0
  let inStr: string | null = null
  let esc = false
  while (i < src.length) {
    const c = src[i]
    if (inStr) {
      if (esc) esc = false
      else if (c === '\\') esc = true
      else if (c === inStr) inStr = null
    } else {
      if (c === '"' || c === "'" || c === '`') inStr = c
      else if (c === '[') depth++
      else if (c === ']') {
        depth--
        if (depth === 0) {
          i++
          break
        }
      }
    }
    i++
  }
  const arrayLiteral = src.slice(start, i)

  // Evaluate in sandbox. Object shorthand & TS-like syntax should be clean JS here.
  const ctx: Record<string, unknown> = {}
  vm.createContext(ctx)
  try {
    const result = vm.runInContext('(' + arrayLiteral + ')', ctx)
    if (!Array.isArray(result)) throw new Error('Not an array')
    return result
  } catch (e) {
    throw new Error(`Eval failed for ${fullPath}: ${(e as Error).message}`)
  }
}

// ── Parse pg text[] literal like '{"a","b"}' ──────────────────────────────────
function parsePgArrayLiteral(s: string): string[] {
  const trimmed = s.trim().replace(/^\{|\}$/g, '')
  if (!trimmed) return []
  const out: string[] = []
  let cur = ''
  let inStr = false
  let esc = false
  for (const ch of trimmed) {
    if (inStr) {
      if (esc) {
        cur += ch
        esc = false
      } else if (ch === '\\') esc = true
      else if (ch === '"') inStr = false
      else cur += ch
    } else {
      if (ch === '"') inStr = true
      else if (ch === ',') {
        out.push(cur)
        cur = ''
      } else cur += ch
    }
  }
  if (cur) out.push(cur)
  return out
}

function asArr(v: unknown): string[] {
  if (v == null) return []
  if (Array.isArray(v)) return v.filter((x) => typeof x === 'string' && x.length > 0) as string[]
  if (typeof v === 'string') {
    if (v.trim().startsWith('{')) return parsePgArrayLiteral(v)
    return v ? [v] : []
  }
  return []
}

function asStr(v: unknown): string | null {
  if (v == null) return null
  if (typeof v === 'string') {
    const t = v.trim()
    return t.length ? t : null
  }
  if (typeof v === 'number') return String(v)
  return null
}

function asNum(v: unknown): string | null {
  if (v == null || v === '') return null
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return String(Number(v))
  return null
}

function mapStatus(v: unknown): Status {
  const s = (asStr(v) || '').toLowerCase()
  if (s === 'active' || s === 'verified') return 'verified'
  if (s === 'claimed') return 'claimed'
  if (s === 'suspended' || s === 'paused') return 'suspended'
  if (s === 'removed' || s === 'disabled') return 'removed'
  return 'verified'
}

function mapBusinessType(v: unknown, categories?: unknown): BusinessType {
  const s = (asStr(v) || '').toLowerCase()
  const allowed = ['shop', 'brand', 'service_center', 'tour_operator', 'event_organiser']
  if (allowed.includes(s)) return s as BusinessType
  // legacy category words
  const cats = Array.isArray(categories)
    ? (categories as unknown[]).map((c) => String(c).toLowerCase())
    : []
  const lex = [s, ...cats]
  for (const l of lex) {
    if (l === 'bike_shop' || l === 'online_retailer' || l === 'shop') return 'shop'
    if (l === 'brand_importer' || l === 'brand') return 'brand'
    if (l === 'mechanic_workshop' || l === 'cycling_coach' || l === 'service_center') return 'service_center'
    if (l === 'event_organiser') return 'event_organiser'
    if (l === 'bike_hire' || l === 'tour_operator') return 'tour_operator'
  }
  return 'shop'
}

const PROVINCE_MAP: Record<string, string> = {
  WC: 'Western Cape',
  GP: 'Gauteng',
  KZN: 'KwaZulu-Natal',
  EC: 'Eastern Cape',
  LP: 'Limpopo',
  FS: 'Free State',
  MP: 'Mpumalanga',
  NW: 'North West',
  NC: 'Northern Cape',
}
function normProvince(v: unknown): string | null {
  const s = asStr(v)
  if (!s) return null
  return PROVINCE_MAP[s] || s
}

function countFilled(b: BusinessSeed): number {
  let n = 0
  for (const k of Object.keys(b) as (keyof BusinessSeed)[]) {
    const v = b[k]
    if (v == null) continue
    if (Array.isArray(v)) {
      if (v.length > 0) n++
      continue
    }
    if (typeof v === 'string' && v.length === 0) continue
    n++
  }
  return n
}

function normaliseRow(raw: Record<string, unknown>, tag: string): BusinessSeed | null {
  const name = asStr(raw.name)
  const rawSlug = asStr(raw.slug) || (name ? slugify(name) : null)
  if (!name || !rawSlug) return null
  const slug = slugify(rawSlug)
  if (!slug) return null

  let businessType = mapBusinessType(raw.business_type ?? raw.businessType, raw.categories)
  // Rows from seed-missing-events.ts have no business_type but represent event_organiser entities
  if (!raw.business_type && !raw.businessType && tag === 'events-as-biz') {
    businessType = 'event_organiser'
  }
  const verified = raw.verified === true || raw.is_verified === true || raw.is_verified === undefined
  const isPremium = raw.is_premium === true || raw.isPremium === true

  const row: BusinessSeed = {
    name,
    slug,
    businessType,
    description: asStr(raw.description),
    province: normProvince(raw.province),
    city: asStr(raw.city),
    suburb: asStr(raw.suburb),
    address: asStr(raw.address),
    phone: asStr(raw.phone),
    whatsapp: asStr(raw.whatsapp),
    email: asStr(raw.email),
    website: asStr(raw.website),
    brandsStocked: asArr(raw.brands_stocked ?? raw.brandsStocked),
    services: asArr(raw.services),
    specialisation: asArr(raw.specialisation),
    seoTags: asArr(raw.seo_tags ?? raw.seoTags),
    logoUrl: asStr(raw.logo_url ?? raw.logoUrl),
    bannerUrl: asStr(raw.banner_url ?? raw.bannerUrl),
    locationLat: asNum(raw.location_lat ?? raw.locationLat),
    locationLng: asNum(raw.location_lng ?? raw.locationLng),
    status: raw.status !== undefined ? mapStatus(raw.status) : 'verified',
    verified: verified === false ? false : true,
    isPremium: !!isPremium,
    tier: asStr(raw.tier) || 'free',
  }
  // Tag provenance via tier? no — we just keep it.
  void tag
  return row
}

// ── Regional grouping ──────────────────────────────────────────────────────────
type RegionKey =
  | 'cape-town'
  | 'stellenbosch'
  | 'western-cape-other'
  | 'johannesburg'
  | 'pretoria'
  | 'gauteng-other'
  | 'durban'
  | 'kwazulu-natal-other'
  | 'port-elizabeth'
  | 'east-london'
  | 'eastern-cape-other'
  | 'bloemfontein'
  | 'free-state-other'
  | 'northern-cape'
  | 'north-west'
  | 'mpumalanga'
  | 'limpopo'
  | 'online-nationwide'

function regionFor(b: BusinessSeed): RegionKey {
  const city = (b.city || '').toLowerCase()
  const prov = (b.province || '').toLowerCase()
  const addr = (b.address || '').toLowerCase()

  const isOnline = /online|nationwide|ships nationwide|multiple stores/.test(addr)
  if (isOnline && !city) return 'online-nationwide'

  if (prov === 'western cape') {
    if (city === 'cape town') return 'cape-town'
    if (city === 'stellenbosch') return 'stellenbosch'
    return 'western-cape-other'
  }
  if (prov === 'gauteng') {
    if (city === 'johannesburg') return 'johannesburg'
    if (city === 'pretoria') return 'pretoria'
    return 'gauteng-other'
  }
  if (prov === 'kwazulu-natal') {
    if (city === 'durban') return 'durban'
    return 'kwazulu-natal-other'
  }
  if (prov === 'eastern cape') {
    if (city === 'port elizabeth' || city === 'gqeberha') return 'port-elizabeth'
    if (city === 'east london') return 'east-london'
    return 'eastern-cape-other'
  }
  if (prov === 'free state') {
    if (city === 'bloemfontein') return 'bloemfontein'
    return 'free-state-other'
  }
  if (prov === 'northern cape') return 'northern-cape'
  if (prov === 'north west') return 'north-west'
  if (prov === 'mpumalanga') return 'mpumalanga'
  if (prov === 'limpopo') return 'limpopo'
  return 'online-nationwide'
}

// ── Serialise a row to TS source ───────────────────────────────────────────────
function tsStr(v: string | null): string {
  if (v === null) return 'null'
  return JSON.stringify(v)
}
function tsArr(arr: string[]): string {
  if (arr.length === 0) return '[]'
  return '[' + arr.map((s) => JSON.stringify(s)).join(', ') + ']'
}
function tsBool(b: boolean): string {
  return b ? 'true' : 'false'
}

function serialiseRow(b: BusinessSeed): string {
  return `    {
      name: ${tsStr(b.name)},
      slug: ${tsStr(b.slug)},
      businessType: ${tsStr(b.businessType)},
      description: ${tsStr(b.description)},
      province: ${tsStr(b.province)},
      city: ${tsStr(b.city)},
      suburb: ${tsStr(b.suburb)},
      address: ${tsStr(b.address)},
      phone: ${tsStr(b.phone)},
      whatsapp: ${tsStr(b.whatsapp)},
      email: ${tsStr(b.email)},
      website: ${tsStr(b.website)},
      brandsStocked: ${tsArr(b.brandsStocked)},
      services: ${tsArr(b.services)},
      specialisation: ${tsArr(b.specialisation)},
      seoTags: ${tsArr(b.seoTags)},
      logoUrl: ${tsStr(b.logoUrl)},
      bannerUrl: ${tsStr(b.bannerUrl)},
      locationLat: ${tsStr(b.locationLat)},
      locationLng: ${tsStr(b.locationLng)},
      status: ${tsStr(b.status)},
      verified: ${tsBool(b.verified)},
      isPremium: ${tsBool(b.isPremium)},
      tier: ${tsStr(b.tier)},
    },`
}

function toCamelVar(regionKey: string): string {
  return regionKey.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()) + 'Businesses'
}

function main() {
  console.log('\n=== Business seed migration ===\n')

  const allRaw: { row: Record<string, unknown>; tag: string }[] = []
  for (const { file, arrayName, tag } of LEGACY_FILES) {
    const p = path.join(ROOT, file)
    if (!fs.existsSync(p)) {
      console.log(`skip (missing): ${file}`)
      continue
    }
    try {
      const arr = extractArrayFromSource(p, arrayName)
      console.log(`extracted ${arr.length.toString().padStart(3)} rows from ${file}`)
      for (const r of arr) {
        if (r && typeof r === 'object') allRaw.push({ row: r as Record<string, unknown>, tag })
      }
    } catch (e) {
      console.log(`ERROR reading ${file}: ${(e as Error).message}`)
    }
  }

  // Normalise + dedup
  const bySlug = new Map<string, { row: BusinessSeed; tag: string; filled: number }>()
  const dropped: { reason: string; name?: string; tag: string }[] = []
  const dedupLog: { slug: string; winner: string; loser: string; reason: string }[] = []

  for (const { row, tag } of allRaw) {
    const norm = normaliseRow(row, tag)
    if (!norm) {
      dropped.push({ reason: 'missing name/slug', name: String(row?.name ?? ''), tag })
      continue
    }
    const filled = countFilled(norm)
    const existing = bySlug.get(norm.slug)
    if (!existing) {
      bySlug.set(norm.slug, { row: norm, tag, filled })
    } else if (filled > existing.filled) {
      dedupLog.push({
        slug: norm.slug,
        winner: `${tag} (${filled} fields)`,
        loser: `${existing.tag} (${existing.filled} fields)`,
        reason: 'richer',
      })
      bySlug.set(norm.slug, { row: norm, tag, filled })
    } else {
      dedupLog.push({
        slug: norm.slug,
        winner: `${existing.tag} (${existing.filled} fields)`,
        loser: `${tag} (${filled} fields)`,
        reason: filled === existing.filled ? 'first-wins' : 'existing richer',
      })
    }
  }

  // Group
  const groups = new Map<RegionKey, BusinessSeed[]>()
  for (const { row } of bySlug.values()) {
    const key = regionFor(row)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(row)
  }

  // Sort each group by name for stable output
  for (const rows of groups.values()) {
    rows.sort((a, b) => a.name.localeCompare(b.name))
  }

  // Ensure out dir
  fs.mkdirSync(OUT_DIR, { recursive: true })

  // Remove any old region files we might have written previously (but keep index.ts for now; we rewrite it)
  for (const entry of fs.readdirSync(OUT_DIR)) {
    if (entry === 'index.ts') continue
    if (entry.endsWith('.ts')) fs.unlinkSync(path.join(OUT_DIR, entry))
  }

  // Write files
  const writtenFiles: { region: RegionKey; file: string; varName: string; count: number }[] = []
  for (const [region, rows] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (rows.length === 0) continue
    const varName = toCamelVar(region)
    const body = `import type { RegionFile, BusinessSeed } from '../../types'

export const ${varName}: RegionFile<BusinessSeed> = {
  region: '${region}',
  rows: [
${rows.map(serialiseRow).join('\n')}
  ],
}
`
    const file = `${region}.ts`
    fs.writeFileSync(path.join(OUT_DIR, file), body)
    writtenFiles.push({ region, file, varName, count: rows.length })
  }

  // Rewrite index.ts
  const imports = writtenFiles
    .map(({ varName, file }) => `import { ${varName} } from './${file.replace(/\.ts$/, '')}'`)
    .join('\n')
  const listItems = writtenFiles.map(({ varName }) => `  ${varName},`).join('\n')
  const indexBody = `import type { RegionFile, BusinessSeed } from '../../types'
${imports}

export const businessRegions: RegionFile<BusinessSeed>[] = [
${listItems}
]
`
  fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), indexBody)

  // Report
  console.log('\n--- Counts per file ---')
  for (const { file, count } of writtenFiles) {
    console.log(`  ${file.padEnd(32)} ${count}`)
  }
  const total = writtenFiles.reduce((s, w) => s + w.count, 0)
  console.log(`  TOTAL unique: ${total}`)

  console.log(`\n--- Dropped (${dropped.length}) ---`)
  for (const d of dropped.slice(0, 20)) console.log(`  [${d.tag}] ${d.name}: ${d.reason}`)
  if (dropped.length > 20) console.log(`  ... +${dropped.length - 20} more`)

  console.log(`\n--- Dedup collisions (${dedupLog.length}) ---`)
  for (const d of dedupLog) {
    console.log(`  ${d.slug}: winner=${d.winner}  loser=${d.loser}  (${d.reason})`)
  }

  console.log('\nDone.')
}

main()
