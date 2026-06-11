// Loot drops: gloopees and hearts that hop out of grass, pots, and enemies.
import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { player } from './world'
import { useGame } from '../state/store'
import { sfx } from '../audio/notes'
import * as events from './events'

type PickupKind = 'gloopee' | 'bigGloopee' | 'heart'

interface Pickup {
  id: number
  kind: PickupKind
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  age: number
}

let list: Pickup[] = []
let nextId = 1

export function spawnPickup(kind: PickupKind, x: number, z: number) {
  const a = Math.random() * Math.PI * 2
  const sp = 1 + Math.random() * 1.5
  list.push({
    id: nextId++,
    kind,
    x,
    y: 0.4,
    z,
    vx: Math.sin(a) * sp,
    vy: 4 + Math.random() * 2,
    vz: Math.cos(a) * sp,
    age: 0,
  })
  events.emit('pickups')
}

/** Loot tables. */
export function dropLoot(x: number, z: number, table: 'grass' | 'pot' | 'enemy' | 'rich') {
  const r = Math.random()
  switch (table) {
    case 'grass':
      if (r < 0.28) spawnPickup('gloopee', x, z)
      else if (r < 0.36) spawnPickup('heart', x, z)
      break
    case 'pot': {
      const n = 2 + Math.floor(Math.random() * 3)
      for (let i = 0; i < n; i++) spawnPickup('gloopee', x, z)
      if (r < 0.25) spawnPickup('heart', x, z)
      break
    }
    case 'enemy': {
      const n = 1 + Math.floor(Math.random() * 3)
      for (let i = 0; i < n; i++) spawnPickup('gloopee', x, z)
      if (r < 0.2) spawnPickup('heart', x, z)
      break
    }
    case 'rich':
      for (let i = 0; i < 2; i++) spawnPickup('bigGloopee', x, z)
      break
  }
}

/** Coin rain for the Song of Greed. */
export function coinRain(cx: number, cz: number) {
  for (let i = 0; i < 24; i++) {
    const a = Math.random() * Math.PI * 2
    const d = Math.random() * 6
    const p: Pickup = {
      id: nextId++,
      kind: Math.random() < 0.3 ? 'bigGloopee' : 'gloopee',
      x: cx + Math.sin(a) * d,
      y: 6 + Math.random() * 5,
      z: cz + Math.cos(a) * d,
      vx: 0,
      vy: 0,
      vz: 0,
      age: 0,
    }
    list.push(p)
  }
  events.emit('pickups')
}

function PickupMesh({ p }: { p: Pickup }) {
  const ref = useRef<THREE.Group>(null!)

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    p.age += dt
    // physics
    p.vy -= 18 * dt
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.z += p.vz * dt
    if (p.y < 0.25) {
      p.y = 0.25
      p.vy = Math.abs(p.vy) > 1.5 ? -p.vy * 0.45 : 0
      p.vx *= 0.8
      p.vz *= 0.8
    }
    // magnet toward player
    const dx = player.pos.x - p.x
    const dz = player.pos.z - p.z
    const d = Math.hypot(dx, dz)
    if (d < 2.4 && p.age > 0.35) {
      p.x += (dx / (d || 1)) * 8 * dt
      p.z += (dz / (d || 1)) * 8 * dt
    }
    // collect
    if (d < 0.75 && p.age > 0.3) {
      const g = useGame.getState()
      if (p.kind === 'heart') {
        g.heal(1)
        sfx.heart()
      } else {
        g.addGloopees(p.kind === 'bigGloopee' ? 5 : 1)
        sfx.coin()
      }
      list = list.filter((q) => q.id !== p.id)
      events.emit('pickups')
      return
    }
    // despawn
    if (p.age > 20) {
      list = list.filter((q) => q.id !== p.id)
      events.emit('pickups')
      return
    }
    ref.current.position.set(p.x, p.y, p.z)
    ref.current.rotation.y = state.clock.elapsedTime * 3
    // expiring blink
    ref.current.visible = p.age < 16 || Math.sin(p.age * 20) > 0
  })

  return (
    <group ref={ref} position={[p.x, p.y, p.z]}>
      {p.kind === 'heart' ? (
        <group>
          <mesh position={[-0.07, 0.04, 0]}>
            <sphereGeometry args={[0.11, 8, 8]} />
            <meshToonMaterial color="#ff3355" />
          </mesh>
          <mesh position={[0.07, 0.04, 0]}>
            <sphereGeometry args={[0.11, 8, 8]} />
            <meshToonMaterial color="#ff3355" />
          </mesh>
          <mesh position={[0, -0.07, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.15, 0.22, 4]} />
            <meshToonMaterial color="#ff3355" />
          </mesh>
        </group>
      ) : (
        <mesh scale={p.kind === 'bigGloopee' ? 1.5 : 1}>
          <sphereGeometry args={[0.15, 8, 6]} />
          <meshToonMaterial
            color={p.kind === 'bigGloopee' ? '#ffd23e' : '#7ae056'}
            emissive={p.kind === 'bigGloopee' ? '#8a6a00' : '#1f5c14'}
            emissiveIntensity={0.6}
          />
        </mesh>
      )}
    </group>
  )
}

export function Pickups() {
  const [, setTick] = useState(0)

  useEffect(() => {
    const off = events.on('pickups', () => setTick((t) => t + 1))
    return () => {
      off()
      list = [] // scene change clears loose loot
    }
  }, [])

  return (
    <>
      {list.map((p) => (
        <PickupMesh key={p.id} p={p} />
      ))}
    </>
  )
}
