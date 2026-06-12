// The fishing minigame: cast → wait → !!! → MASH → fish acquired (or not).
import { useCallback, useEffect, useRef, useState } from 'react'
import { useGame } from '../state/store'
import { sfx } from '../audio/notes'
import * as events from '../game/events'

type Phase = 'power' | 'waiting' | 'bite' | 'reel' | 'caught' | 'escaped'

interface Fish {
  name: string
  min: number
  max: number
  weight: number // roll weight
  joke: string
}

const FISH: Fish[] = [
  { name: 'Gup', min: 5, max: 14, weight: 30, joke: 'A gup. The minnow of the slime world. It seems happy though.' },
  { name: 'Fish-Shaped Object', min: 18, max: 38, weight: 28, joke: 'Definitely fish-shaped. Definitely an object. Further analysis refused.' },
  { name: 'Lawyer-Friendly Magikarp', min: 25, max: 50, weight: 20, joke: 'It splashes around uselessly, but in a legally distinct way.' },
  { name: 'Boot of Legend', min: 28, max: 28, weight: 12, joke: 'The legendary boot. Size 28. Smells of destiny and feet.' },
  { name: 'The Gunkfish', min: 45, max: 72, weight: 10, joke: 'The pond legend itself! Old Mackerel weeps with joy somewhere.' },
]

function rollFish(power: number): { fish: Fish; size: number } {
  const total = FISH.reduce((s, f) => s + f.weight, 0)
  let r = Math.random() * total
  let fish = FISH[0]
  for (const f of FISH) {
    r -= f.weight
    if (r <= 0) {
      fish = f
      break
    }
  }
  // higher cast power biases size upward
  const t = Math.min(1, Math.random() * 0.6 + power * 0.55)
  const size = Math.round(fish.min + (fish.max - fish.min) * t)
  return { fish, size }
}

