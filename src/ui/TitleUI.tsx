import { useEffect, useState } from 'react'
import { useGame, hasSave } from '../state/store'
import { sfx } from '../audio/notes'
import { enterFullscreen } from './fullscreen'

export function TitleUI() {
  const [phase, setPhase] = useState<'press' | 'menu'>('press')
  const [sel, setSel] = useState(0)
  const setScene = useGame((s) => s.setScene)
  const newGame = useGame((s) => s.newGame)
  const loadGame = useGame((s) => s.loadGame)
  const saveExists = hasSave()

  const options = saveExists ? ['CONTINUE', 'NEW GAME'] : ['NEW GAME']

  function start(option: string) {
    sfx.menuSelect()
    // on touch devices, go fullscreen so the browser UI stops eating the screen
    // (no-op on iPhone Safari, which has no Fullscreen API)
    if (useGame.getState().touchMode) enterFullscreen()
    if (option === 'CONTINUE') {
      if (!loadGame()) {
        newGame()
        setScene('intro')
      }
    } else {
      newGame()
      setScene('intro')
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'press') {
        setPhase('menu')
        sfx.titleFanfare()
        return
      }
      const k = e.key.toLowerCase()
      if (k === 'arrowup' || k === 'w') {
        setSel((s) => (s + options.length - 1) % options.length)
        sfx.menuMove()
      } else if (k === 'arrowdown' || k === 's') {
        setSel((s) => (s + 1) % options.length)
        sfx.menuMove()
      } else if (k === 'enter' || k === ' ' || k === 'e') {
        start(options[sel])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, sel, options.length])

  return (
    <div
      className="title-ui"
      onPointerDown={() => {
        if (phase === 'press') {
          setPhase('menu')
          sfx.titleFanfare()
        }
      }}
    >
      <div>
        <div className="title-logo">
          OCARINA
          <span className="of">— of —</span>
          SLIME
        </div>
        <div className="title-sub">a Slimetendo® production (all rights reserved-ish)</div>
        <div className="title-dedication" style={{ marginTop: 10 }}>
          made for Rae, who couldn't wait for the real one
        </div>
      </div>

      {phase === 'press' ? (
        <div className="title-press">PRESS ANY BUTTON / TAP SCREEN</div>
      ) : (
        <div className="title-menu">
          {options.map((o, i) => (
            <button
              key={o}
              className={`menu-btn ${i === sel ? 'selected' : ''}`}
              onPointerEnter={() => setSel(i)}
              onClick={() => start(o)}
            >
              {o}
            </button>
          ))}
          <div className="title-hint">
            rumor: there's a secret song named after you. obviously.
          </div>
        </div>
      )}
    </div>
  )
}
