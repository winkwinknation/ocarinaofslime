import { useRef } from 'react'
import { stick, press } from './input'
import { useGame } from '../state/store'
import { toggleFullscreen } from '../ui/fullscreen'

const STICK_RANGE = 55 // px to full deflection

export function TouchControls() {
  const touchMode = useGame((s) => s.touchMode)
  const ocarinaOpen = useGame((s) => s.ocarinaOpen)
  const hasOcarina = useGame((s) => s.items.ocarina)
  const paused = useGame((s) => s.paused)

  const baseRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const anchor = useRef({ x: 0, y: 0, id: -1 })

  if (!touchMode || ocarinaOpen) return null

  const showStick = (x: number, y: number, kx: number, ky: number, visible: boolean) => {
    if (!baseRef.current || !knobRef.current) return
    baseRef.current.style.display = visible ? 'block' : 'none'
    knobRef.current.style.display = visible ? 'block' : 'none'
    baseRef.current.style.left = `${x}px`
    baseRef.current.style.top = `${y}px`
    knobRef.current.style.left = `${kx}px`
    knobRef.current.style.top = `${ky}px`
  }

  const onDown = (e: React.PointerEvent) => {
    if (anchor.current.id !== -1) return
    // clamp the anchor so the base circle never draws offscreen
    const m = 64
    const ax = Math.min(Math.max(e.clientX, m), window.innerWidth - m)
    const ay = Math.min(Math.max(e.clientY, m), window.innerHeight - m)
    anchor.current = { x: ax, y: ay, id: e.pointerId }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    stick.active = true
    stick.x = 0
    stick.y = 0
    showStick(ax, ay, ax, ay, true)
  }
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerId !== anchor.current.id) return
    let dx = (e.clientX - anchor.current.x) / STICK_RANGE
    let dy = (e.clientY - anchor.current.y) / STICK_RANGE
    const len = Math.hypot(dx, dy)
    if (len > 1) {
      dx /= len
      dy /= len
    }
    stick.x = dx
    stick.y = -dy // screen down = backward
    showStick(
      anchor.current.x,
      anchor.current.y,
      anchor.current.x + dx * STICK_RANGE,
      anchor.current.y + dy * STICK_RANGE,
      true,
    )
  }
  const onUp = (e: React.PointerEvent) => {
    if (e.pointerId !== anchor.current.id) return
    anchor.current.id = -1
    stick.active = false
    stick.x = 0
    stick.y = 0
    showStick(0, 0, 0, 0, false)
  }

  return (
    <div className="touch-layer">
      {!paused && (
        <>
          <div
            className="stick-zone"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />
          {/* visuals live in the full-viewport layer (NOT the zone) so the
              client coords used to place them line up 1:1 */}
          <div ref={baseRef} className="stick-base" style={{ display: 'none' }} />
          <div ref={knobRef} className="stick-knob" style={{ display: 'none' }} />
        </>
      )}
      {!paused && (
        <>
          <div className="touch-btn btn-a" onPointerDown={() => press('attack')}>
            A
          </div>
          <div className="touch-btn btn-b" onPointerDown={() => press('roll')}>
            B
          </div>
          {hasOcarina && (
            <div className="touch-btn btn-ocarina" onPointerDown={() => press('ocarina')}>
              🎵
            </div>
          )}
        </>
      )}
      <button className="btn-pause" onPointerDown={() => press('pause')}>
        ☰
      </button>
      <button className="btn-fullscreen" onPointerDown={toggleFullscreen}>
        ⛶
      </button>
    </div>
  )
}
