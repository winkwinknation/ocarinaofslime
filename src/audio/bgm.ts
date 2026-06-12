// Chiptune BGM: a tiny step sequencer over WebAudio. All melodies original.
import { getCtx, getMaster } from './engine'

// note name → frequency helper (equal temperament from A4=440)
const SEMI = (n: number) => 440 * Math.pow(2, n / 12)
// offsets from A4: c4=-9, d4=-7, e4=-5, f4=-4, g4=-2, a4=0, b4=2, c5=3, d5=5, e5=7, f5=8, g5=10, a5=12
const N: Record<string, number> = {
  c3: SEMI(-21), d3: SEMI(-19), e3: SEMI(-17), f3: SEMI(-16), g3: SEMI(-14), a3: SEMI(-12), b3: SEMI(-10),
  c4: SEMI(-9), d4: SEMI(-7), e4: SEMI(-5), f4: SEMI(-4), g4: SEMI(-2), a4: SEMI(0), b4: SEMI(2),
  c5: SEMI(3), d5: SEMI(5), e5: SEMI(7), f5: SEMI(8), g5: SEMI(10), a5: SEMI(12),
}

interface Track {
  bpm: number
  melody: (string | null)[] // 16 steps of 8th notes
  bass: (string | null)[]
  melodyType?: OscillatorType
  vol?: number
}

const TRACKS: Record<string, Track> = {
  title: {
    bpm: 92,
    melodyType: 'triangle',
    vol: 0.06,
    melody: ['d4', null, 'f4', null, 'a4', null, 'c5', null, 'a4', null, 'f4', null, 'e4', null, null, null],
    bass: ['d3', null, null, null, 'a3', null, null, null, 'd3', null, null, null, 'g3', null, 'a3', null],
  },
  village: {
    bpm: 132,
    melodyType: 'square',
    vol: 0.05,
    melody: ['g4', 'a4', 'b4', null, 'd5', null, 'b4', null, 'a4', 'g4', 'a4', null, 'e4', null, 'g4', null],
    bass: ['g3', null, 'd3', null, 'e3', null, 'd3', null, 'c3', null, 'g3', null, 'd3', null, 'd3', null],
  },
  plains: {
    bpm: 140,
    melodyType: 'square',
    vol: 0.05,
    melody: ['d4', null, 'f4', 'g4', 'a4', null, 'a4', null, 'c5', 'a4', 'g4', null, 'f4', 'g4', 'a4', null],
    bass: ['d3', null, 'd3', null, 'f3', null, 'f3', null, 'g3', null, 'g3', null, 'a3', null, 'a3', null],
  },
  dungeon: {
    bpm: 96,
    melodyType: 'triangle',
    vol: 0.055,
    melody: ['e4', null, null, 'f4', 'e4', null, null, null, 'c4', null, null, 'd4', 'c4', null, null, null],
    bass: ['e3', null, 'e3', null, 'c3', null, 'c3', null, 'd3', null, 'd3', null, 'b3', null, 'e3', null],
  },
  boss: {
    bpm: 160,
    melodyType: 'sawtooth',
    vol: 0.05,
    melody: ['e4', 'e4', 'g4', 'e4', 'a4', 'g4', 'e4', null, 'e4', 'e4', 'g4', 'a4', 'b4', 'a4', 'g4', null],
    bass: ['e3', 'e3', 'e3', 'e3', 'f3', 'f3', 'f3', 'f3', 'g3', 'g3', 'g3', 'g3', 'e3', 'e3', 'b3', 'b3'],
  },
  ending: {
    bpm: 84,
    melodyType: 'triangle',
    vol: 0.06,
    melody: ['c4', null, 'e4', null, 'g4', null, 'c5', null, 'b4', null, 'g4', null, 'a4', null, 'g4', null],
    bass: ['c3', null, null, null, 'g3', null, null, null, 'f3', null, null, null, 'g3', null, null, null],
  },
}

let currentTrack: string | null = null
let interval: ReturnType<typeof setInterval> | null = null
let step = 0
let nextStepTime = 0
let muted = false

function scheduleNote(freq: number, time: number, dur: number, type: OscillatorType, vol: number) {
  const ctx = getCtx()
  if (!ctx) return
  const osc = ctx.createOscillator()
  osc.type = type
  osc.frequency.value = freq
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, time)
  g.gain.exponentialRampToValueAtTime(vol, time + 0.015)
  g.gain.setValueAtTime(vol, time + dur * 0.6)
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur)
  osc.connect(g)
  g.connect(getMaster())
  osc.start(time)
  osc.stop(time + dur + 0.05)
}

function tick() {
  const ctx = getCtx()
  if (!ctx || !currentTrack || muted) return
  const track = TRACKS[currentTrack]
  if (!track) return
  const stepDur = 60 / track.bpm / 2 // 8th notes

  if (nextStepTime < ctx.currentTime) nextStepTime = ctx.currentTime + 0.05

  while (nextStepTime < ctx.currentTime + 0.15) {
    const i = step % 16
    const mel = track.melody[i]
    const bass = track.bass[i]
    const vol = track.vol ?? 0.05
    if (mel) scheduleNote(N[mel], nextStepTime, stepDur * 0.95, track.melodyType ?? 'square', vol)
    if (bass) scheduleNote(N[bass], nextStepTime, stepDur * 1.6, 'triangle', vol * 1.15)
    nextStepTime += stepDur
    step += 1
  }
}

/** Switch BGM. Pass a scene id; unknown ids stop the music. */
export function setBGM(sceneId: string) {
  const map: Record<string, string> = {
    title: 'title',
    intro: 'title',
    village: 'village',
    plains: 'plains',
    dungeon: 'dungeon',
    boss: 'boss',
    ending: 'ending',
    credits: 'ending',
  }
  const next = map[sceneId] ?? null
  if (next === currentTrack) return
  currentTrack = next
  step = 0
  nextStepTime = 0
  if (!interval) interval = setInterval(tick, 40)
}

export function toggleMute(): boolean {
  muted = !muted
  return muted
}
