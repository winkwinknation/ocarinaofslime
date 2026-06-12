# 🫧 Ocarina of Slime

> *made for Rae, who couldn't wait for the real one*

**▶ PLAY IT: https://winkwinknation.github.io/ocarinaofslime/**

A comedic, low-poly, fully playable 3D parody "remake" — a Slimetendo® production
(all rights reserved-ish). Works on PC (keyboard) and phones (touch).

You are **Glink**, a damp hero with a hat. The **Great Gunk Tree** is sick.
There is an ocarina. It is slightly a potato. You know what to do.

## Features

- 🏘 A village of slimes with opinions
- 🎵 A real ocarina system — 5 story songs you learn and play, OoT-style
- 🐴 **Sloshpona**, a horse-shaped slime (allegedly three slimes in a costume)
- 🎣 A fishing minigame with legally distinct catches
- 🗿 6 gossip stones full of 4th-wall lore
- 👁 **Queen Goohma**, a 3-phase boss with one (1) enormous weak point
- 🧚 **Gravy** the fairy, with a live on-screen HEY! LISTEN! counter
- 🕹 **ACTUAL CHEAT CODES** (Rae, this is for you) — six secret ocarina songs.
  Check the **Cheat-o-pedia** in the pause menu. A shady guy sells hints.
  One of the songs is named after you. Obviously.

## Controls

| Action | PC | Mobile |
|---|---|---|
| Move | WASD / arrows | left-side virtual joystick |
| Attack / talk / interact | Space or E | **A** button |
| Roll / dismount | Shift or Q | **B** button |
| Ocarina | Z | 🎵 button |
| Ocarina notes | ◄ ▼ ▲ ► + Space | 5 big buttons |
| Pause / Cheat-o-pedia | Esc | ☰ button |
| Mute music | M | — |

## Tech

Vite + React + TypeScript, @react-three/fiber, zustand. No 3D assets, no audio
files — every mesh is procedural geometry and every sound (including the BGM)
is synthesized WebAudio. No Nintendo assets were used, harmed, or even looked at.

```bash
npm install
npm run dev        # local dev
npm run build      # production build
node scripts/smoke.mjs         # headless playthrough smoke test
node scripts/smoke-mobile.mjs  # mobile/touch smoke test
```

Deployed automatically to GitHub Pages on every push to `main`.

---

*QA: nobody · Lighting Director: The Sun · Localization: declined*
