# Ocarina of Slime — shitpost OoT "remake" (React, GitHub Pages)

> **READ THIS FIRST — NOTE FOR THE NEW SESSION (2026-06-11):**
> This plan was created and **approved by the user** in a Claude Code session that was
> accidentally started in the WRONG directory (`c:\Users\loran\Documents\workdir\OldSchoolSlopscape`,
> an unrelated Java MMO project). **No implementation happened there** — no files scaffolded,
> no repo created, nothing pushed. The project lives HERE now: build everything directly in
> **this folder** (`c:\Users\loran\Documents\workdir\OcarinaOfSlime`), which is the repo root
> (do NOT create a nested `ocarinaofslime/` subfolder).
>
> Key facts so you don't re-derive them:
> - **Plan is already approved** — skip plan mode and start implementing at Phase 1 below.
> - GitHub repo to create: **`winkwinknation/ocarinaofslime` — exactly lowercase** (the Pages
>   URL and the Vite `base: '/ocarinaofslime/'` depend on it), even though this local folder
>   is capitalized `OcarinaOfSlime`. Naming it explicitly handles that:
>   `gh repo create winkwinknation/ocarinaofslime --public --source . --push`
> - Toolchain already verified on this machine: **Node v24.15.0, npm 11.12.1, gh CLI 2.92.0
>   authenticated as `winkwinknation`** with `repo` + `workflow` scopes. No setup blockers.
> - Scaffold note: `npm create vite` may fight with a non-empty folder (this PLAN.md is here);
>   either scaffold manually or use a temp dir / `--overwrite` carefully — keep this file.
>   Add `.gitignore` (node_modules, dist) before the first commit.
> - The **cheat-codes section is a hard requirement** — the user's friend Rae always complains
>   his games lack cheat codes, so this is part of the surprise. Don't cut it.
> - Original plan file (superseded by this copy): `C:\Users\loran\.claude\plans\zany-strolling-ritchie.md`.

## Context

The user's friend **Rae** is hyped for the upcoming Ocarina of Time remake. As a surprise joke, we're building **Ocarina of Slime** — a comedic, shitposty, but genuinely playable 3D parody "remake" — so she "doesn't have to wait for the real one." Requirements: built with React, playable on **PC (keyboard) and mobile (touch)**, public repo `winkwinknation/ocarinaofslime`, hosted at **https://winkwinknation.github.io/ocarinaofslime**. User picked: **3D low-poly N64 parody** style, **maximum slop** scope (full vertical slice + horse + fishing + gossip stones + extra songs), personalized with Rae's name.

This is a **brand-new repo**. Local dir: `c:\Users\loran\Documents\workdir\OcarinaOfSlime` (this folder — the repo root).

**Legal/comedy guardrail:** zero Nintendo assets. All geometry procedural, all names parodies, all melodies original silly 5–7 note tunes (no actual Zelda compositions). The bad-on-purpose N64 look IS the joke, but gameplay must feel good.

---

## Creative design

### Cast & names
- **Glink** — the hero: a green slime blob wearing the iconic pointy cap. Squash-and-stretch everything.
- **Gravy** — the fairy companion. Spams "HEY! LISTEN!". A persistent **HEY counter** in the HUD corner tracks how many times she's said it.
- **Princess Raelda** — Rae + Zelda. Referenced in lore, sends you a letter, appears in the ending.
- **The Great Gunk Tree** — sick Deku Tree parody, the dungeon.
- **Queen Goohma** — the boss (giant eyeball slime).
- **Smido** — gatekeeper who blocks the field exit until you have sword + shield.
- **Slurpia** — Saria parody, teaches a song.
- Currency: **Gloopees**. Studio: **Slimetendo®** ("all rights reserved-ish").
- Title screen dedication: *"made for Rae, who couldn't wait for the real one"*.

