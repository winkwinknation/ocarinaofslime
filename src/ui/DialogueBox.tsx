import { useEffect, useRef, useState } from 'react'
import { useGame } from '../state/store'
import { sfx } from '../audio/notes'

export function DialogueBox() {
  const dialogue = useGame((s) => s.dialogue)
  const advance = useGame((s) => s.advance)
  const [chars, setChars] = useState(0)
  const lineRef = useRef<string>('')

  const line = dialogue ? dialogue.lines[dialogue.index] : null
  lineRef.current = line?.text ?? ''
  const done = line !== null && chars >= line.text.length

  // typewriter
  useEffect(() => {
    if (!line) return
    setChars(0)
    let i = 0
    const iv = setInterval(() => {
      i += 1
      setChars(i)
      if (i % 3 === 1) sfx.blip()
      if (i >= lineRef.current.length) clearInterval(iv)
    }, 18)
    return () => clearInterval(iv)
  }, [line])

  // advance on key
  useEffect(() => {
    if (!dialogue) return
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === ' ' || k === 'e' || k === 'enter') {
        e.preventDefault()
        step()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogue, done])

  if (!dialogue || !line) return null

  function step() {
    if (!done) {
      setChars(lineRef.current.length)
    } else {
      advance()
    }
  }

  return (
    <div className="dialogue-box" onPointerDown={step}>
      <div className="dialogue-name">{line.name}</div>
      <div className="dialogue-text">{line.text.slice(0, chars)}</div>
      <div className="dialogue-more">{done ? '▼' : ''}</div>
    </div>
  )
}
