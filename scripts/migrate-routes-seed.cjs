/* eslint-disable */
/**
 * One-shot migration script: legacy route seed files -> per-province RouteSeed files.
 * Does NOT touch the DB. Reads legacy .ts files, regex-extracts the array literal,
 * eval-parses it, normalizes to target schema, dedupes on slug, writes province files.
 *
 *   node scripts/migrate-routes-seed.cjs
 */
'use strict'
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'src/db/seeds/data/routes')

// --- Source files (in priority order — later wins on dup when v2=true) ---
// v2 wins for GP; for all others first-occurrence wins.
const SOURCES = [
  { file: path.join(ROOT, 'seed-routes-v2.ts'),                           arrayName: 'routes', shape: 'flat',    v2: false },
  { file: path.join(ROOT, 'src/db/seed-joburg-pretoria-routes.ts'),       arrayName: 'routes', shape: 'flat',    v2: false },
  { file: path.join(ROOT, 'src/db/seed-joburg-pretoria-routes-v2.ts'),    arrayName: 'routes', shape: 'flat',    v2: true  },
  { file: path.join(ROOT, 'src/db/seed-durban-routes.ts'),                arrayName: 'routes', shape: 'flat',    v2: false },
  { file: path.join(ROOT, 'src/db/seed-bloemfontein-routes.ts'),          arrayName: 'routes', shape: 'flat',    v2: false },
  { file: path.join(ROOT, 'src/db/seed-nelspruit-routes.ts'),             arrayName: 'routes', shape: 'flat',    v2: false },
  { file: path.join(ROOT, 'src/db/seed-limpopo-routes.ts'),               arrayName: 'routes', shape: 'flat',    v2: false },
  { file: path.join(ROOT, 'src/db/seed-northern-cape-routes.ts'),         arrayName: 'data',   shape: 'wrapped', v2: false },
  { file: path.join(ROOT, 'src/db/seed-northwest-routes.ts'),             arrayName: 'data',   shape: 'wrapped', v2: false },
]

// --- Province mapping ---
const PROVINCE_SLUG = {
  'Western Cape':    'western-cape',
  'Eastern Cape':    'eastern-cape',
  'KwaZulu-Natal':   'kwazulu-natal',
  'Gauteng':         'gauteng',
  'Free State':      'free-state',
  'North West':      'north-west',
  'Northern Cape':   'northern-cape',
  'Mpumalanga':      'mpumalanga',
  'Limpopo':         'limpopo',
}

const DISCIPLINES = new Set(['road','mtb','gravel','urban','bikepacking'])
const DIFFICULTIES = new Set(['beginner','intermediate','advanced','expert'])
const SURFACES = new Set(['tarmac','gravel','singletrack','mixed'])

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Extract the top-level array literal following `const <name> = [` */
function extractArrayLiteral(source, name) {
  const re = new RegExp(`const\\s+${name}\\s*(?::\\s*[^=]+)?=\\s*\\[`, 'm')
  const m = re.exec(source)
  if (!m) throw new Error(`Array "${name}" not found`)
  const start = m.index + m[0].length - 1 // position of '['
  // walk string, tracking string state + bracket depth
  let i = start
  let depth = 0
  let inStr = null // '"' | "'" | '`'
  let inLineComment = false
  let inBlockComment = false
  for (; i < source.length; i++) {
    const c = source[i]
    const n = source[i+1]
    if (inLineComment) {
      if (c === '\n') inLineComment = false
      continue
    }
    if (inBlockComment) {
      if (c === '*' && n === '/') { inBlockComment = false; i++ }
      continue
    }
    if (inStr) {
      if (c === '\\') { i++; continue }
      if (c === inStr) inStr = null
      continue
    }
    if (c === '/' && n === '/') { inLineComment = true; i++; continue }
    if (c === '/' && n === '*') { inBlockComment = true; i++; continue }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue }
    if (c === '[') depth++
    else if (c === ']') {
      depth--
      if (depth === 0) return source.slice(start, i + 1)
    }
  }
  throw new Error(`Unterminated array "${name}"`)
}

