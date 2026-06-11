import { useEffect } from 'react'
import { keyboardMove, press } from './input'
import { useGame } from '../state/store'

const held = { up: false, down: false, left: false, right: false }

function updateMove() {
  keyboardMove.x = (held.right ? 1 : 0) - (held.left ? 1 : 0)
  keyboardMove.y = (held.up ? 1 : 0) - (held.down ? 1 : 0)
}

export function useKeyboard() {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return
      const k = e.key.toLowerCase()
      // While the ocarina overlay is open it owns arrows/space (notes); only allow close keys.
      const ocarinaOpen = useGame.getState().ocarinaOpen
      if (ocarinaOpen) {
        if (k === 'z' || k === 'escape') press('ocarina')
        return
      }
      switch (k) {
        case 'w':
        case 'arrowup':
          held.up = true
          break
        case 's':
        case 'arrowdown':
          held.down = true
          break
        case 'a':
        case 'arrowleft':
          held.left = true
          break
        case 'd':
        case 'arrowright':
          held.right = true
          break
        case ' ':
        case 'e':
        case 'enter':
          press('attack')
          e.preventDefault()
          break
        case 'shift':
        case 'q':
          press('roll')
          break
        case 'z':
        case 'x':
          press('ocarina')
          break
        case 'escape':
        case 'p':
          press('pause')
          break
      }
      if (k.startsWith('arrow')) e.preventDefault()
    }
    const up = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          held.up = false
          break
        case 's':
        case 'arrowdown':
          held.down = false
          break
        case 'a':
        case 'arrowleft':
          held.left = false
          break
        case 'd':
        case 'arrowright':
          held.right = false
          break
      }
      updateMove()
    }
    const blur = () => {
      held.up = held.down = held.left = held.right = false
      updateMove()
    }
    const downAndUpdate = (e: KeyboardEvent) => {
      down(e)
      updateMove()
    }
    window.addEventListener('keydown', downAndUpdate)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', downAndUpdate)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [])
}
