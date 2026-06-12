// Gels: Chuchus, but legally distinct. They hop at you with bad intentions.
import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { player, enemies, sceneColliders, knockbackPlayer } from './world'
import { resolveCollisions } from './collision'
import { useGame } from '../state/store'
import { sfx } from '../audio/notes'
import { dropLoot } from './Pickups'

export type GelKind = 'gel' | 'big' | 'dungeon'

export interface GelSpec {
  id: string
  kind: GelKind
  x: number
  z: number
}

const STATS: Record<GelKind, { hp: number; speed: number; dmg: number; scale: number; color: string; aggro: number }> = {
  gel: { hp: 2, speed: 3.4, dmg: 0.5, scale: 1, color: '#46b8d8', aggro: 9 },
  big: { hp: 5, speed: 2.6, dmg: 1, scale: 1.7, color: '#2e7fa8', aggro: 10 },
  dungeon: { hp: 2, speed: 4.6, dmg: 0.5, scale: 1, color: '#9a5ad8', aggro: 12 },
}

function gameFrozen() {
  const g = useGame.getState()
  return g.dialogue !== null || g.ocarinaOpen || g.paused || g.ceremony !== null || g.fishingActive
}

function Gel({
  spec,
  onDeath,
}: {
  spec: GelSpec
  onDeath: (key: string, splitInto?: GelSpec[]) => void
}) {
  const stats = STATS[spec.kind]
  const root = useRef<THREE.Group>(null!)
  const squish = useRef<THREE.Group>(null!)
  const mat = useRef<THREE.MeshToonMaterial>(null!)
  const pos = useRef(new THREE.Vector3(spec.x, 0, spec.z))
  const hp = useRef(stats.hp)
  const hopT = useRef(Math.random() * 1.2) // time until next hop
  const hopAir = useRef(0) // remaining air time
  const hopDir = useRef({ x: 0, z: 0 })
  const kb = useRef({ x: 0, z: 0, t: 0 })
  const flash = useRef(0)
  const dead = useRef(false)

  useEffect(() => {
    const ref = {
      id: spec.id,
      pos: pos.current,
      radius: 0.55 * stats.scale,
      alive: true,
      hit: (dmg: number, fromX: number, fromZ: number) => {
        if (dead.current) return
        hp.current -= dmg
        flash.current = 0.15
        sfx.hitEnemy()
        const dx = pos.current.x - fromX
        const dz = pos.current.z - fromZ
        const d = Math.hypot(dx, dz) || 1
        kb.current = { x: (dx / d) * 10, z: (dz / d) * 10, t: 0.22 }
        if (hp.current <= 0) {
          dead.current = true
          ref.alive = false
          sfx.squish()
          sfx.thud()
          dropLoot(pos.current.x, pos.current.z, 'enemy')
          if (spec.kind === 'big') {
            onDeath(spec.id, [
              { id: `${spec.id}-a`, kind: 'gel', x: pos.current.x + 0.8, z: pos.current.z },
              { id: `${spec.id}-b`, kind: 'gel', x: pos.current.x - 0.8, z: pos.current.z },
            ])
          } else {
            onDeath(spec.id)
          }
        }
      },
    }
    enemies.set(spec.id, ref)
    return () => {
      enemies.delete(spec.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec.id])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    if (dead.current) return
    const frozen = gameFrozen()

    if (flash.current > 0) flash.current -= dt
    mat.current.color.set(flash.current > 0 ? '#ffffff' : stats.color)

    // knockback
    if (kb.current.t > 0) {
      kb.current.t -= dt
      pos.current.x += kb.current.x * dt
      pos.current.z += kb.current.z * dt
      resolveCollisions(pos.current, 0.5 * stats.scale, sceneColliders)
    }

    if (!frozen && kb.current.t <= 0) {
      const dx = player.pos.x - pos.current.x
      const dz = player.pos.z - pos.current.z
      const dist = Math.hypot(dx, dz)
      const aggro = dist < stats.aggro

      if (hopAir.current > 0) {
        // mid-hop: move
        hopAir.current -= dt
        pos.current.x += hopDir.current.x * stats.speed * dt
        pos.current.z += hopDir.current.z * stats.speed * dt
        resolveCollisions(pos.current, 0.5 * stats.scale, sceneColliders)
        if (hopAir.current <= 0) hopT.current = aggro ? 0.25 + Math.random() * 0.2 : 0.8 + Math.random() * 1.5
      } else {
        hopT.current -= dt
        if (hopT.current <= 0) {
          // start a hop
          if (aggro && dist > 0.1) {
            hopDir.current = { x: dx / dist, z: dz / dist }
          } else {
            const a = Math.random() * Math.PI * 2
            hopDir.current = { x: Math.sin(a), z: Math.cos(a) }
          }
          hopAir.current = 0.45
        }
      }

      // contact damage
      if (dist < 0.55 * stats.scale + 0.45 && player.invulnTimer <= 0) {
        const g = useGame.getState()
        g.damage(stats.dmg)
        sfx.hurt()
        player.invulnTimer = 1.1
        knockbackPlayer(pos.current.x, pos.current.z)
      }
    }

    // visuals
    const airFrac = hopAir.current > 0 ? Math.sin((1 - hopAir.current / 0.45) * Math.PI) : 0
    root.current.position.set(pos.current.x, airFrac * 0.7 * stats.scale, pos.current.z)
    if (hopDir.current.x !== 0 || hopDir.current.z !== 0) {
      root.current.rotation.y = Math.atan2(hopDir.current.x, hopDir.current.z)
    }
    const sq = hopAir.current > 0 ? 1.15 : 1 + Math.sin(state.clock.elapsedTime * 3 + spec.x) * 0.06
    squish.current.scale.set(2 - sq, sq, 2 - sq)
  })

  return (
    <group ref={root} position={[spec.x, 0, spec.z]} scale={stats.scale}>
      <group ref={squish}>
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.45, 10, 8]} />
          <meshToonMaterial ref={mat} color={stats.color} transparent opacity={0.92} />
        </mesh>
        {/* angry eyes */}
        <mesh position={[-0.14, 0.5, 0.32]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh position={[0.14, 0.5, 0.32]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh position={[-0.13, 0.51, 0.38]}>
          <sphereGeometry args={[0.04, 5, 5]} />
          <meshBasicMaterial color="#aa1111" />
        </mesh>
        <mesh position={[0.13, 0.51, 0.38]}>
          <sphereGeometry args={[0.04, 5, 5]} />
          <meshBasicMaterial color="#aa1111" />
        </mesh>
        {/* angry brows */}
        <mesh position={[-0.14, 0.62, 0.34]} rotation={[0.2, 0, -0.5]}>
          <boxGeometry args={[0.16, 0.04, 0.04]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.14, 0.62, 0.34]} rotation={[0.2, 0, 0.5]}>
          <boxGeometry args={[0.16, 0.04, 0.04]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </group>
  )
}

export function Enemies({ spawns }: { spawns: GelSpec[] }) {
  const [list, setList] = useState(spawns)

  const kill = (key: string, splitInto?: GelSpec[]) => {
    setList((l) => {
      const out = l.filter((e) => e.id !== key)
      if (splitInto) out.push(...splitInto)
      return out
    })
  }

  return (
    <>
      {list.map((e) => (
        <Gel key={e.id} spec={e} onDeath={kill} />
      ))}
    </>
  )
}