/** Eval a JS array-literal string safely (no external refs). */
function evalArray(literal) {
  // The literal uses template strings + single/double quotes + object shorthand — all valid JS.
  // We run in a sandboxed Function with `undefined` globals.
  const fn = new Function(`"use strict"; return (${literal});`)
  return fn()
}

function coerceEnum(v, set, fallback) {
  if (typeof v !== 'string') return fallback
  const s = v.toLowerCase().trim()
  return set.has(s) ? s : fallback
}

function coerceSurface(v, discipline) {
  if (typeof v !== 'string') return 'mixed'
  const s = v.toLowerCase().trim()
  if (SURFACES.has(s)) return s
  if (s === 'dirt') return discipline === 'mtb' ? 'singletrack' : 'gravel'
  return 'mixed'
}

function coerceNumericString(v) {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  if (typeof v === 'string') {
    const m = v.match(/-?\d+(?:\.\d+)?/)
    if (m) return m[0]
  }
  return null
}

function coerceInt(v) {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : parseInt(String(v), 10)
  return Number.isFinite(n) ? Math.round(n) : null
}

function normaliseRow(raw, heroImages) {
  if (!raw || typeof raw !== 'object') return null
  const name = typeof raw.name === 'string' ? raw.name.trim() : ''
  const rawSlug = typeof raw.slug === 'string' && raw.slug ? raw.slug : name
  const slug = slugify(rawSlug)
  if (!name || !slug) return null

  const discipline = coerceEnum(raw.discipline, DISCIPLINES, 'mtb')
  const difficulty = coerceEnum(raw.difficulty, DIFFICULTIES, 'intermediate')
  const surface    = coerceSurface(raw.surface, discipline)

  const distanceKm  = coerceNumericString(raw.distance_km ?? raw.distanceKm)
  const elevationM  = coerceInt(raw.elevation_m ?? raw.elevationM)
  const estTimeMin  = coerceInt(raw.est_time_min ?? raw.estTimeMin)

  const province = typeof raw.province === 'string' && raw.province.trim() ? raw.province.trim() : null
  const region   = typeof raw.region   === 'string' && raw.region.trim()   ? raw.region.trim()   : null
  const town     = typeof raw.town     === 'string' && raw.town.trim()     ? raw.town.trim()     : null
  const lat      = coerceNumericString(raw.lat)
  const lng      = coerceNumericString(raw.lng)

  const tags = Array.isArray(raw.tags) ? raw.tags.filter(t => typeof t === 'string') : []
  const facilities = raw.facilities && typeof raw.facilities === 'object' && !Array.isArray(raw.facilities)
    ? raw.facilities : {}

  const heroImg = (heroImages && heroImages[slug]) || raw.hero_image_url || raw.heroImageUrl || null
  const primaryImg = raw.primary_image_url ?? raw.primaryImageUrl ?? heroImg ?? null

  return {
    slug,
    name,
    description: typeof raw.description === 'string' && raw.description ? raw.description : null,
    discipline,
    difficulty,
    surface,
    distanceKm,
    elevationM,
    estTimeMin,
    province: province ?? '',
    region,
    town,
    lat,
    lng,
    gpxUrl:      raw.gpx_url      ?? raw.gpxUrl      ?? null,
    heroImageUrl: heroImg ?? null,
    facilities,
    tags,
    websiteUrl:   raw.website_url  ?? raw.websiteUrl  ?? null,
    contactEmail: raw.contact_email?? raw.contactEmail?? null,
    contactPhone: raw.contact_phone?? raw.contactPhone?? null,
    isVerified:  Boolean(raw.is_verified ?? raw.isVerified ?? false),
    isFeatured:  Boolean(raw.is_featured ?? raw.isFeatured ?? false),
    status: 'approved',
    primaryImageUrl: primaryImg ?? null,
    sourceName:  raw.source_name ?? raw.sourceName ?? null,
    sourceUrl:   raw.source_url  ?? raw.sourceUrl  ?? null,
  }
}

