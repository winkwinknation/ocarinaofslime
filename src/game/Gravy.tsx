// Gravy the fairy. She has one catchphrase and infinite confidence.
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { player } from './world'
import { useGame } from '../state/store'
import { sfx } from '../audio/notes'
import { dlg } from '../content/dialogue'

export function Gravy() {
  const root = useRef<THREE.Group>(null!)
  const wingL = useRef<THREE.Mesh>(null!)
  const wingR = useRef<THREE.Mesh>(null!)
  const heyTimer = useRef(8 + Math.random() * 10)

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const tx = player.pos.x + Math.sin(t * 0.8) * 1.3
    const tz = player.pos.z + Math.cos(t * 0.8) * 1.3
    const ty = 1.7 + Math.sin(t * 2.6) * 0.22
    root.current.position.lerp(new THREE.Vector3(tx, ty, tz), Math.min(1, dt * 4))

    const flap = Math.sin(t * 22) * 0.6
    wingL.current.rotation.y = 0.5 + flap
    wingR.current.rotation.y = -0.5 - flap

    const g = useGame.getState()
    // Gravy is basically all head, so big-head mode scales all of her
    root.current.scale.setScalar(g.cheats.bighead ? 2 : 1)
    const busy = g.dialogue !== null || g.ocarinaOpen || g.paused || g.ceremony !== null
    if (!busy) {
      heyTimer.current -= dt
      if (heyTimer.current <= 0) {
        heyTimer.current = 16 + Math.random() * 22
        sfx.hey()
        g.hey()
        g.showToast(g.cheats.rae ? '🧚 HEY! LISTEN! ...your majesty.' : dlg.heyListen)
      }
    }
  })

  return (
    <group ref={root}>
      <mesh>
        <sphereGeometry args={[0.13, 10, 8]} />
        <meshBasicMaterial color="#fff6c8" />
      </mesh>
      <pointLight intensity={2.5} distance={4} color="#ffe9a8" />
      <mesh ref={wingL} position={[-0.12, 0.05, 0]}>
        <planeGeometry args={[0.28, 0.4]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={wingR} position={[0.12, 0.05, 0]}>
        <planeGeometry args={[0.28, 0.4]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
