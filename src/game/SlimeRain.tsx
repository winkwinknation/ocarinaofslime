// It rains slime when the Song of Squelch plays. Nobody asked for this weather.
import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { player } from './world'
import * as events from './events'

const DROPS = 60

export function SlimeRain() {
  const [active, setActive] = useState(false)
  const timer = useRef(0)
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const seeds = useRef(
    Array.from({ length: DROPS }, () => ({
      x: Math.random() * 24 - 12,
      z: Math.random() * 24 - 12,
      y: Math.random() * 14,
      speed: 7 + Math.random() * 5,
    })),
  )

  useEffect(
    () =>
      events.on('song', (songId) => {
        if (songId === 'squelch') {
          timer.current = 9
          setActive(true)
        }
      }),
    [],
  )

  const dummy = useRef(new THREE.Object3D())

  useFrame((_, dt) => {
    if (!active) return
    timer.current -= dt
    if (timer.current <= 0) {
      setActive(false)
      return
    }
    const m = mesh.current
    if (!m) return
    seeds.current.forEach((s, i) => {
      s.y -= s.speed * dt
      if (s.y < 0) {
        s.y = 12 + Math.random() * 4
        s.x = Math.random() * 24 - 12
        s.z = Math.random() * 24 - 12
      }
      dummy.current.position.set(player.pos.x + s.x, s.y, player.pos.z + s.z)
      dummy.current.scale.setScalar(1)
      dummy.current.updateMatrix()
      m.setMatrixAt(i, dummy.current.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })

  if (!active) return null
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, DROPS]}>
      <sphereGeometry args={[0.09, 5, 4]} />
      <meshBasicMaterial color="#7ae056" transparent opacity={0.8} />
    </instancedMesh>
  )
}
