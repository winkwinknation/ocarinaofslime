// The ocarina: 5 notes, a staff, song detection, and the echo-teaching minigame.
// Same UI on PC (arrows + space) and mobile (5 big buttons).
import { useCallback, useEffect, useRef, useState } from 'react'
import { useGame } from '../state/store'
import { NOTES, playNote, sfx } from '../audio/notes'
import { songById, detectSong, noteSymbols } from '../content/songs'
import { applySong } from '../game/songEffects'

// staff vertical position per note index (0 lowest pitch → bottom)
const STAFF_Y = [82, 64, 46, 28, 14]

const KEY_TO_NOTE: Record<string, number> = {
  ' ': 0,
  arrowdown: 1,
  arrowright: 2,
  arrowleft: 3,
  arrowup: 4,
}

export function OcarinaOverlay() {
  const open = useGame((s) => s.ocarinaOpen)
  const teaching = useGame((s) => s.teaching)
  const setOcarinaOpen = useGame((s) => s.setOcarinaOpen)
  const setTeaching = useGame((s) => s.setTeaching)

  const [staffNotes, setStaffNotes] = useState<number[]>([])
  const [phase, setPhase] = useState<'free' | 'demo' | 'echo' | 'success'>('free')
  const [demoIdx, setDemoIdx] = useState(-1)
  const [echoPos, setEchoPos] = useState(0)
  const [banner, setBanner] = useState<string | null>(null)
  const buffer = useRef<number[]>([])
  const locked = useRef(false) // input lock during demo/success
  const timeouts = useRef<number[]>([])

  const song = teaching ? songById(teaching.songId) : null

  const clearTimers = () => {
    timeouts.current.forEach((t) => clearTimeout(t))
    timeouts.current = []
  }

  // start/restart the teaching demo
  const runDemo = useCallback(() => {
    if (!song) return
    clearTimers()
    locked.current = true
    setPhase('demo')
    setStaffNotes([])
    setEchoPos(0)
    song.notes.forEach((n, i) => {
      timeouts.current.push(
        window.setTimeout(() => {
          playNote(n, 0.25)
          setDemoIdx(i)
          setStaffNotes(song.notes.slice(0, i + 1))
        }, 600 + i * 450),
      )
    })
    timeouts.current.push(
      window.setTimeout(() => {
        setDemoIdx(-1)
        setStaffNotes([])
        setPhase('echo')
        locked.current = false
      }, 600 + song.notes.length * 450 + 500),
    )
  }, [song])

  useEffect(() => {
    if (open && teaching) runDemo()
    if (!open) {
      clearTimers()
      setPhase('free')
      setBanner(null)
      setStaffNotes([])
      buffer.current = []
      locked.current = false
    }
    return clearTimers
  }, [open, teaching, runDemo])

  const close = useCallback(() => {
    setTeaching(null)
    setOcarinaOpen(false)
  }, [setTeaching, setOcarinaOpen])

  const handleNote = useCallback(
    (i: number) => {
      if (locked.current) return
      playNote(i)

      if (song && phase === 'echo') {
        if (i === song.notes[echoPos]) {
          setStaffNotes(song.notes.slice(0, echoPos + 1))
          if (echoPos + 1 >= song.notes.length) {
            // learned it!
            locked.current = true
            setPhase('success')
            const g = useGame.getState()
            timeouts.current.push(
              window.setTimeout(() => {
                sfx.songFanfare()
                g.learnSong(song.id)
                g.showToast(`🎶 You learned ${song.name}! ${song.blurb}`)
                g.saveGame()
                timeouts.current.push(window.setTimeout(close, 1600))
              }, 400),
            )
          } else {
            setEchoPos(echoPos + 1)
          }
        } else {
          sfx.songFail()
          setEchoPos(0)
          setStaffNotes([])
        }
        return
      }

      // free play
      buffer.current = [...buffer.current, i].slice(-8)
      setStaffNotes(buffer.current)
      const match = detectSong(buffer.current)
      if (match) {
        const result = applySong(match)
        if (result) {
          buffer.current = []
          locked.current = true
          setBanner(`♪ ${result} ♪`)
          timeouts.current.push(
            window.setTimeout(() => {
              setBanner(null)
              locked.current = false
              setStaffNotes([])
              // action songs close the ocarina so you can see the effect
              if (match.kind === 'story' && match.id !== 'slime') close()
            }, 1100),
          )
        }
      }
    },
    [song, phase, echoPos, close],
  )

  // keyboard notes
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k in KEY_TO_NOTE) {
        e.preventDefault()
        handleNote(KEY_TO_NOTE[k])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, handleNote])

  if (!open) return null

  const teacherNames: Record<string, string> = {
    slurpia: 'Slurpia',
    lullaby: "Raelda's letter",
    slime: 'The Philosopher',
    squelch: 'Old Mackerel',
    sloshpona: 'the horse-shaped sign',
  }

  return (
    <div className="ocarina-overlay">
      <button className="ocarina-close" onPointerDown={close}>
        ✕ put away (Z)
      </button>

      {song && (
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#ffd23e' }}>
            ♪ {teacherNames[song.id] ?? 'Someone'} is teaching: {song.name} ♪
          </div>
          <div style={{ fontSize: 22, letterSpacing: 6, marginTop: 6, color: '#b8ff8a' }}>
            {song.notes.map((n, i) => (
              <span
                key={i}
                style={{
                  opacity:
                    phase === 'demo' ? (i <= demoIdx ? 1 : 0.25) : i < echoPos ? 1 : 0.35,
                  color: phase === 'demo' && i === demoIdx ? '#ffd23e' : undefined,
                }}
              >
                {noteSymbols([n])}{' '}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 13, color: '#cdb6ff', marginTop: 4 }}>
            {phase === 'demo' && 'watch closely...'}
            {phase === 'echo' && 'YOUR TURN! repeat the melody!'}
            {phase === 'success' && '🎉 NAILED IT!'}
          </div>
        </div>
      )}

      {banner && (
        <div
          style={{
            fontSize: 26,
            fontWeight: 900,
            color: '#ffd23e',
            textShadow: '2px 2px 0 rgba(0,0,0,0.7)',
            marginBottom: 12,
            animation: 'toast-pop 0.3s ease-out',
          }}
        >
          {banner}
        </div>
      )}

      <div className="ocarina-staff">
        {[14, 28, 46, 64, 82].map((y) => (
          <div key={y} className="staff-line" style={{ top: `${y}%` }} />
        ))}
        {staffNotes.map((n, i) => (
          <div
            key={i}
            className="staff-note"
            style={{
              left: `${8 + i * 12}%`,
              top: `${STAFF_Y[n]}%`,
              background: NOTES[n].color,
            }}
          >
            {NOTES[n].label}
          </div>
        ))}
      </div>

      <div className="ocarina-buttons">
        {[3, 1, 0, 2, 4].map((i) => (
          <button
            key={i}
            className="note-btn"
            style={{ background: NOTES[i].color }}
            onPointerDown={(e) => {
              e.preventDefault()
              handleNote(i)
            }}
          >
            {NOTES[i].label}
          </button>
        ))}
      </div>
      <div className="ocarina-label">
        PC: ◄ ▼ ▲ ► arrows + SPACE (Ⓐ) · mobile: tap the buttons · songs you know just… work
      </div>
    </div>
  )
}
