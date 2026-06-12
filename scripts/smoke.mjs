// Headless smoke test: loads the built game, walks through every scene,
// and reports runtime console errors. Run `npm run build` + `vite preview` first,
// or just `node scripts/smoke.mjs` (it starts its own preview server).
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'

const BASE = 'http://127.0.0.1:4173/ocarinaofslime/'
const SHOT_DIR = 'tmp-shots'
mkdirSync(SHOT_DIR, { recursive: true })

const SAVE_KEY = 'ocarinaofslime-save-v1'
const fullSave = (scene) =>
  JSON.stringify({
    scene,
    hearts: 5,
    maxHearts: 5,
    gloopees: 150,
    items: ['sword', 'shield', 'ocarina'],
    songs: ['lullaby', 'sloshpona', 'squelch', 'slurpia', 'slime'],
    cheats: [],
    flags: ['smido-open', 'dungeon-intro'],
    heyCount: 12,
    gossipFound: [],
    recordFish: 0,
  })

// start preview server
const server = spawn(
  'npx',
  ['vite', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'],
  { shell: true, stdio: 'pipe' },
)
server.stderr.on('data', (d) => process.stderr.write(d))
// poll until the server actually answers
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
  if (!up) {
    server.kill()
    throw new Error('preview server never came up')
  }
}

const errors = []
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`CONSOLE: ${m.text()}`)
})

async function shot(name) {
  await page.screenshot({ path: `${SHOT_DIR}/${name}.png` })
  console.log(`📸 ${name} (errors so far: ${errors.length})`)
}

// ---------- title ----------
await page.goto(BASE)
await page.waitForTimeout(2500)
await shot('01-title')

// press any key → menu
await page.keyboard.press('x')
await page.waitForTimeout(600)
await shot('02-title-menu')

// ---------- new game → intro ----------
await page.getByText('NEW GAME').click()
await page.waitForTimeout(800)
await shot('03-intro')

// advance all intro cards
for (let i = 0; i < 8; i++) {
  await page.keyboard.press('x')
  await page.waitForTimeout(250)
}
await page.waitForTimeout(1500)
await shot('04-village')

// walk around + open a dialogue (mailbox is near spawn)
await page.keyboard.down('w')
await page.waitForTimeout(1200)
await page.keyboard.up('w')
await page.waitForTimeout(400)
await shot('05-village-walk')

// ---------- jump to plains via injected save ----------
async function loadScene(scene, name, settleMs = 2500) {
  await page.evaluate(
    ([k, v]) => localStorage.setItem(k, v),
    [SAVE_KEY, fullSave(scene)],
  )
  await page.goto(BASE)
  await page.waitForTimeout(1500)
  await page.keyboard.press('x') // any key → menu
  await page.waitForTimeout(500)
  await page.getByText('CONTINUE').click()
  await page.waitForTimeout(settleMs)
  await shot(name)
}

await loadScene('plains', '06-plains')

// open the ocarina and play Sloshpona's song (▲ ► ▼ ▲ ► ▼)
await page.keyboard.press('z')
await page.waitForTimeout(600)
await shot('07-ocarina')
for (const key of ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowDown']) {
  await page.keyboard.press(key)
  await page.waitForTimeout(250)
}
await page.waitForTimeout(2500)
await shot('08-horse-summoned')

await loadScene('dungeon', '09-dungeon')

// walk forward into the combat room
await page.keyboard.down('w')
await page.waitForTimeout(1500)
await page.keyboard.up('w')
await page.waitForTimeout(500)
await shot('10-dungeon-combat')

await loadScene('boss', '11-boss')
// advance boss monologue
for (let i = 0; i < 5; i++) {
  await page.keyboard.press('x')
  await page.waitForTimeout(300)
}
await page.waitForTimeout(2000)
await shot('12-boss-fight')

// pause menu + cheat-o-pedia
await page.keyboard.press('Escape')
await page.waitForTimeout(400)
await shot('13-pause')
const cheatTab = page.getByText('CHEAT-O-PEDIA')
if (await cheatTab.count()) {
  await cheatTab.click()
  await page.waitForTimeout(400)
  await shot('14-cheatopedia')
}

await browser.close()
server.kill()

console.log('\n================ RESULT ================')
if (errors.length === 0) {
  console.log('✅ no runtime errors')
} else {
  console.log(`❌ ${errors.length} runtime errors:`)
  const unique = [...new Set(errors)]
  unique.slice(0, 20).forEach((e) => console.log('  -', e.slice(0, 300)))
}
process.exit(errors.length ? 1 : 0)
