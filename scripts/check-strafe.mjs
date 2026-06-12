// One-off: verify D moves the player screen-right (background scrolls left).
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'

const BASE = 'http://127.0.0.1:4173/ocarinaofslime/'
mkdirSync('tmp-shots', { recursive: true })

const server = spawn(
  'npx',
  ['vite', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'],
  { shell: true, stdio: 'pipe' },
)
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(BASE)).ok) break
  } catch {
    await new Promise((r) => setTimeout(r, 500))
  }
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
await page.goto(BASE)
await page.evaluate(() =>
  localStorage.setItem(
    'ocarinaofslime-save-v1',
    JSON.stringify({
      scene: 'village', hearts: 3, maxHearts: 3, gloopees: 0,
      items: [], songs: [], cheats: [], flags: [], heyCount: 0,
      gossipFound: [], recordFish: 0,
    }),
  ),
)
await page.goto(BASE)
await page.waitForTimeout(2000)
await page.keyboard.press('x')
await page.waitForTimeout(500)
await page.getByText('CONTINUE').click()
await page.waitForTimeout(2000)
await page.screenshot({ path: 'tmp-shots/strafe-before.png' })
await page.keyboard.down('d')
await page.waitForTimeout(700)
await page.keyboard.up('d')
await page.waitForTimeout(300)
await page.screenshot({ path: 'tmp-shots/strafe-after.png' })
await browser.close()
server.kill()
console.log('done')
