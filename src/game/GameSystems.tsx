// Global per-frame logic that isn't tied to one entity: pause/ocarina button handling.
// Runs at priority -1 so it consumes presses BEFORE the Player clears them when frozen.
import { useFrame } from '@react-three/fiber'
import { consume } from '../input/input'
import { useGame } from '../state/store'

const GAMEPLAY = new Set(['village', 'plains', 'dungeon', 'boss'])

export function GameSystems() {
  useFrame(() => {
    const g = useGame.getState()
    const inGame = GAMEPLAY.has(g.scene)

    if (consume('pause')) {
      if (inGame) {
        if (g.ocarinaOpen) g.setOcarinaOpen(false)
        else g.setPaused(!g.paused)
      }
    }
    if (consume('ocarina')) {
      if (g.ocarinaOpen) {
        g.setOcarinaOpen(false)
      } else if (inGame && g.items.ocarina && !g.dialogue && !g.paused) {
        g.setOcarinaOpen(true)
      }
    }
  }, -1)
  return null
}