### Game flow (scenes)
1. **Title screen** — spinning low-poly ocarina, N64-style logo, cheap synth fanfare, "PRESS ANY BUTTON / TAP SCREEN". Continue/New Game (localStorage save).
2. **Intro cutscene** — text + camera pan: the Gunk Tree is dying; Gravy wakes Glink with HEY LISTEN spam (skippable, with a joke about skipping).
3. **Goo-kiri Village** (hub) — 5–6 slime huts, ~6 NPCs with shitpost dialogue, cuttable grass tufts + smashable pots (drop gloopees/hearts), treasure chest with the **Deku Stick of Justice** (sword, full chest-opening ceremony w/ jingle), shop selling the **Mostly Deku Shield** (40 gloopees), ocarina acquisition, song teaching, hidden gossip stones.
4. **Sloshy Plains** (open field) — connects village ↔ dungeon. **Sloshpona** the slime horse (summon via song, ride for 2× speed, squashy gallop), **fishing pond** minigame, roaming slime enemies, more gossip stones.
5. **Great Gunk Tree dungeon** — 3–4 rooms: combat room ("Chuchus, but legally distinct"), puzzle room (sealed gunk door opened by playing Slime's Lullaby), short web-drop room, boss door.
6. **Boss: Queen Goohma** — 3-phase fight: hops/charges → spawns baby slimes → eye opens (stun window) → whack the eye. 3 cycles to win.
7. **Ending + credits** — Gunk Tree saved, receive the **Slime Emerald (resale value: 3 gloopees)**, message from Princess Raelda, scrolling shitpost credits ("Lighting Director: The Sun", "QA: nobody"), "Thanks for playing! Now go wait for the real one like everyone else."

### Ocarina system (the centerpiece)
- 5 notes (OoT-style ◄ ▼ ► ▲ A). **PC:** arrow keys + Space. **Mobile:** 5 big tap buttons in a fullscreen ocarina overlay. Notes render on a staff as you play.
- Song learning: NPC shows the sequence, you echo it, success fanfare + "You learned X! It does something, probably."
- Song detection: rolling buffer of last 8 notes, match against known songs.
- **Songs (5, all original melodies):**
  1. **Slime's Lullaby** — opens sealed gunk doors (dungeon puzzle). Taught via Princess Raelda's letter in the village.
  2. **Sloshpona's Song** — summons the slime horse (Plains only).
  3. **Song of Squelch** — makes it rain slime; fish bite instantly at the pond; gossip stones dance.
  4. **Slurpia's Song** — groovy loop; all nearby NPCs dance; cheering up one sad NPC awards a heart container.
  5. **Song of Slime** — "It does nothing. Time is a construct." (pure shitpost, plays a sad kazoo sting).

### Cheat codes (for Rae, who always complains there aren't any)
Cheats are **secret ocarina songs** — works identically on PC and mobile since the ocarina overlay is the input. Replaying a cheat song toggles it off. Active cheats show as tiny icons in the HUD and persist in the save.

| Cheat song | Effect |
|---|---|
| **Song of Rae** | RAE MODE: god mode, Glink turns golden with a tiny crown, fairy says "HEY! LISTEN! ...your majesty." |
| **Song of Greed** | +999 gloopees, coins rain from the sky for 5 seconds |
| **Song of Violence** | comically gigantic sword (one-shots everything, barely fits on screen) |
| **Song of Zoomies** | 3× run speed + motion-blur-ish stretch |
| **Ballad of the Big Head** | classic N64 big-head mode — every character's head/hat balloons |
| **Moon Gloop** | low gravity, Glink's hops go absurdly high |

Discovery: a **"Cheat-o-pedia"** tab in the pause menu lists each cheat as "???" with a riddle hint until found; a shady NPC ("Sketchy Slime", sells "GameShark-But-Legally-Distinct hints" for gloopees) and certain gossip stones leak the actual note sequences. Song of Rae's hint is free on the title screen: "There's a song named after you. Obviously."

### Side content (max slop extras)
- **Fishing minigame:** cast (aim + power), wait for bobber dip, tap/press to hook, mash/hold to reel with tension bar. Catches: joke fish ("Boot of Legend", "Fish-Shaped Object", "Lawyer-Friendly Magikarp"), record fish awards a heart container.
- **Gossip stones:** ~6 hidden across village/plains/dungeon; whack or interact → 4th-wall shitpost lore ("This remake was made in a cave with a box of scraps."). Finding all 6 = achievement toast.
- **Combat:** sword swing = 120° front arc hit check, knockback, i-frames on player hit, enemies drop gloopees/hearts. Enemies: Gel (hops at you), Big Gel (splits into 2 Gels), Dungeon Gel (faster).
- **Hearts:** start 3, max 5 via heart containers (Slurpia quest + fishing record).

---

## Tech architecture

### Stack
- **Vite + React + TypeScript**
- **@react-three/fiber + @react-three/drei** (3D), **zustand** (state)
- **No physics engine** (flat ground, circle colliders vs circle/AABB — cheap and mobile-fast)
- **Pure WebAudio** for ALL sound (no audio asset files): ocarina note synth (triangle osc + vibrato + envelope), SFX (squish, swing, chest jingle, HEY chirp), and a tiny step-sequencer for per-scene chiptune BGM loops (original melodies)
- All meshes procedural (sphere/cone/box/cylinder, vertex colors, MeshToonMaterial or flat lambert), N64 fog, capped `dpr={[1, 1.5]}`, no shadows on mobile

### Project layout
```
OcarinaOfSlime/            # this folder == repo root (GitHub name: ocarinaofslime)
  vite.config.ts            # base: '/ocarinaofslime/'
  index.html                # viewport-fit, user-scalable=no, touch-action none
  .github/workflows/deploy.yml
  src/
    main.tsx, App.tsx       # Canvas + UI overlay root, scene switch
    state/store.ts          # zustand: scene, hearts, gloopees, items, songs,
                            #   flags, dialogue queue, input state, save/load (localStorage)
    audio/engine.ts         # WebAudio context mgmt + iOS unlock-on-first-touch
    audio/notes.ts          # ocarina synth, SFX, jingles
    audio/bgm.ts            # step sequencer + per-scene song data
    input/useKeyboard.ts    # WASD/arrows + action keys -> store
    input/TouchControls.tsx # virtual joystick (left) + A/B/ocarina buttons (right)
    game/Player.tsx         # movement, squash anim, sword swing, riding state
    game/Camera.tsx         # follow cam, eases behind heading; cinematic during dialogue
    game/Enemy.tsx          # Gel variants, hop AI, hp/knockback
    game/NPC.tsx            # slime NPCs w/ hats, interact trigger
    game/collision.ts       # circle-circle, circle-AABB, per-scene wall lists
    game/Horse.tsx          # Sloshpona summon + riding
    game/Fishing.tsx        # pond minigame state machine
    game/cheats.ts          # cheat flags in store, effect application, Cheat-o-pedia data
    scenes/Title.tsx, Village.tsx, Plains.tsx, Dungeon.tsx, Boss.tsx, Credits.tsx
    ui/HUD.tsx              # hearts, gloopees, HEY-counter, item buttons
    ui/DialogueBox.tsx      # typewriter text, name plate, advance on key/tap
    ui/OcarinaOverlay.tsx   # 5 note buttons + staff display + song match
    ui/ChestCeremony.tsx    # item-get pose + jingle
    content/dialogue.ts     # ALL the shitpost writing, centralized
    content/songs.ts        # note sequences + effects (story songs AND cheat songs)
```

### Controls
| Action | PC | Mobile |
|---|---|---|
| Move | WASD / arrows | left virtual joystick |
| Attack / interact (context) | Space or E | big **A** button |
| Roll / dismount | Shift / Q | **B** button |
| Ocarina out | Z | ocarina button |
| Ocarina notes | arrows + Space | 5 overlay buttons |
| Pause/skip cutscene | Esc | tap skip label |

Movement is camera-relative. Touch detection via `pointer: coarse` + first-touch, controls overlay only shows on touch devices. Portrait mode shows a "rotate your device, hero" joke overlay but remains playable.

---

## Implementation phases (build order)

1. **Scaffold + deploy pipeline FIRST** — Vite react-ts scaffold (manual or `npm create vite`; folder already contains this PLAN.md — keep it), add deps (`three`, `@react-three/fiber`, `@react-three/drei`, `zustand`), set `base: '/ocarinaofslime/'`, minimal placeholder title screen. `git init`, `gh repo create winkwinknation/ocarinaofslime --public --source . --push`. Add `.github/workflows/deploy.yml`: on push to main → npm ci, `npm run build`, `actions/configure-pages@v5` (`enablement: true`), `upload-pages-artifact` (dist), `deploy-pages`. Permissions: `pages: write`, `id-token: write`. Fallback if enablement fails: `gh api -X POST repos/winkwinknation/ocarinaofslime/pages -f build_type=workflow`. **Verify the live URL works before building the game** — proves the riskiest infra early.
2. **Core engine** — input store (keyboard + touch joystick), Player movement + follow camera + collision, HUD shell, audio engine + iOS unlock.
3. **Village** — terrain/huts/trees, NPCs + DialogueBox, grass/pots + gloopee drops, chest ceremony (sword), shield shop, Smido gate logic.
4. **Ocarina** — overlay UI, note synth, song teaching + detection, all 5 songs + effects wiring.
5. **Combat + Plains** — sword arc hits, Gel enemies, Sloshpona horse, fishing minigame, gossip stones.
5b. **Cheats** — 6 cheat songs + effects (god/gold Glink, gloopee rain, giant sword, zoomies, big head, moon gravity), Cheat-o-pedia pause tab with riddle hints, Sketchy Slime hint vendor, HUD cheat icons, save persistence.
6. **Dungeon + boss** — rooms/walls, lullaby door, web-drop, Queen Goohma 3-phase fight.
7. **Cinematics + sound** — intro, ending, credits, BGM loops per scene, save/continue.
8. **Mobile polish pass** — button sizing/ergonomics, perf (instanced grass, fog distance), orientation joke, real-phone sanity via the live URL.
9. **Writing pass** — punch up every dialogue line in `content/dialogue.ts`; the shitpost must be *good*.

Commit + push at each phase boundary (auto-deploys, so Rae-readiness is continuous; the URL is shareable from phase 1).

## Verification
- `npm run build` clean after every phase; `npm run dev` local playtest (smoke-test flows: title→village→sword→ocarina→song→dungeon→boss→credits).
- After each push: `gh run watch` the Actions deploy, then fetch `https://winkwinknation.github.io/ocarinaofslime/` and confirm 200 + correct `<title>`.
- Final acceptance: user playtests on PC (keyboard) and their phone (touch) at the live URL; the full game must be completable on both.
