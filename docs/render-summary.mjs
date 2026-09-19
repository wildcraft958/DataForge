/**
 * Renders concept-summary.md to concept-summary.pdf.
 *
 * The summary had no regeneration path, so its PDF drifted behind its source.
 * This closes that. Styling follows the Pathway palette the deck uses, so the
 * three written deliverables and the talk read as one piece of work.
 *
 *   node docs/render-summary.mjs
 */
import puppeteer from 'puppeteer'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Inline spans, applied after escaping so the markers survive.
function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

function mdToHtml(md) {
  const out = []
  const lines = md.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) { i++; continue }

    const heading = line.match(/^(#{1,4})\s+(.*)$/)
    if (heading) {
      const level = heading[1].length
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`)
      i++
      continue
    }

    // A table is a header row, a separator row, then body rows.
    if (line.startsWith('|') && (lines[i + 1] || '').match(/^\|[\s:|-]+\|$/)) {
      const cells = (r) => r.split('|').slice(1, -1).map((c) => c.trim())
      const head = cells(line)
      i += 2
      const body = []
      while (i < lines.length && lines[i].startsWith('|')) { body.push(cells(lines[i])); i++ }
      out.push(
        '<table><thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') +
        '</tr></thead><tbody>' +
        body.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') +
        '</tbody></table>'
      )
      continue
    }

    if (/^\d+\.\s/.test(line) || /^[-*]\s/.test(line)) {
      const ordered = /^\d+\.\s/.test(line)
      const items = []
      while (i < lines.length && (/^\d+\.\s/.test(lines[i]) || /^[-*]\s/.test(lines[i]))) {
        items.push(lines[i].replace(/^(\d+\.|[-*])\s/, ''))
        i++
      }
      const tag = ordered ? 'ol' : 'ul'
      out.push(`<${tag}>` + items.map((t) => `<li>${inline(t)}</li>`).join('') + `</${tag}>`)
      continue
    }

    const para = []
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith('#') && !lines[i].startsWith('|')) {
      para.push(lines[i]); i++
    }
    out.push(`<p>${inline(para.join(' '))}</p>`)
  }

  return out.join('\n')
}

const CSS = `
  @page { size: A4; margin: 12mm 14mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: #ffffff; color: #1a1a1a;
    font-family: 'Inter', -apple-system, system-ui, sans-serif;
    font-size: 9.1pt; line-height: 1.42;
  }
  h1 {
    font-family: 'Funnel Display', Inter, sans-serif;
    font-size: 18pt; font-weight: 700; letter-spacing: -0.02em;
    margin: 0 0 3pt; color: #000;
  }
  h1 + p { color: #4b4b4b; }
  h2 {
    font-family: 'Funnel Display', Inter, sans-serif;
    font-size: 11pt; font-weight: 600; letter-spacing: -0.01em;
    margin: 10pt 0 4pt; padding-top: 4pt; color: #000;
    border-top: 1px solid #e9e9e9;
  }
  h2:first-of-type { border-top: 0; }
  p { margin: 0 0 5pt; }
  strong { color: #000; font-weight: 600; }
  code {
    font-family: 'Inconsolata', ui-monospace, monospace;
    font-size: 9pt; background: #f6f6f6; border: 1px solid #e9e9e9;
    border-radius: 3px; padding: 0 3px; color: #0a85eb;
  }
  a { color: #1e6bdd; text-decoration: none; }
  ol, ul { margin: 0 0 6pt; padding-left: 15pt; }
  li { margin-bottom: 2pt; }
  table {
    width: 100%; border-collapse: collapse; margin: 6pt 0 8pt;
    font-size: 8.6pt; break-inside: avoid;
  }
  th {
    text-align: left; font-weight: 600; color: #000;
    background: #f6f6f6; border-bottom: 1.5px solid #c8c8c8;
    padding: 4pt 6pt;
  }
  td { padding: 3pt 6pt; border-bottom: 1px solid #e9e9e9; color: #4b4b4b; }
  tr:last-child td { border-bottom: 0; }
  .footer {
    margin-top: 12pt; padding-top: 6pt; border-top: 1px solid #e9e9e9;
    font-family: 'Inconsolata', monospace; font-size: 7.6pt; color: #8c8c8c;
    display: flex; justify-content: space-between;
  }
`

const md = readFileSync(resolve(__dirname, 'concept-summary.md'), 'utf-8')
const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@400;600;700&family=Inter:wght@400;500;600&family=Inconsolata:wght@400;600&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>
${mdToHtml(md)}
<div class="footer"><span>DataForge 2026 &middot; Pathway Track</span><span>One-page concept summary</span></div>
</body></html>`

writeFileSync(resolve(__dirname, 'concept-summary.html'), html)

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.setContent(html, { waitUntil: 'networkidle0' })
await page.pdf({ path: resolve(__dirname, 'concept-summary.pdf'), format: 'A4', printBackground: true })
await browser.close()

const words = md.replace(/^\|.*$/gm, '').replace(/`[^`]*`/g, ' ').replace(/[#|*`-]/g, ' ').split(/\s+/).filter(Boolean).length
console.log(`Rendered concept-summary.pdf (${words} prose words, limit 950)`)