function extractHeroImages(source) {
  const m = /const\s+heroImages\s*:\s*Record<string,\s*string>\s*=\s*\{/m.exec(source)
  if (!m) return {}
  const start = m.index + m[0].length - 1
  let i = start, depth = 0, inStr = null
  for (; i < source.length; i++) {
    const c = source[i]
    if (inStr) {
      if (c === '\\') { i++; continue }
      if (c === inStr) inStr = null
      continue
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue }
    if (c === '{') depth++
    else if (c === '}') { depth--; if (depth === 0) { i++; break } }
  }
  const literal = source.slice(start, i)
  try { return new Function(`"use strict"; return (${literal});`)() } catch { return {} }
}

// --- Collect ---
const bySlug = new Map()   // slug -> { row, sourceFile, v2 }
const dedupLog = []
const droppedLog = []
const flags = []

for (const src of SOURCES) {
  if (!fs.existsSync(src.file)) { flags.push(`MISSING FILE: ${src.file}`); continue }
  const text = fs.readFileSync(src.file, 'utf8')
  let literal, arr
  try {
    literal = extractArrayLiteral(text, src.arrayName)
    arr = evalArray(literal)
  } catch (e) {
    flags.push(`PARSE FAIL ${src.file}: ${e.message}`)
    continue
  }
  const heroImages = extractHeroImages(text)

  // Unwrap wrapped { route, loops } shape
  const raws = src.shape === 'wrapped'
    ? arr.map(x => x && x.route ? x.route : null).filter(Boolean)
    : arr

  for (const raw of raws) {
    const row = normaliseRow(raw, heroImages)
    if (!row) {
      droppedLog.push({ source: path.basename(src.file), reason: 'missing slug/name', raw: raw && (raw.name || raw.slug) })
      continue
    }
    // Surface mapping flag
    if (typeof raw.surface === 'string' && !SURFACES.has(raw.surface.toLowerCase()) && raw.surface.toLowerCase() !== 'dirt') {
      flags.push(`UNKNOWN surface="${raw.surface}" on ${row.slug} (${path.basename(src.file)}) -> "${row.surface}"`)
    }
    if (typeof raw.surface === 'string' && raw.surface.toLowerCase() === 'dirt') {
      flags.push(`surface="dirt" legacy -> "${row.surface}" on ${row.slug}`)
    }
    // Distance string form check
    if (typeof raw.distance_km === 'string' && /[a-z]/i.test(raw.distance_km)) {
      flags.push(`distance_km non-numeric "${raw.distance_km}" on ${row.slug} extracted -> ${row.distanceKm}`)
    }

    const existing = bySlug.get(row.slug)
    if (!existing) {
      bySlug.set(row.slug, { row, sourceFile: path.basename(src.file), v2: src.v2 })
    } else {
      // v2 wins; otherwise first-occurrence wins
      if (src.v2 && !existing.v2) {
        dedupLog.push(`DUP ${row.slug}: v2 (${path.basename(src.file)}) OVERRIDES ${existing.sourceFile}`)
        bySlug.set(row.slug, { row, sourceFile: path.basename(src.file), v2: true })
      } else {
        dedupLog.push(`DUP ${row.slug}: kept ${existing.sourceFile}, dropped ${path.basename(src.file)}`)
      }
    }
  }
}

// --- Group by province ---
const byProvince = new Map() // provinceSlug -> rows[]
for (const [, entry] of bySlug) {
  const row = entry.row
  const pSlug = PROVINCE_SLUG[row.province]
  if (!pSlug) {
    flags.push(`UNKNOWN province "${row.province}" on ${row.slug} — dropping`)
    droppedLog.push({ source: entry.sourceFile, reason: `unknown province "${row.province}"`, raw: row.slug })
    continue
  }
  if (!byProvince.has(pSlug)) byProvince.set(pSlug, [])
  byProvince.get(pSlug).push(row)
}

// --- Emit TS files ---
function tsStringLiteral(s) {
  if (s === null || s === undefined) return 'null'
  return JSON.stringify(s)
}
function tsValue(v) {
  if (v === null || v === undefined) return 'null'
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'string') return JSON.stringify(v)
  if (Array.isArray(v)) return '[' + v.map(tsValue).join(', ') + ']'
  if (typeof v === 'object') {
    const keys = Object.keys(v)
    if (keys.length === 0) return '{}'
    return '{ ' + keys.map(k => `${JSON.stringify(k)}: ${tsValue(v[k])}`).join(', ') + ' }'
  }
  return 'null'
}

