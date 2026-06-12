// Sloshpona: a horse-shaped slime. Summoned by song. 2× speed, 100% squelch.
import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { player, interactables } from './world'
import { useGame } from '../state/store'
import { tone } from '../audio/engine'
import * as events from './events'

function neigh() {
  // a slime trying its best to sound like a horse
  tone({ freq: 700, slideTo: 500, type: 'sawtooth', attack: 0.02, hold: 0.18, release: 0.1, vol: 0.12 })
  tone({ freq: 880, slideTo: 580, type: 'square', start: 0.05, attack: 0.02, hold: 0.22, release: 0.12, vol: 0.08 })
  tone({ freq: 350, slideTo: 220, type: 'sine', start: 0.2, attack: 0.02, hold: 0.2, release: 0.15, vol: 0.12 })
}

export function Horse() {
  const [state, setState] = useState<'away' | 'arriving' | 'idle'>('away')
  const root = useRef<THREE.Group>(null!)
  const pos = useRef(new THREE.Vector3())
  const gallop = useRef(0)
  const stateRef = useRef(state)
  stateRef.current = state

  // summon via Sloshpona's Song
  useEffect(
    () =>
      events.on('song', (songId) => {
        if (songId !== 'sloshpona') return
        if (stateRef.current !== 'away' || player.riding) return
        const a = Math.random() * Math.PI * 2
        pos.current.set(player.pos.x + Math.sin(a) * 22, 0, player.pos.z + Math.cos(a) * 22)
        setState('arriving')
        useGame.getState().showToast('🐴 A distant squelching approaches at speed...')
      }),
    [],
  )

  // mounting
  useEffect(() => {
    if (state !== 'idle') return
    const key = 'horse'
    interactables.set(key, {
      id: key,
      x: pos.current.x,
      z: pos.current.z,
      radius: 2,
      label: 'Ride Sloshpona',
      enabled: () => !player.riding,
      onInteract: () => {
        player.riding = true
        player.speedMul = 2
        player.pos.set(pos.current.x, 0, pos.current.z)
        neigh()
        useGame.getState().showToast('🐴 Mounted! 2× squelch speed! (B to dismount)')
      },
    })
    return () => {
      interactables.delete(key)
    }
  }, [state])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    if (state === 'away') return

    if (player.riding) {
      // the player drives; the horse is the vehicle
      pos.current.copy(player.pos)
      root.current.position.set(pos.current.x, 0, pos.current.z)
      root.current.rotation.y = player.heading
      gallop.current = player.bounce
    } else if (state === 'arriving') {
      const dx = player.pos.x - pos.current.x
      const dz = player.pos.z - pos.current.z
      const d = Math.hypot(dx, dz)
      if (d < 3) {
        setState('idle')
        neigh()
      } else {
        pos.current.x += (dx / d) * 13 * dt
        pos.current.z += (dz / d) * 13 * dt
        root.current.rotation.y = Math.atan2(dx, dz)
        gallop.current += dt * 14
      }
      root.current.position.set(
        pos.current.x,
        Math.abs(Math.sin(gallop.current)) * 0.25,
        pos.current.z,
      )
    } else {
      // idle: keep interactable position in sync, gentle breathing
      const it = interactables.get('horse')
      if (it) {
        it.x = pos.current.x
        it.z = pos.current.z
      }
      root.current.position.set(pos.current.x, 0, pos.current.z)
      gallop.current += dt * 2
    }

    // gallop squash
    const s = player.riding && player.moving ? 1 + Math.sin(gallop.current) * 0.12 : 1
    root.current.scale.set(1, s, 1)
    root.current.visible = true
  })

  const bighead = useGame((s) => !!s.cheats.bighead)

  if (state === 'away') return null

  return (
    <group ref={root}>
      {/* body: horse-shaped(ish) slime */}
      <mesh position={[0, 0.62, 0]} scale={[0.62, 0.55, 1.05]}>
        <sphereGeometry args={[0.95, 12, 10]} />
        <meshToonMaterial color="#56c8b8" transparent opacity={0.95} />
      </mesh>
      {/* legs */}
      {[
        [-0.3, 0.45],
        [0.3, 0.45],
        [-0.3, -0.45],
        [0.3, -0.45],
      ].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.2, lz]}>
          <cylinderGeometry args={[0.13, 0.17, 0.45, 6]} />
          <meshToonMaterial color="#46b0a0" />
        </mesh>
      ))}
      {/* neck + head */}
      <group scale={bighead ? 1.9 : 1} position={[0, 1.05, 0.55]}>
        <mesh rotation={[0.5, 0, 0]} position={[0, -0.05, -0.1]}>
          <cylinderGeometry args={[0.16, 0.22, 0.55, 7]} />
          <meshToonMaterial color="#56c8b8" />
        </mesh>
        <mesh position={[0, 0.25, 0.18]} scale={[0.75, 0.8, 1.15]}>
          <sphereGeometry args={[0.3, 10, 8]} />
          <meshToonMaterial color="#56c8b8" />
        </mesh>
        {/* ears */}
        <mesh position={[-0.12, 0.52, 0.05]}>
          <coneGeometry args={[0.07, 0.2, 5]} />
          <meshToonMaterial color="#46b0a0" />
        </mesh>
        <mesh position={[0.12, 0.52, 0.05]}>
          <coneGeometry args={[0.07, 0.2, 5]} />
          <meshToonMaterial color="#46b0a0" />
        </mesh>
        {/* eyes */}
        <mesh position={[-0.14, 0.3, 0.42]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.14, 0.3, 0.42]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      </group>
      {/* mane */}
      <mesh position={[0, 1.15, 0.32]} rotation={[0.5, 0, 0]} scale={[0.5, 1, 0.6]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshToonMaterial color="#2a8a7a" />
      </mesh>
      {/* tail */}
      <mesh position={[0, 0.7, -1.0]} rotation={[-1.1, 0, 0]}>
        <coneGeometry args={[0.12, 0.5, 6]} />
        <meshToonMaterial color="#2a8a7a" />
      </mesh>
      {/* tiny saddle */}
      <mesh position={[0, 1.02, -0.1]} scale={[1, 0.3, 1]}>
        <sphereGeometry args={[0.35, 8, 6]} />
        <meshToonMaterial color="#a8402a" />
      </mesh>
    </group>
  )
}
