// Ocarina note synth + all SFX. Everything generated, zero audio assets.
import { tone, noiseBurst } from './engine'

// The 5 ocarina notes, loosely D-major-pentatonic-ish (original, not OoT pitches).
// Order: index used everywhere = [▼, ◄, ►, ▲, Ⓐ-style note]
export interface NoteDef {
  id: string
  label: string
  freq: number
  color: string
}

export const NOTES: NoteDef[] = [
  { id: 'A', label: 'A', freq: 293.66, color: '#5aa9ff' }, // D4
  { id: 'down', label: '▼', freq: 349.23, color: '#ffd23e' }, // F4
  { id: 'right', label: '►', freq: 440.0, color: '#ff7a5a' }, // A4
  { id: 'left', label: '◄', freq: 523.25, color: '#9be564' }, // C5
  { id: 'up', label: '▲', freq: 587.33, color: '#d77aff' }, // D5
]

/** Play ocarina note by index 0-4. The breathy vibrato triangle IS the ocarina. */
export function playNote(i: number, vol = 0.35) {
  const n = NOTES[i]
  if (!n) return
  tone({
    freq: n.freq,
    type: 'triangle',
    attack: 0.02,
    hold: 0.28,
    release: 0.12,
    vol,
    vibrato: { rate: 5.5, depth: n.freq * 0.012 },
  })
  // faint octave-up whistle layer
  tone({ freq: n.freq * 2, type: 'sine', attack: 0.02, hold: 0.22, release: 0.1, vol: vol * 0.15 })
}

