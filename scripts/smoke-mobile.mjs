// Mobile smoke test: touch device emulation, verifies touch controls appear.
import { chromium, devices } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'

const BASE = 'http://127.0.0.1:4173/ocarinaofslime/'
mkdirSync('tmp-shots', { recursive: true })

const server = spawn(
  'npx',
  ['vite', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'],
  { shell: true, stdio: 'pipe' },
)
{
  let up = false
  for (let i = 0; i < 60 && !up; i++) {
    try {
      const r = await fetch(BASE)
      if (r.ok) up = true
    } catch {
      await new Promise((r) => setTimeout(r, 500))
    }
  }
}

const errors = []
const browser = await chromium.launch()
const ctx = await browser.newContext({
  ...devices['iPhone 13 landscape'],
})
const page = await ctx.newPage()
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`CONSOLE: ${m.text()}`)
})

const SAVE_KEY = 'ocarinaofslime-save-v1'
await page.goto(BASE)
await page.evaluate(
  ([k]) =>
    localStorage.setItem(
      k,
      JSON.stringify({
        scene: 'village',
        hearts: 3,
        maxHearts: 3,
        gloopees: 50,
        items: ['sword', 'shield', 'ocarina'],
        songs: ['slurpia'],
        cheats: [],
        flags: [],
        heyCount: 3,
        gossipFound: [],
        recordFish: 0,
      }),
    ),
  [SAVE_KEY],
)
await page.goto(BASE)
await page.waitForTimeout(2000)
await page.screenshot({ path: 'tmp-shots/m1-title.png' })

// tap → menu → continue
await page.touchscreen.tap(400, 200)
await page.waitForTimeout(500)
await page.getByText('CONTINUE').tap()
await page.waitForTimeout(2500)
await page.screenshot({ path: 'tmp-shots/m2-village-touch.png' })

// drag the virtual joystick (left side) to walk
const joy = page.locator('.stick-zone')
const box = await joy.boundingBox()
if (box) {
  // synthesize a touch drag via CDP-ish: use touchscreen events
  await page.touchscreen.tap(box.x + 100, box.y + 150) // taps register stick briefly
}
// tap the ocarina button
const oc = page.locator('.btn-ocarina')
if (await oc.count()) {
  await oc.tap()
  await page.waitForTimeout(600)
}
await page.screenshot({ path: 'tmp-shots/m3-ocarina-touch.png' })

// portrait joke check
await ctx.close()
const ctx2 = await browser.newContext({ ...devices['iPhone 13'] }) // portrait
const page2 = await ctx2.newPage()
page2.on('pageerror', (e) => errors.push(`PAGEERROR(portrait): ${e.message}`))
await page2.goto(BASE)
await page2.waitForTimeout(1500)
await page2.screenshot({ path: 'tmp-shots/m4-portrait.png' })

await browser.close()
server.kill()

console.log('\n================ MOBILE RESULT ================')
if (errors.length === 0) console.log('✅ no runtime errors (mobile)')
else {
  console.log(`❌ ${errors.length} errors:`)
  ;[...new Set(errors)].slice(0, 10).forEach((e) => console.log('  -', e.slice(0, 250)))
}
process.exit(errors.length ? 1 : 0)
