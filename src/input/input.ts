// Shared mutable input state. Keyboard and touch both write here; Player reads per frame.

export const keyboardMove = { x: 0, y: 0 } // -1..1, y = forward
export const stick = { x: 0, y: 0, active: false }

const pressed = new Set<string>()

export type Action = 'attack' | 'roll' | 'ocarina' | 'pause'

export function press(action: Action) {
  pressed.add(action)
}

/** Edge-triggered read: returns true once per press. */
export function consume(action: Action): boolean {
  return pressed.delete(action)
}

export function clearPresses() {
  pressed.clear()
}

/** Merged movement vector, stick wins when active. Length clamped to 1. */
export function moveVector(): { x: number; y: number } {
  const x = stick.active ? stick.x : keyboardMove.x
  const y = stick.active ? stick.y : keyboardMove.y
  const len = Math.hypot(x, y)
  if (len > 1) return { x: x / len, y: y / len }
  return { x, y }
}
