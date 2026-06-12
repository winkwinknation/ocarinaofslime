// Queen Goohma: parasite monarch, eyeball supreme. Three eye-whacks to win.
import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  setColliders,
  clearSceneState,
  spawnPlayer,
  player,
  enemies,
  knockbackPlayer,
} from '../game/world'
import { boundsWalls } from '../game/collision'
import { Player } from '../game/Player'
import { FollowCamera } from '../game/Camera'
import { Gravy } from '../game/Gravy'
import { Pickups, dropLoot } from '../game/Pickups'
import { Enemies } from '../game/Enemy'
import { useGame } from '../state/store'
import { dlg } from '../content/dialogue'
import { sfx } from '../audio/notes'
import * as events from '../game/events'

type BossPhase = 'intro' | 'hopping' | 'spawning' | 'stunned' | 'hurt' | 'dying' | 'dead'

function gameFrozen() {
  const g = useGame.getState()
  return g.dialogue !== null || g.ocarinaOpen || g.paused || g.ceremony !== null
}

function QueenGoohma() {
  const root = useRef<THREE.Group>(null!)
  const squish = useRef<THREE.Group>(null!)
  const eye = useRef<THREE.Group>(null!)
  const iris = useRef<THREE.MeshToonMaterial>(null!)
  const lidTop = useRef<THREE.Mesh>(null!)

  const pos = useRef(new THREE.Vector3(0, 0, 8))
  const phase = useRef<BossPhase>('intro')
  const hits = useRef(0) // 3 = dead
  const timer = useRef(0)
  const chargesLeft = useRef(0)
  const chargeDir = useRef({ x: 0, z: 0 })
  const charging = useRef(false)
  const flash = useRef(0)
  const bounce = useRef(0)

  // the eye is hittable only while stunned
  useEffect(() => {
    const ref = {
      id: 'goohma-eye',
      pos: pos.current,
      radius: 2.4,
      alive: true,
      hit: () => {
        if (phase.current !== 'stunned') {
          sfx.blip()
          return
        }
        hits.current += 1
        flash.current = 0.4
        sfx.bossRoar()
        sfx.hitEnemy()
        const g = useGame.getState()
        if (hits.current >= 3) {
          phase.current = 'dying'
          timer.current = 3
          ref.alive = false
          g.say(dlg.bossDefeat, () => {
            useGame.getState().setFlag('boss-defeated')
            useGame.getState().setScene('ending')
          })
          // celebratory loot fountain
          for (let i = 0; i < 4; i++) dropLoot(pos.current.x, pos.current.z, 'enemy')
        } else {
          phase.current = 'hurt'
          timer.current = 1.6
          g.showToast(hits.current === 1 ? dlg.bossPhase2 : dlg.bossPhase3)
        }
      },
    }
    enemies.set('goohma-eye', ref)
    return () => {
      enemies.delete('goohma-eye')
    }
  }, [])

  // intro monologue once the scene settles
  useEffect(() => {
    const t = setTimeout(() => {
      useGame.getState().say(dlg.bossIntro, () => {
        phase.current = 'hopping'
        chargesLeft.current = 3
        timer.current = 1
        sfx.bossRoar()
      })
    }, 800)
    return () => clearTimeout(t)
  }, [])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const t = state.clock.elapsedTime
    if (flash.current > 0) flash.current -= dt
    const speedScale = 1 + hits.current * 0.35 // gets angrier

    if (!gameFrozen() && phase.current !== 'intro' && phase.current !== 'dead') {
      timer.current -= dt

      switch (phase.current) {
        case 'hopping': {
          if (charging.current) {
            bounce.current += dt * 14
            pos.current.x += chargeDir.current.x * 9 * speedScale * dt
            pos.current.z += chargeDir.current.z * 9 * speedScale * dt
            // arena bounds
            pos.current.x = Math.max(-13, Math.min(13, pos.current.x))
            pos.current.z = Math.max(-13, Math.min(13, pos.current.z))
            if (timer.current <= 0) {
              charging.current = false
              timer.current = 0.9 / speedScale
              sfx.thud()
              chargesLeft.current -= 1
              if (chargesLeft.current <= 0) {
                phase.current = 'spawning'
                timer.current = 1.2
              }
            }
          } else if (timer.current <= 0) {
            // wind up a charge at the player
            const dx = player.pos.x - pos.current.x
            const dz = player.pos.z - pos.current.z
            const d = Math.hypot(dx, dz) || 1
            chargeDir.current = { x: dx / d, z: dz / d }
            charging.current = true
            timer.current = 0.9
            sfx.swing()
          }
          break
        }
        case 'spawning': {
          if (timer.current <= 0) {
            sfx.bossRoar()
            useGame.getState().showToast('🥚 Queen Goohma squeezes out reinforcements. Gross.')
            const n = 2 + hits.current
            const specs = Array.from({ length: n }, (_, i) => ({
              id: `baby-${Date.now()}-${i}`,
              kind: 'gel' as const,
              x: pos.current.x + Math.sin((i / n) * Math.PI * 2) * 3,
              z: pos.current.z + Math.cos((i / n) * Math.PI * 2) * 3,
            }))
            events.emit('spawn-gels', specs)
            phase.current = 'stunned'
            timer.current = 5
            useGame.getState().showToast(dlg.bossStun)
          }
          break
        }
        case 'stunned': {
          if (timer.current <= 0) {
            phase.current = 'hopping'
            chargesLeft.current = 3
            timer.current = 0.8
          }
          break
        }
        case 'hurt': {
          if (timer.current <= 0) {
            phase.current = 'hopping'
            chargesLeft.current = 3
            timer.current = 0.6
          }
          break
        }
        case 'dying': {
          if (timer.current <= 0) phase.current = 'dead'
          break
        }
      }

      // contact damage (not while stunned — she's busy being vulnerable)
      if (phase.current === 'hopping' || phase.current === 'spawning') {
        const d = Math.hypot(player.pos.x - pos.current.x, player.pos.z - pos.current.z)
        if (d < 2.6 && player.invulnTimer <= 0) {
          const g = useGame.getState()
          g.damage(1)
          sfx.hurt()
          player.invulnTimer = 1.2
          knockbackPlayer(pos.current.x, pos.current.z, 14)
        }
      }
    }

    // ---------- visuals ----------
    const stunned = phase.current === 'stunned'
    const dying = phase.current === 'dying' || phase.current === 'dead'

    const hopY = charging.current ? Math.abs(Math.sin(bounce.current)) * 0.8 : 0
    root.current.position.set(pos.current.x, hopY, pos.current.z)

    // face the player
    const ang = Math.atan2(player.pos.x - pos.current.x, player.pos.z - pos.current.z)
    root.current.rotation.y = ang

    // body wobble
    const sq = dying
      ? Math.max(0.1, 1 - (3 - timer.current) * 0.3)
      : 1 + Math.sin(t * 3) * 0.07 + (charging.current ? 0.15 : 0)
    squish.current.scale.set(2 - sq, sq, 2 - sq)

    // eye: open when stunned, squinted otherwise
    lidTop.current.position.y = stunned ? 1.15 : 0.45
    eye.current.scale.setScalar(stunned ? 1.35 : 1)
    iris.current.color.set(
      flash.current > 0 ? '#ffffff' : stunned ? '#ff4f4f' : '#7a2a4a',
    )
  })

  return (
    <group ref={root} position={[0, 0, 8]}>
      <group ref={squish}>
        {/* royal mass */}
        <mesh position={[0, 1.7, 0]}>
          <sphereGeometry args={[2.6, 14, 12]} />
          <meshToonMaterial color="#8a4a9a" transparent opacity={0.92} />
        </mesh>
        <mesh position={[0, 0.5, 0]} scale={[1.25, 0.5, 1.25]}>
          <sphereGeometry args={[2.4, 12, 8]} />
          <meshToonMaterial color="#73308a" transparent opacity={0.85} />
        </mesh>
        {/* tentacle stubs */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={i}
            position={[Math.sin((i / 6) * Math.PI * 2) * 2.3, 0.5, Math.cos((i / 6) * Math.PI * 2) * 2.3]}
            rotation={[0.6, (i / 6) * Math.PI * 2, 0]}
          >
            <coneGeometry args={[0.35, 1.1, 6]} />
            <meshToonMaterial color="#73308a" />
          </mesh>
        ))}
        {/* THE EYE */}
        <group ref={eye} position={[0, 1.9, 2.1]}>
          <mesh>
            <sphereGeometry args={[0.95, 12, 10]} />
            <meshToonMaterial color="#f5f0e8" />
          </mesh>
          <mesh position={[0, 0, 0.55]}>
            <sphereGeometry args={[0.5, 10, 8]} />
            <meshToonMaterial ref={iris} color="#7a2a4a" />
          </mesh>
          <mesh position={[0, 0, 0.92]}>
            <sphereGeometry args={[0.22, 8, 6]} />
            <meshBasicMaterial color="#100a14" />
          </mesh>
          {/* eyelid */}
          <mesh ref={lidTop} position={[0, 0.45, 0.1]} rotation={[0.5, 0, 0]} scale={[1.05, 0.7, 1.05]}>
            <sphereGeometry args={[0.95, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshToonMaterial color="#8a4a9a" />
          </mesh>
        </group>
        {/* tiny crown — she IS the queen */}
        <group position={[0, 4.1, 0]}>
          <mesh>
            <cylinderGeometry args={[0.5, 0.42, 0.4, 8]} />
            <meshToonMaterial color="#ffdf00" />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh
              key={i}
              position={[Math.sin((i / 5) * Math.PI * 2) * 0.42, 0.35, Math.cos((i / 5) * Math.PI * 2) * 0.42]}
            >
              <coneGeometry args={[0.1, 0.3, 4]} />
              <meshToonMaterial color="#ffdf00" />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

export function BossScene() {
  const defeated = useGame((s) => !!s.flags['boss-defeated'])
  const [, setMounted] = useState(false)

  useEffect(() => {
    setColliders(boundsWalls(14))
    const g = useGame.getState()
    const sp = g.nextSpawn ?? { x: 0, z: -12, heading: 0 }
    g.setNextSpawn(null)
    spawnPlayer(sp.x, sp.z, sp.heading)
    setMounted(true)
    return () => clearSceneState()
  }, [])

  return (
    <>
      <color attach="background" args={['#170f1d']} />
      <fog attach="fog" args={['#170f1d', 14, 40]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 9, 0]} intensity={60} color="#c94f7c" />
      <directionalLight position={[4, 10, -3]} intensity={0.4} color="#9be564" />

      {/* arena */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[19, 22]} />
        <meshToonMaterial color="#4a3046" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[14, 16, 22]} />
        <meshToonMaterial color="#2a1f30" />
      </mesh>
      {/* gunk pillars around the arena */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.sin(a) * 16.5, 2.5, Math.cos(a) * 16.5]}>
            <cylinderGeometry args={[0.7, 1.1, 5, 6]} />
            <meshToonMaterial color="#3a2a3e" />
          </mesh>
        )
      })}

      {!defeated && <QueenGoohma />}
      <Enemies spawns={[]} />

      <Pickups />
      <Gravy />
      <Player />
      <FollowCamera dist={8} height={4.5} />
    </>
  )
}
