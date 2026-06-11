// Cheap 2D collision on the XZ plane. No physics engine — circles vs circles/boxes.

export type Collider =
  | { kind: 'circle'; x: number; z: number; r: number }
  | { kind: 'box'; x: number; z: number; hx: number; hz: number }

export const circle = (x: number, z: number, r: number): Collider => ({ kind: 'circle', x, z, r })
export const box = (x: number, z: number, hx: number, hz: number): Collider => ({
  kind: 'box',
  x,
  z,
  hx,
  hz,
})

/** Push a moving circle (pos mutated in place) out of every collider it penetrates. */
export function resolveCollisions(
  pos: { x: number; z: number },
  r: number,
  colliders: readonly Collider[],
) {
  for (const c of colliders) {
    if (c.kind === 'circle') {
      const dx = pos.x - c.x
      const dz = pos.z - c.z
      const min = r + c.r
      const d2 = dx * dx + dz * dz
      if (d2 < min * min && d2 > 1e-9) {
        const d = Math.sqrt(d2)
        const push = min - d
        pos.x += (dx / d) * push
        pos.z += (dz / d) * push
      }
    } else {
      // closest point on box to circle center
      const cx = Math.max(c.x - c.hx, Math.min(pos.x, c.x + c.hx))
      const cz = Math.max(c.z - c.hz, Math.min(pos.z, c.z + c.hz))
      const dx = pos.x - cx
      const dz = pos.z - cz
      const d2 = dx * dx + dz * dz
      if (d2 < r * r) {
        if (d2 > 1e-9) {
          const d = Math.sqrt(d2)
          const push = r - d
          pos.x += (dx / d) * push
          pos.z += (dz / d) * push
        } else {
          // center inside the box: push out along the shallowest axis
          const px = c.hx + r - Math.abs(pos.x - c.x)
          const pz = c.hz + r - Math.abs(pos.z - c.z)
          if (px < pz) pos.x += pos.x >= c.x ? px : -px
          else pos.z += pos.z >= c.z ? pz : -pz
        }
      }
    }
  }
}

/** Four thick box walls enclosing a square play area of half-size `half` centered at (cx, cz). */
export function boundsWalls(half: number, cx = 0, cz = 0): Collider[] {
  const t = 3 // wall thickness
  return [
    box(cx, cz - half - t, half + t * 2, t),
    box(cx, cz + half + t, half + t * 2, t),
    box(cx - half - t, cz, t, half + t * 2),
    box(cx + half + t, cz, t, half + t * 2),
  ]
}

export function dist2(ax: number, az: number, bx: number, bz: number) {
  const dx = ax - bx
  const dz = az - bz
  return dx * dx + dz * dz
}
