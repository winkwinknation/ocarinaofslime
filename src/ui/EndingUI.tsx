// Ending cutscene cards: tree saved, emerald acquired, royal mail delivered.
import { useEffect, useState } from 'react'
import { useGame } from '../state/store'
import { sfx } from '../audio/notes'

const CARDS: { text: string; speaker?: string }[] = [
  { text: 'The Great Gunk Tree takes his first deep breath in months. Color returns to his bark. His bark abs return to his bark.' },
  { speaker: 'Great Gunk Tree', text: '"Thank you, damp hero. The parasite is gone. I can finally digest sunlight in peace. Do not ask how. You always ask how."' },
  { speaker: 'Great Gunk Tree', text: '"Take this: the SLIME EMERALD. Ancient. Sacred. Resale value: 3 gloopees. It\'s the thought that counts."' },
  { text: 'A letter flutters down from somewhere royal...' },
  { speaker: 'Princess Raelda', text: '"Hero Glink. You actually did it. Sloshyrule is saved, and I didn\'t even have to leave my mysterious sequel-tease chamber."' },
  { speaker: 'Princess Raelda', text: '"P.S. — Rae. Yes, you. The real one, holding the controller. This entire kingdom was built so you\'d have something to play while you wait. 💚"' },
]

export function EndingUI() {
  const [card, setCard] = useState(0)
  const setScene = useGame((s) => s.setScene)
  const addGloopees = useGame((s) => s.addGloopees)

  useEffect(() => {
    sfx.songFanfare()
  }, [])

  function next() {
    sfx.blip()
    if (card === 2) {
      // emerald get!
      sfx.chestJingle()
      addGloopees(3)
    }
    if (card + 1 < CARDS.length) setCard(card + 1)
    else setScene('credits')
  }

  useEffect(() => {
    const onKey = () => next()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card])

  const c = CARDS[card]

  return (
    <div
      style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}
      onPointerDown={next}
    >
      <div className="cinema-text" style={{ background: 'rgba(10, 5, 0, 0.55)', borderRadius: 12, padding: '14px 20px' }}>
        {c.speaker && (
          <div style={{ color: '#ffd23e', fontWeight: 900, fontSize: 14, marginBottom: 6 }}>
            {c.speaker}
          </div>
        )}
        {c.text}
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 10 }}>
          (tap / any key)
        </div>
      </div>
    </div>
  )
}
