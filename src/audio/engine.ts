// WebAudio context management. No audio files anywhere — everything is synthesized.

let ctx: AudioContext | null = null
let master: GainNode | null = null

/** Create/resume the context. Must be called from a user gesture at least once (iOS). */
export function unlock() {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
}

export function getCtx(): AudioContext | null {
  return ctx && ctx.state === 'running' ? ctx : null
}

export function getMaster(): GainNode {
  return master!
}

/** Convenience: simple enveloped oscillator. Returns the gain node for extra routing. */
export function tone(opts: {
  freq: number
  type?: OscillatorType
  start?: number // seconds from now
  attack?: number
  hold?: number
  release?: number
  vol?: number
  slideTo?: number // glide target frequency
  vibrato?: { rate: number; depth: number }
}): void {
  const ac = getCtx()
  if (!ac || !master) return
  const t0 = ac.currentTime + (opts.start ?? 0)
  const a = opts.attack ?? 0.01
  const h = opts.hold ?? 0.1
  const r = opts.release ?? 0.08
  const vol = opts.vol ?? 0.3

  const osc = ac.createOscillator()
  osc.type = opts.type ?? 'triangle'
  osc.frequency.setValueAtTime(opts.freq, t0)
  if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(opts.slideTo, t0 + a + h + r)

  if (opts.vibrato) {
    const lfo = ac.createOscillator()
    lfo.frequency.value = opts.vibrato.rate
    const lfoGain = ac.createGain()
    lfoGain.gain.value = opts.vibrato.depth
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)
    lfo.start(t0)
    lfo.stop(t0 + a + h + r + 0.05)
  }

  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + a)
  g.gain.setValueAtTime(vol, t0 + a + h)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + h + r)
  osc.connect(g)
  g.connect(master)
  osc.start(t0)
  osc.stop(t0 + a + h + r + 0.05)
}

/** Short filtered noise burst (swooshes, squishes, splashes). */
export function noiseBurst(opts: {
  duration?: number
  start?: number
  vol?: number
  filterFrom?: number
  filterTo?: number
  type?: BiquadFilterType
}): void {
  const ac = getCtx()
  if (!ac || !master) return
  const t0 = ac.currentTime + (opts.start ?? 0)
  const dur = opts.duration ?? 0.15
  const vol = opts.vol ?? 0.2

  const len = Math.max(1, Math.floor(ac.sampleRate * dur))
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const src = ac.createBufferSource()
  src.buffer = buf

  const filt = ac.createBiquadFilter()
  filt.type = opts.type ?? 'bandpass'
  filt.frequency.setValueAtTime(opts.filterFrom ?? 800, t0)
  filt.frequency.exponentialRampToValueAtTime(opts.filterTo ?? 200, t0 + dur)
  filt.Q.value = 1.2

  const g = ac.createGain()
  g.gain.setValueAtTime(vol, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)

  src.connect(filt)
  filt.connect(g)
  g.connect(master)
  src.start(t0)
}
