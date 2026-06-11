// Slime NPCs: a colored blob, eyes, an optional hat, and opinions.
import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { player, interactables } from './world'
import { dist2 } from './collision'
import { useGame } from '../state/store'
import type { DialogueLine } from '../state/store'

export type HatKind = 'flower' | 'visor' | 'beard' | 'cloud' | 'cone' | 'crown' | 'hood' | 'none'

export interface NPCProps {
  id: string
  x: number
  z: number
  color: string
  name: string
  hat?: HatKind
  scale?: number
  heading?: number
  label?: string
  /** called on interact; return dialogue to say */
  getDialogue: () => { lines: DialogueLine[]; onDone?: () => void }
}

function Hat({ kind }: { kind: HatKind }) {
  switch (kind) {
    case 'flower':
      return (
        <group position={[0, 0.95, 0]}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 0.25, 5]} />
            <meshToonMaterial color="#3c9342" />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh
              key={i}
              position={[
                Math.sin((i / 5) * Math.PI * 2) * 0.12,
                0.16,
                Math.cos((i / 5) * Math.PI * 2) * 0.12,
              ]}
            >
              <sphereGeometry args={[0.08, 6, 6]} />
              <meshToonMaterial color="#ff9ad5" />
            </mesh>
          ))}
          <mesh position={[0, 0.16, 0]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshToonMaterial color="#ffd23e" />
          </mesh>
        </group>
      )
    case 'visor':
      return (
        <mesh position={[0, 0.62, 0.3]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.55, 0.06, 0.35]} />
          <meshToonMaterial color="#2e7fd9" />
        </mesh>
      )
    case 'beard':
      return (
        <mesh position={[0, 0.18, 0.42]} rotation={[0.5, 0, 0]}>
          <coneGeometry args={[0.18, 0.5, 6]} />
          <meshToonMaterial color="#d8d8d8" />
        </mesh>
      )
    case 'cloud':
      return (
        <group position={[0, 1.45, 0]}>
          {[
            [0, 0, 0, 0.18],
            [0.18, 0.04, 0, 0.13],
            [-0.18, 0.02, 0, 0.14],
          ].map(([x, y, z, r], i) => (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[r, 7, 6]} />
              <meshToonMaterial color="#8a93a8" />
            </mesh>
          ))}
        </group>
      )
    case 'cone':
      return (
        <mesh position={[0, 0.95, -0.05]} rotation={[-0.3, 0, 0]}>
          <coneGeometry args={[0.3, 0.6, 8]} />
          <meshToonMaterial color="#c0392b" />
        </mesh>
      )
    case 'crown':
      return (
        <mesh position={[0, 0.92, 0]}>
          <cylinderGeometry args={[0.2, 0.16, 0.18, 6]} />
          <meshToonMaterial color="#ffdf00" />
        </mesh>
      )
    case 'hood':
      return (
        <mesh position={[0, 0.68, -0.08]} rotation={[-0.25, 0, 0]}>
          <coneGeometry args={[0.45, 0.7, 8]} />
          <meshToonMaterial color="#3b3b4f" />
        </mesh>
      )
    default:
      return null
  }
}

export function NPC({
  id,
  x,
  z,
  color,
  name,
  hat = 'none',
  scale = 1,
  heading = Math.PI,
  label = 'Talk',
  getDialogue,
}: NPCProps) {
  const root = useRef<THREE.Group>(null!)
  const squish = useRef<THREE.Group>(null!)
  const dlgRef = useRef(getDialogue)
  dlgRef.current = getDialogue

  useEffect(() => {
    interactables.set(id, {
      id,
      x,
      z,
      radius: 2.2 * scale,
      label: `${label} to ${name}`,
      onInteract: () => {
        const d = dlgRef.current()
        useGame.getState().say(d.lines, d.onDone)
      },
    })
    return () => {
      interactables.delete(id)
    }
  }, [id, x, z, name, label, scale])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    // idle wobble (each NPC offset by position so they don't sync-wobble)
    const ph = x * 3.1 + z * 1.7
    const s = 1 + Math.sin(t * 2.1 + ph) * 0.045
    squish.current.scale.set(2 - s, s, 2 - s)

    // face the player when close
    if (dist2(player.pos.x, player.pos.z, x, z) < 22) {
      const target = Math.atan2(player.pos.x - x, player.pos.z - z)
      let d = target - root.current.rotation.y
      while (d > Math.PI) d -= Math.PI * 2
      while (d < -Math.PI) d += Math.PI * 2
      root.current.rotation.y += d * 0.08
    }
  })

  return (
    <group ref={root} position={[x, 0, z]} rotation={[0, heading, 0]} scale={scale}>
      <group ref={squish}>
        <mesh position={[0, 0.42, 0]}>
          <sphereGeometry args={[0.5, 12, 10]} />
          <meshToonMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.4, 10, 8]} />
          <meshToonMaterial color={color} transparent opacity={0.85} />
        </mesh>
        {/* eyes */}
        <mesh position={[-0.16, 0.55, 0.36]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh position={[0.16, 0.55, 0.36]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh position={[-0.16, 0.56, 0.43]}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.16, 0.56, 0.43]}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <Hat kind={hat} />
      </group>
    </group>
  )
}