export const sfx = {
  squish() {
    noiseBurst({ duration: 0.08, vol: 0.1, filterFrom: 900, filterTo: 300 })
    tone({ freq: 220, slideTo: 110, type: 'sine', attack: 0.005, hold: 0.05, release: 0.05, vol: 0.12 })
  },
  hop() {
    tone({ freq: 180, slideTo: 320, type: 'sine', attack: 0.005, hold: 0.04, release: 0.05, vol: 0.08 })
  },
  swing() {
    noiseBurst({ duration: 0.16, vol: 0.18, filterFrom: 2500, filterTo: 500, type: 'bandpass' })
  },
  hitEnemy() {
    noiseBurst({ duration: 0.1, vol: 0.22, filterFrom: 600, filterTo: 150 })
    tone({ freq: 140, slideTo: 60, type: 'square', attack: 0.005, hold: 0.06, release: 0.08, vol: 0.15 })
  },
  hurt() {
    tone({ freq: 300, slideTo: 90, type: 'sawtooth', attack: 0.005, hold: 0.12, release: 0.1, vol: 0.2 })
  },
  coin() {
    tone({ freq: 988, type: 'square', attack: 0.005, hold: 0.04, release: 0.04, vol: 0.12 })
    tone({ freq: 1319, type: 'square', start: 0.06, attack: 0.005, hold: 0.1, release: 0.08, vol: 0.12 })
  },
  heart() {
    tone({ freq: 660, type: 'triangle', attack: 0.005, hold: 0.06, release: 0.06, vol: 0.15 })
    tone({ freq: 880, type: 'triangle', start: 0.08, attack: 0.005, hold: 0.12, release: 0.1, vol: 0.15 })
  },
  hey() {
    // fairy chirp: two fast high blips
    tone({ freq: 1760, type: 'square', attack: 0.003, hold: 0.03, release: 0.03, vol: 0.07 })
    tone({ freq: 2217, type: 'square', start: 0.05, attack: 0.003, hold: 0.04, release: 0.04, vol: 0.07 })
  },
  blip() {
    tone({ freq: 740, type: 'square', attack: 0.002, hold: 0.015, release: 0.02, vol: 0.05 })
  },
  menuMove() {
    tone({ freq: 520, type: 'square', attack: 0.002, hold: 0.03, release: 0.03, vol: 0.08 })
  },
  menuSelect() {
    tone({ freq: 660, type: 'square', attack: 0.002, hold: 0.04, release: 0.04, vol: 0.1 })
    tone({ freq: 990, type: 'square', start: 0.07, attack: 0.002, hold: 0.06, release: 0.05, vol: 0.1 })
  },
  thud() {
    tone({ freq: 90, slideTo: 45, type: 'sine', attack: 0.005, hold: 0.1, release: 0.12, vol: 0.3 })
    noiseBurst({ duration: 0.08, vol: 0.1, filterFrom: 300, filterTo: 80, type: 'lowpass' })
  },
  splash() {
    noiseBurst({ duration: 0.35, vol: 0.2, filterFrom: 1800, filterTo: 300 })
  },
  potBreak() {
    noiseBurst({ duration: 0.2, vol: 0.25, filterFrom: 3000, filterTo: 700, type: 'highpass' })
    tone({ freq: 200, slideTo: 80, type: 'square', attack: 0.003, hold: 0.05, release: 0.1, vol: 0.1 })
  },
  /** classic da-da-da-DAAA item-get jingle (original melody) */
  chestJingle() {
    const seq = [392, 440, 494, 659] // G4 A4 B4 E5
    seq.forEach((f, i) => {
      const last = i === seq.length - 1
      tone({
        freq: f,
        type: 'square',
        start: i * 0.17,
        attack: 0.01,
        hold: last ? 0.5 : 0.12,
        release: last ? 0.3 : 0.05,
        vol: 0.16,
      })
      tone({
        freq: f / 2,
        type: 'triangle',
        start: i * 0.17,
        attack: 0.01,
        hold: last ? 0.5 : 0.12,
        release: last ? 0.3 : 0.05,
        vol: 0.1,
      })
    })
  },
  /** song-learned fanfare */
  songFanfare() {
    const seq = [523, 587, 659, 784, 1047]
    seq.forEach((f, i) =>
      tone({
        freq: f,
        type: 'triangle',
        start: i * 0.11,
        attack: 0.01,
        hold: i === seq.length - 1 ? 0.45 : 0.09,
        release: 0.15,
        vol: 0.18,
      }),
    )
  },
  /** title screen fanfare: cheap synth majesty */
  titleFanfare() {
    const chords = [
      [262, 330, 392],
      [294, 370, 440],
      [330, 415, 494],
      [392, 494, 587],
    ]
    chords.forEach((chord, i) =>
      chord.forEach((f) =>
        tone({
          freq: f,
          type: 'sawtooth',
          start: i * 0.22,
          attack: 0.02,
          hold: i === chords.length - 1 ? 0.6 : 0.16,
          release: 0.2,
          vol: 0.06,
        }),
      ),
    )
  },
  /** sad kazoo sting for the Song of Slime */
  sadKazoo() {
    tone({ freq: 392, slideTo: 370, type: 'sawtooth', attack: 0.03, hold: 0.25, release: 0.1, vol: 0.14 })
    tone({ freq: 330, slideTo: 311, type: 'sawtooth', start: 0.35, attack: 0.03, hold: 0.25, release: 0.1, vol: 0.14 })
    tone({ freq: 262, slideTo: 196, type: 'sawtooth', start: 0.7, attack: 0.03, hold: 0.6, release: 0.3, vol: 0.14 })
  },
  songFail() {
    tone({ freq: 200, slideTo: 150, type: 'sawtooth', attack: 0.01, hold: 0.2, release: 0.1, vol: 0.12 })
  },
  cheatOn() {
    const seq = [392, 523, 659, 784]
    seq.forEach((f, i) =>
      tone({ freq: f, type: 'square', start: i * 0.07, attack: 0.005, hold: 0.06, release: 0.05, vol: 0.12 }),
    )
  },
  cheatOff() {
    const seq = [784, 659, 523, 392]
    seq.forEach((f, i) =>
      tone({ freq: f, type: 'square', start: i * 0.07, attack: 0.005, hold: 0.06, release: 0.05, vol: 0.1 }),
    )
  },
  doorRumble() {
    tone({ freq: 60, slideTo: 40, type: 'sawtooth', attack: 0.05, hold: 0.8, release: 0.3, vol: 0.25 })
    noiseBurst({ duration: 1.0, vol: 0.12, filterFrom: 250, filterTo: 60, type: 'lowpass' })
  },
  bossRoar() {
    tone({ freq: 110, slideTo: 55, type: 'sawtooth', attack: 0.02, hold: 0.5, release: 0.3, vol: 0.3 })
    tone({ freq: 165, slideTo: 80, type: 'square', attack: 0.02, hold: 0.4, release: 0.3, vol: 0.15 })
    noiseBurst({ duration: 0.6, vol: 0.15, filterFrom: 800, filterTo: 100 })
  },
}
