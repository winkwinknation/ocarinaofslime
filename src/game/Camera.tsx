// Third-person follow camera: eases behind the player's heading, OoT-ish.
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { player, cam } from './world'
import { useGame } from '../state/store'

const angleDiff = (a: number, b: number) => {
  let d = a - b
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return d
}

export function FollowCamera({ dist = 6.2, height = 3.4 }: { dist?: number; height?: number }) {
  const { camera } = useThree()
  const look = useRef(new THREE.Vector3())
  const initialized = useRef(false)

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const g = useGame.getState()

    // ease camera yaw to trail behind player heading while moving
    if (player.moving) {
      const d = angleDiff(player.heading, cam.yaw)
      cam.yaw += d * Math.min(1, dt * 2.2)
    }

    const talking = g.dialogue !== null
    const useDist = talking ? dist * 0.65 : dist
    const useHeight = talking ? height * 0.7 : height

    const tx = player.pos.x - Math.sin(cam.yaw) * useDist
    const tz = player.pos.z - Math.cos(cam.yaw) * useDist
    const ty = player.pos.y + useHeight

    if (!initialized.current) {
      camera.position.set(tx, ty, tz)
      look.current.set(player.pos.x, player.pos.y + 1.1, player.pos.z)
      initialized.current = true
    } else {
      const k = Math.min(1, dt * 6)
      camera.position.x += (tx - camera.position.x) * k
      camera.position.y += (ty - camera.position.y) * k
      camera.position.z += (tz - camera.position.z) * k
      look.current.lerp(
        new THREE.Vector3(player.pos.x, player.pos.y + 1.1, player.pos.z),
        Math.min(1, dt * 8),
      )
    }
    camera.lookAt(look.current)
  }, 1)

  return null
}
