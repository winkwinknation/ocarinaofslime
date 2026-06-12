// One-off: verify a rightward joystick drag moves the player screen-right on touch devices.
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
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(BASE)).ok) break
  } catch {
    await new Promise((r) => setTimeout(r, 500))
  }
}

const errors = []
const browser = await chromium.launch()
const ctx = await browser.newContext({ ...devices['iPhone 13 landscape'] })
const page = await ctx.newPage()
page.on('pageerror', (e) => errors.push(e.message))

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
await page.touchscreen.tap(400, 120)
await page.waitForTimeout(500)
await page.getByText('CONTINUE').tap()
await page.waitForTimeout(2000)
await page.screenshot({ path: 'tmp-shots/m-strafe-before.png' })

// joystick drag right via raw CDP touch events (anchor in left stick zone)
const client = await ctx.newCDPSession(page)
const ax = 130
const ay = 220
await client.send('Input.dispatchTouchEvent', {
  type: 'touchStart',
  touchPoints: [{ x: ax, y: ay, id: 1 }],
})
// glide to full right deflection, then hold
for (let i = 1; i <= 6; i++) {
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: ax + i * 12, y: ay, id: 1 }],
  })
  await page.waitForTimeout(30)
}
await page.waitForTimeout(800) // hold the deflection — player should run screen-right
await page.screenshot({ path: 'tmp-shots/m-strafe-during.png' })
await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
await page.waitForTimeout(300)
await page.screenshot({ path: 'tmp-shots/m-strafe-after.png' })

await browser.close()
server.kill()
console.log(errors.length ? `❌ ${errors.join('; ')}` : '✅ no runtime errors')
process.exit(errors.length ? 1 : 0)
