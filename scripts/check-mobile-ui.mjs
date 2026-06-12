// One-off: joystick anchored at the very bottom edge must stay fully on-screen,
// and the fullscreen button should sit next to pause.
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

const vp = page.viewportSize()
const client = await ctx.newCDPSession(page)
let fail = false

async function touchAt(x, y, shot) {
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] })
  await page.waitForTimeout(350)
  await page.screenshot({ path: `tmp-shots/${shot}.png` })
  const box = await page.locator('.stick-base').boundingBox()
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(200)
  return box
}

// 1) touch the middle of the stick zone: base must center on the touch point
const mid = { x: 200, y: Math.round(vp.height * 0.55) }
const b1 = await touchAt(mid.x, mid.y, 'm-mid-joystick')
if (!b1) {
  console.log('❌ stick base not visible (mid touch)')
  fail = true
} else {
  const cx = b1.x + b1.width / 2
  const cy = b1.y + b1.height / 2
  const off = Math.hypot(cx - mid.x, cy - mid.y)
  console.log(
    off < 4
      ? `✅ joystick centers on touch point (off by ${off.toFixed(1)}px)`
      : `❌ joystick misplaced: touch (${mid.x},${mid.y}) vs base center (${cx.toFixed(1)},${cy.toFixed(1)})`,
  )
  if (off >= 4) fail = true
}

// 2) touch the extreme bottom-left corner: base must stay fully on-screen
const b2 = await touchAt(8, vp.height - 6, 'm-edge-joystick')
if (!b2) {
  console.log('❌ stick base not visible (edge touch)')
  fail = true
} else {
  const inside =
    b2.x >= 0 && b2.y >= 0 && b2.x + b2.width <= vp.width && b2.y + b2.height <= vp.height
  console.log(
    inside
      ? `✅ edge touch: joystick fully on-screen at (${Math.round(b2.x)}, ${Math.round(b2.y)})`
      : `❌ edge touch: joystick offscreen x=${b2.x} y=${b2.y} w=${b2.width} h=${b2.height} viewport=${vp.width}×${vp.height}`,
  )
  if (!inside) fail = true
}

// fullscreen button present?
const fsBtn = await page.locator('.btn-fullscreen').count()
console.log(fsBtn ? '✅ fullscreen button present' : '❌ fullscreen button missing')
if (!fsBtn) fail = true

await browser.close()
server.kill()
console.log(errors.length ? `❌ runtime errors: ${errors.join('; ')}` : '✅ no runtime errors')
process.exit(fail || errors.length ? 1 : 0)