function camelConst(provinceSlug) {
  return provinceSlug.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) + 'Routes'
}

function emitProvinceFile(provinceSlug, rows) {
  const varName = camelConst(provinceSlug)
  rows.sort((a,b) => a.slug.localeCompare(b.slug))
  let out = `import type { RegionFile, RouteSeed } from '../../types'\n\n`
  out += `export const ${varName}: RegionFile<RouteSeed> = {\n`
  out += `  region: '${provinceSlug}',\n`
  out += `  rows: [\n`
  for (const r of rows) {
    out += `    {\n`
    const keyOrder = [
      'slug','name','description','discipline','difficulty','surface',
      'distanceKm','elevationM','estTimeMin',
      'province','region','town','lat','lng',
      'gpxUrl','heroImageUrl','facilities','tags',
      'websiteUrl','contactEmail','contactPhone',
      'isVerified','isFeatured','status',
      'primaryImageUrl','sourceName','sourceUrl',
    ]
    for (const k of keyOrder) {
      out += `      ${k}: ${tsValue(r[k])},\n`
    }
    out += `    },\n`
  }
  out += `  ],\n}\n`
  return { varName, content: out }
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

const indexImports = []
const indexEntries = []
for (const [provinceSlug, rows] of [...byProvince.entries()].sort((a,b) => a[0].localeCompare(b[0]))) {
  const { varName, content } = emitProvinceFile(provinceSlug, rows)
  fs.writeFileSync(path.join(OUT_DIR, `${provinceSlug}.ts`), content, 'utf8')
  indexImports.push(`import { ${varName} } from './${provinceSlug}'`)
  indexEntries.push(`  ${varName},`)
}

// --- index.ts ---
let indexOut = `import type { RegionFile, RouteSeed } from '../../types'\n`
for (const line of indexImports) indexOut += line + '\n'
indexOut += `\nexport const routeRegions: RegionFile<RouteSeed>[] = [\n`
indexOut += indexEntries.join('\n') + '\n'
indexOut += `]\n`
fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), indexOut, 'utf8')

// --- Report ---
const report = []
report.push('=== ROUTE SEED MIGRATION REPORT ===')
report.push('')
report.push('Counts per province:')
let grandTotal = 0
for (const [p, rows] of [...byProvince.entries()].sort((a,b) => a[0].localeCompare(b[0]))) {
  report.push(`  ${p.padEnd(16)} ${rows.length}`)
  grandTotal += rows.length
}
report.push(`  ${'TOTAL'.padEnd(16)} ${grandTotal}`)
report.push('')
report.push(`Dropped: ${droppedLog.length}`)
for (const d of droppedLog) report.push(`  - [${d.source}] ${d.reason} (${d.raw})`)
report.push('')
report.push(`Dedup events: ${dedupLog.length}`)
for (const d of dedupLog) report.push(`  - ${d}`)
report.push('')
report.push(`Flags / mapping notes: ${flags.length}`)
for (const f of flags) report.push(`  - ${f}`)
console.log(report.join('\n'))
