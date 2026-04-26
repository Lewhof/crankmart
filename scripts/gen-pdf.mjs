/**
 * Markdown -> PDF generator that renders Mermaid diagrams as SVG.
 * Uses Playwright (already a project dep) + marked + Mermaid CDN.
 *
 * Usage:
 *   node scripts/gen-pdf.mjs <input.md> [output.pdf]
 */

import { chromium } from 'playwright'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { marked } from 'marked'

const SRC = process.argv[2]
const OUT = process.argv[3] ?? SRC.replace(/\.md$/, '.pdf')
if (!SRC) {
  console.error('usage: node scripts/gen-pdf.mjs <input.md> [output.pdf]')
  process.exit(1)
}

const md = await readFile(resolve(SRC), 'utf8')

// Convert markdown to HTML, but preserve ```mermaid blocks for client-side rendering
marked.use({
  renderer: {
    code(code, lang) {
      if (lang === 'mermaid') return `<div class="mermaid">${code}</div>`
      const escaped = String(code).replace(/[&<>]/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[s]))
      return `<pre><code class="language-${lang ?? ''}">${escaped}</code></pre>`
    },
  },
})

const body = marked.parse(md)

const html = `<!doctype html><html><head><meta charset="utf-8"><title>CrankMart Operations Manual</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10.5pt; line-height: 1.5; color: #1a1a1a; max-width: none; }
  h1 { font-size: 22pt; color: #0D1B2A; border-bottom: 2px solid #0D1B2A; padding-bottom: 6px; margin-top: 24pt; }
  h2 { font-size: 15pt; color: #0D1B2A; margin-top: 20pt; border-bottom: 1px solid #ebebeb; padding-bottom: 4px; page-break-after: avoid; }
  h3 { font-size: 12pt; color: #1a1a1a; margin-top: 14pt; page-break-after: avoid; }
  h4 { font-size: 10.5pt; }
  p, li { font-size: 10.5pt; }
  code { font-family: Consolas, 'Courier New', monospace; background: #f5f5f5; padding: 1px 4px; border-radius: 3px; font-size: 9.5pt; }
  pre { background: #f5f5f5; border: 1px solid #ebebeb; border-radius: 4px; padding: 10px 12px; font-size: 9pt; overflow-x: auto; page-break-inside: avoid; }
  pre code { background: none; padding: 0; font-size: 9pt; }
  table { border-collapse: collapse; width: 100%; margin: 10pt 0; font-size: 9.5pt; page-break-inside: avoid; }
  th, td { border: 1px solid #ebebeb; padding: 6px 9px; text-align: left; vertical-align: top; }
  th { background: #f5f5f5; font-weight: 700; }
  blockquote { border-left: 3px solid #0D1B2A; padding-left: 10px; color: #555; margin: 8pt 0; }
  a { color: #0D1B2A; text-decoration: underline; word-break: break-all; }
  hr { border: none; border-top: 1px solid #ebebeb; margin: 18pt 0; }
  .mermaid { background: #fff; padding: 8pt; margin: 12pt 0; text-align: center; page-break-inside: avoid; }
  .mermaid svg { max-width: 100%; height: auto; }
</style>
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs'
  mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose', flowchart: { htmlLabels: true } })
  try {
    await mermaid.run({ querySelector: '.mermaid' })
  } catch (e) {
    console.error('Mermaid render error:', e)
  }
  window.__mermaidReady = true
</script>
</head><body>${body}</body></html>`

const tmp = resolve(process.cwd(), '.tmp-pdf-render.html')
await writeFile(tmp, html, 'utf8')

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(pathToFileURL(tmp).href)
await page.waitForFunction(() => window.__mermaidReady === true, { timeout: 30_000 })
await page.waitForTimeout(750)
await page.pdf({
  path: resolve(OUT),
  format: 'A4',
  printBackground: true,
  margin: { top: '18mm', right: '16mm', bottom: '18mm', left: '16mm' },
})
await browser.close()
console.log('PDF saved:', OUT)