export function FishingUI() {
  const active = useGame((s) => s.fishingActive)
  const setFishing = useGame((s) => s.setFishing)

  const [phase, setPhase] = useState<Phase>('power')
  const [power, setPower] = useState(0)
  const [tension, setTension] = useState(35)
  const [result, setResult] = useState<{ fish: Fish; size: number } | null>(null)
  const lockedPower = useRef(0)
  const dir = useRef(1)
  const timers = useRef<number[]>([])
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const reset = useCallback(() => {
    clearTimers()
    setPhase('power')
    setPower(0)
    setTension(35)
    setResult(null)
  }, [])

  useEffect(() => {
    if (active) reset()
    return clearTimers
  }, [active, reset])

  // power meter oscillation
  useEffect(() => {
    if (!active || phase !== 'power') return
    const iv = setInterval(() => {
      setPower((p) => {
        let next = p + dir.current * 4
        if (next >= 100) {
          next = 100
          dir.current = -1
        }
        if (next <= 0) {
          next = 0
          dir.current = 1
        }
        return next
      })
    }, 30)
    return () => clearInterval(iv)
  }, [active, phase])

  // reel: tension decays, fish struggles
  useEffect(() => {
    if (!active || phase !== 'reel') return
    const iv = setInterval(() => {
      setTension((t) => {
        const struggle = Math.random() < 0.25 ? 8 + Math.random() * 7 : 0
        const next = t - 1.6 - struggle
        if (next <= 0) {
          setPhase('escaped')
          sfx.songFail()
          return 0
        }
        if (next >= 100) {
          const r = rollFish(lockedPower.current / 100)
          setResult(r)
          setPhase('caught')
          sfx.splash()
          sfx.songFanfare()
          const g = useGame.getState()
          const wasRecord = r.size > g.recordFish
          g.setRecordFish(r.size)
          if (wasRecord && r.size >= 55 && !g.flags['fish-heart']) {
            g.setFlag('fish-heart')
            timers.current.push(
              window.setTimeout(() => {
                const s = useGame.getState()
                s.addMaxHeart()
                sfx.chestJingle()
                s.showCeremony(
                  'RECORD CATCH! +1 HEART CONTAINER!',
                  `${r.fish.name} — ${r.size}cm. Old Mackerel says you've earned cardiovascular health.`,
                )
              }, 1200),
            )
          }
          return 100
        }
        return next
      })
    }, 60)
    return () => clearInterval(iv)
  }, [active, phase])

  // instant bite when squelch plays
  useEffect(() => {
    if (!active) return
    return events.on('song', (songId) => {
      if (songId === 'squelch' && phaseRef.current === 'waiting') {
        clearTimers()
        bite()
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const bite = () => {
    setPhase('bite')
    sfx.coin()
    sfx.splash()
    timers.current.push(
      window.setTimeout(() => {
        if (phaseRef.current === 'bite') {
          setPhase('waiting')
          scheduleBite()
        }
      }, 900),
    )
  }

  const scheduleBite = () => {
    timers.current.push(window.setTimeout(bite, 2000 + Math.random() * 4500))
  }

  const action = useCallback(() => {
    switch (phaseRef.current) {
      case 'power':
        lockedPower.current = power
        sfx.splash()
        setPhase('waiting')
        scheduleBite()
        break
      case 'waiting':
        // premature yank: nothing
        sfx.blip()
        break
      case 'bite':
        clearTimers()
        sfx.swing()
        setTension(35)
        setPhase('reel')
        break
      case 'reel':
        sfx.blip()
        setTension((t) => Math.min(99.9, t + 7))
        break
      case 'caught':
      case 'escaped':
        reset()
        break
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [power, reset])

  // keyboard
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      // the ocarina overlay may sit on top (to play Squelch mid-wait) — it owns keys then
      if (useGame.getState().ocarinaOpen) return
      const k = e.key.toLowerCase()
      if (k === ' ' || k === 'e' || k === 'enter') {
        e.preventDefault()
        action()
      }
      if (k === 'escape') setFishing(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, action, setFishing])

  if (!active) return null

  const barColor = phase === 'reel' ? (tension > 60 ? '#5aff8a' : tension > 30 ? '#ffd23e' : '#ff5a5a') : '#5aa9ff'

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(8, 18, 35, 0.55)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          background: 'rgba(8, 12, 30, 0.92)',
          border: '3px solid #5aa9ff',
          borderRadius: 14,
          padding: '22px 30px',
          width: 'min(440px, 88vw)',
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 900, color: '#5aa9ff', marginBottom: 10 }}>
          🎣 SLOSHY POND FISHING
        </div>

        {phase === 'power' && (
          <>
            <div style={{ fontSize: 14, marginBottom: 8 }}>Cast power! (stop the bar)</div>
            <div style={{ background: '#222', borderRadius: 8, height: 22, overflow: 'hidden' }}>
              <div style={{ width: `${power}%`, height: '100%', background: barColor, transition: 'none' }} />
            </div>
          </>
        )}

        {phase === 'waiting' && (
          <div style={{ fontSize: 26, letterSpacing: 4, padding: '14px 0' }}>
            🛶 . . . {Math.random() < 0.5 ? '' : ''}
            <div style={{ fontSize: 12, color: '#9b8ec4', marginTop: 8 }}>
              (waiting... a certain song makes fish bite instantly)
            </div>
          </div>
        )}

        {phase === 'bite' && (
          <div style={{ fontSize: 40, fontWeight: 900, color: '#ffd23e', padding: '8px 0', animation: 'blink 0.3s step-end infinite' }}>
            ❗ BITE ❗
          </div>
        )}

        {phase === 'reel' && (
          <>
            <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 8 }}>MASH TO REEL!!</div>
            <div style={{ background: '#222', borderRadius: 8, height: 22, overflow: 'hidden' }}>
              <div style={{ width: `${tension}%`, height: '100%', background: barColor }} />
            </div>
          </>
        )}

        {phase === 'caught' && result && (
          <div>
            <div style={{ fontSize: 34 }}>🐟</div>
            <div style={{ fontSize: 19, fontWeight: 900, color: '#ffd23e' }}>
              {result.fish.name} — {result.size}cm!
            </div>
            <div style={{ fontSize: 13, color: '#cdb6ff', marginTop: 6 }}>{result.fish.joke}</div>
            <div style={{ fontSize: 12, color: '#8aff5a', marginTop: 6 }}>
              record: {Math.max(useGame.getState().recordFish, result.size)}cm
              {result.size >= 55 ? ' — an absolute unit' : ''}
            </div>
          </div>
        )}

        {phase === 'escaped' && (
          <div style={{ padding: '8px 0' }}>
            <div style={{ fontSize: 30 }}>💨</div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>It got away.</div>
            <div style={{ fontSize: 12.5, color: '#9b8ec4', marginTop: 4 }}>
              It's telling its friends about you right now.
            </div>
          </div>
        )}

        <button
          className="menu-btn"
          style={{ marginTop: 16, minWidth: 180, fontSize: 17, padding: '8px 20px' }}
          onPointerDown={(e) => {
            e.preventDefault()
            action()
          }}
        >
          {phase === 'power' && 'CAST!'}
          {phase === 'waiting' && '...'}
          {phase === 'bite' && 'HOOK IT!'}
          {phase === 'reel' && 'REEL!!!'}
          {(phase === 'caught' || phase === 'escaped') && 'fish again'}
        </button>
        <div style={{ marginTop: 10 }}>
          <button
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#9b8ec4',
              borderRadius: 8,
              padding: '5px 14px',
              fontSize: 12,
              cursor: 'pointer',
            }}
            onPointerDown={() => setFishing(false)}
          >
            put the rod down (Esc)
          </button>
        </div>
      </div>
    </div>
  )
}
