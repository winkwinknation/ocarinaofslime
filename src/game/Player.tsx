// Glink: a green slime in a pointy cap. Squash-and-stretch everything.
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { player, cam, interactables, enemies, breakables, sceneColliders } from './world'
import { resolveCollisions, dist2 } from './collision'
import { moveVector, consume, clearPresses } from '../input/input'
import { useGame } from '../state/store'
import { sfx } from '../audio/notes'

const WALK_SPEED = 5.4
const PLAYER_RADIUS = 0.45
const ATTACK_TIME = 0.32
const ROLL_TIME = 0.32

const angleDiff = (a: number, b: number) => {
  let d = a - b
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return d
}

export function Player() {
  const root = useRef<THREE.Group>(null!)
  const squash = useRef<THREE.Group>(null!)
  const swordPivot = useRef<THREE.Group>(null!)
  const bodyMat = useRef<THREE.MeshToonMaterial>(null!)
  const capMat = useRef<THREE.MeshToonMaterial>(null!)
  const headGroup = useRef<THREE.Group>(null!)
  const crown = useRef<THREE.Group>(null!)
  const lastStep = useRef(0)

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const g = useGame.getState()
    const frozen =
      g.dialogue !== null ||
      g.ocarinaOpen ||
      g.paused ||
      g.ceremony !== null ||
      g.fishingActive ||
      g.scene === 'title' ||
      player.frozen

    // timers always tick
    if (player.attackTimer > 0) player.attackTimer -= dt
    if (player.rollTimer > 0) player.rollTimer -= dt
    if (player.invulnTimer > 0) player.invulnTimer -= dt
    if (player.kbTimer > 0) {
      player.kbTimer -= dt
      player.pos.x += player.kbX * dt
      player.pos.z += player.kbZ * dt
      resolveCollisions(player.pos, PLAYER_RADIUS, sceneColliders)
    }

    if (frozen) {
      clearPresses()
      player.moving = false
    } else {
      // movement, camera-relative
      const mv = moveVector()
      const len = Math.hypot(mv.x, mv.y)
      player.moving = len > 0.05

      const zoom = g.cheats.zoomies ? 3 : 1
      const speed = WALK_SPEED * player.speedMul * zoom * (player.rollTimer > 0 ? 1.8 : 1)

      if (player.moving) {
        // -mv.x: with the camera looking down +z, screen-right is world -x
        // (right-handed coords), so input x must be mirrored to feel correct
        const target = Math.atan2(-mv.x, mv.y) + cam.yaw
        // ease heading toward target (snappy but smooth)
        const d = angleDiff(target, player.heading)
        player.heading += d * Math.min(1, dt * 14)
        player.pos.x += Math.sin(player.heading) * speed * len * dt
        player.pos.z += Math.cos(player.heading) * speed * len * dt
        player.bounce += dt * speed * 2.4
        // squishy footstep
        if (player.bounce - lastStep.current > Math.PI) {
          lastStep.current = player.bounce
          sfx.squish()
        }
      } else if (player.rollTimer > 0) {
        player.pos.x += Math.sin(player.heading) * speed * dt
        player.pos.z += Math.cos(player.heading) * speed * dt
      } else {
        player.bounce = 0
        lastStep.current = 0
      }

      resolveCollisions(player.pos, PLAYER_RADIUS, sceneColliders)

      // interact prompt: nearest enabled interactable in range
      let nearest: (typeof interactables extends Map<string, infer T> ? T : never) | null = null
      let nearestD = Infinity
      for (const it of interactables.values()) {
        if (it.enabled && !it.enabled()) continue
        const d2 = dist2(player.pos.x, player.pos.z, it.x, it.z)
        if (d2 < it.radius * it.radius && d2 < nearestD) {
          nearestD = d2
          nearest = it
        }
      }
      g.setPrompt(nearest ? nearest.label : null)

      // A button: interact beats attack
      if (consume('attack')) {
        if (nearest) {
          nearest.onInteract()
        } else if (g.items.sword && player.attackTimer <= 0 && !player.riding) {
          player.attackTimer = ATTACK_TIME
          sfx.swing()
          // hit check slightly into the swing
          const range = g.cheats.violence ? 4.5 : 2.1
          const dmg = g.cheats.violence ? 99 : 1
          for (const e of enemies.values()) {
            if (!e.alive) continue
            const d2v = dist2(player.pos.x, player.pos.z, e.pos.x, e.pos.z)
            if (d2v > range * range) continue
            const ang = Math.atan2(e.pos.x - player.pos.x, e.pos.z - player.pos.z)
            if (Math.abs(angleDiff(ang, player.heading)) < 1.25) {
              e.hit(dmg, player.pos.x, player.pos.z)
            }
          }
          for (const b of breakables.values()) {
            if (b.broken) continue
            const d2v = dist2(player.pos.x, player.pos.z, b.x, b.z)
            if (d2v > range * range) continue
            const ang = Math.atan2(b.x - player.pos.x, b.z - player.pos.z)
            if (Math.abs(angleDiff(ang, player.heading)) < 1.35) b.smash()
          }
        }
      }

      if (consume('roll')) {
        if (player.riding) {
          // dismount
          player.riding = false
          player.speedMul = 1
          sfx.squish()
        } else if (player.rollTimer <= 0) {
          player.rollTimer = ROLL_TIME
          sfx.hop()
        }
      }
    }

    // ----- visuals -----
    let hop = player.moving ? Math.abs(Math.sin(player.bounce)) * 0.22 : 0
    if (player.riding) hop = 0.95 + (player.moving ? Math.abs(Math.sin(player.bounce)) * 0.18 : 0)
    root.current.position.set(player.pos.x, hop, player.pos.z)
    root.current.rotation.y = player.heading

    // squash & stretch
    let sy = 1
    let sxz = 1
    if (player.moving) {
      const s = Math.sin(player.bounce)
      sy = 1 + s * 0.18
      sxz = 1 - s * 0.1
    } else {
      // idle breathing wobble
      const t = performance.now() / 1000
      sy = 1 + Math.sin(t * 2.2) * 0.04
      sxz = 1 - Math.sin(t * 2.2) * 0.025
    }
    if (player.rollTimer > 0) {
      sy = 0.55
      sxz = 1.3
    }
    // zoomies: motion-blur-ish speed squish
    if (g.cheats.zoomies && player.moving) {
      sy *= 0.82
      sxz *= 1.18
    }
    squash.current.scale.set(sxz, sy, sxz)

    // sword swing: pivot sweeps -80° → +80°
    if (swordPivot.current) {
      if (player.attackTimer > 0) {
        const t = 1 - player.attackTimer / ATTACK_TIME
        swordPivot.current.rotation.y = THREE.MathUtils.lerp(1.4, -1.4, t)
        swordPivot.current.rotation.x = -0.5
      } else {
        swordPivot.current.rotation.y = 0.5
        swordPivot.current.rotation.x = 0.6
      }
    }

    // i-frame blink
    root.current.visible = player.invulnTimer <= 0 || Math.sin(performance.now() / 30) > -0.3

    // cheats: rae mode gold, big head
    const gold = !!g.cheats.rae
    bodyMat.current.color.set(gold ? '#ffd84d' : '#5fcc45')
    capMat.current.color.set(gold ? '#e6b422' : '#2c8a2c')
    if (crown.current) crown.current.visible = gold
    const headScale = g.cheats.bighead ? 2.1 : 1
    headGroup.current.scale.setScalar(headScale)

    // moon gravity: extra floaty hop
    if (g.cheats.moon && player.moving && !player.riding) {
      root.current.position.y = Math.abs(Math.sin(player.bounce * 0.5)) * 1.4
    }
  })

  const hasSword = useGame((s) => s.items.sword)
  const hasShield = useGame((s) => s.items.shield)
  const violence = useGame((s) => s.cheats.violence)

  return (
    <group ref={root}>
      <group ref={squash}>
        {/* slime body */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <sphereGeometry args={[0.52, 14, 12]} />
          <meshToonMaterial ref={bodyMat} color="#5fcc45" />
        </mesh>
        {/* gooey base blob */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.42, 12, 8]} />
          <meshToonMaterial color="#4bb336" transparent opacity={0.9} />
        </mesh>

        {/* head things scale together for big-head mode */}
        <group ref={headGroup} position={[0, 0.7, 0]}>
          {/* eyes */}
          <mesh position={[-0.17, 0, 0.36]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="white" />
          </mesh>
          <mesh position={[0.17, 0, 0.36]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="white" />
          </mesh>
          <mesh position={[-0.17, 0.01, 0.44]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshBasicMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0.17, 0.01, 0.44]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshBasicMaterial color="#1a1a1a" />
          </mesh>
          {/* the iconic pointy cap */}
          <mesh position={[0, 0.32, -0.05]} rotation={[-0.35, 0, 0]}>
            <coneGeometry args={[0.34, 0.75, 10]} />
            <meshToonMaterial ref={capMat} color="#2c8a2c" />
          </mesh>
          <mesh position={[0, 0.62, -0.32]}>
            <sphereGeometry args={[0.09, 6, 6]} />
            <meshToonMaterial color="#236e23" />
          </mesh>
          {/* tiny crown (RAE MODE) */}
          <group ref={crown} visible={false} position={[0, 0.18, 0.18]} rotation={[0.3, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.14, 0.14, 0.1, 8]} />
              <meshToonMaterial color="#ffdf00" />
            </mesh>
            {[0, 1, 2, 3].map((i) => (
              <mesh
                key={i}
                position={[Math.sin((i / 4) * Math.PI * 2) * 0.12, 0.1, Math.cos((i / 4) * Math.PI * 2) * 0.12]}
              >
                <coneGeometry args={[0.035, 0.1, 4]} />
                <meshToonMaterial color="#ffdf00" />
              </mesh>
            ))}
          </group>
        </group>

        {/* Deku Stick of Justice (it's a stick) */}
        {hasSword && (
          <group ref={swordPivot} position={[0.0, 0.45, 0]}>
            <group position={[0.45, 0, 0]} scale={violence ? 3.2 : 1}>
              <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.045, 0.06, 1.0, 6]} />
                <meshToonMaterial color="#8a5a2b" />
              </mesh>
              <mesh position={[0, 0.06, 0.95]}>
                <sphereGeometry args={[0.1, 6, 5]} />
                <meshToonMaterial color="#3f9b2f" />
              </mesh>
            </group>
          </group>
        )}

        {/* Mostly Deku Shield (on the back) */}
        {hasShield && (
          <mesh position={[0, 0.5, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.06, 12]} />
            <meshToonMaterial color="#a06a32" />
          </mesh>
        )}
      </group>
    </group>
  )
}
