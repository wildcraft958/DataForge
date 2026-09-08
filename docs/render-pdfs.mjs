import puppeteer from 'puppeteer'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function renderPDF(htmlPath, outputPath) {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  const html = readFileSync(resolve(__dirname, htmlPath), 'utf-8')
  await page.setContent(html, { waitUntil: 'networkidle0' })
  await page.pdf({
    path: resolve(__dirname, outputPath),
    format: 'A4',
    margin: { top: '0.6in', bottom: '0.6in', left: '0.7in', right: '0.7in' },
    printBackground: true,
  })
  await browser.close()
  console.log(`Rendered ${outputPath}`)
}

await renderPDF('concept-summary.html', 'concept-summary.pdf')
await renderPDF('blog.html', 'blog.pdf')
