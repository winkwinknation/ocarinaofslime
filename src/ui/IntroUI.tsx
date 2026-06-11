// Intro cutscene: text cards + Gravy's grand entrance. Skippable, with consequences (a joke).
import { useEffect, useState } from 'react'
import { useGame } from '../state/store'
import { sfx } from '../audio/notes'

const CARDS = [
  'Long ago, in the land of Sloshyrule...',
  '...the Great Gunk Tree, guardian of Goo-kiri Village, fell terribly ill.',
  'Probably something he ate. He eats sunlight. Don’t ask.',
  'The village elders consulted the prophecy, which clearly described a hero: brave, noble, and "kind of damp."',
  'And so a fairy was dispatched to wake the dampest slime in the village...',
  'HEY! LISTEN! HEY! LISTEN! HEY! LISTEN! HEY! LISTEN! HEY! LISTEN!',
  'Glink woke up. Mostly because of the fairy. Partly because it was noon.',
]

export function IntroUI() {
  const [card, setCard] = useState(0)
  const setScene = useGame((s) => s.setScene)
  const showToast = useGame((s) => s.showToast)
  const hey = useGame((s) => s.hey)

  function next() {
    if (CARDS[card].startsWith('HEY!')) {
      hey(5)
      sfx.hey()
    } else {
      sfx.blip()
    }
    if (card + 1 < CARDS.length) setCard(card + 1)
    else setScene('village')
  }

  function skip() {
    sfx.menuSelect()
    showToast('You skipped the lore. The lore was 11/10. Your loss.')
    setScene('village')
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip()
      else next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card])

  const isHey = CARDS[card].startsWith('HEY!')

  return (
    <div
      style={{ position: 'absolute', inset: 0, background: 'black', pointerEvents: 'auto' }}
      onPointerDown={next}
    >
      <div className="cinema-text" style={isHey ? { color: '#ffd23e', fontWeight: 900 } : undefined}>
        {CARDS[card]}
      </div>
      <div
        className="skip-label"
        onPointerDown={(e) => {
          e.stopPropagation()
          skip()
        }}
      >
        skip cutscene (coward)
      </div>
    </div>
  )
}
