// Inside the Great Gunk Tree: combat room → lullaby door → web drop → boss door.
import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { setColliders, clearSceneState, spawnPlayer, player, interactables } from '../game/world'
import { box, dist2 } from '../game/collision'
import type { Collider } from '../game/collision'
import { Player } from '../game/Player'
import { FollowCamera } from '../game/Camera'
import { Gravy } from '../game/Gravy'
import { Pickups } from '../game/Pickups'
import { Enemies } from '../game/Enemy'
import type { GelSpec } from '../game/Enemy'
import { Grass, Pot, GossipStone, ExitTrigger } from '../game/props'
import { useGame } from '../state/store'
import { dlg } from '../content/dialogue'
import { sfx } from '../audio/notes'
import * as events from '../game/events'

// wall segments: [x, z, halfX, halfZ]
const WALLS: [number, number, number, number][] = [
  // entry + south
  [-6.5, -24.5, 5.5, 1.2],
  [6.5, -24.5, 5.5, 1.2],
  [-2.5, -21, 1, 3],
  [2.5, -21, 1, 3],
  // combat room (A)
  [-9.5, -12, 1, 7.5],
  [9.5, -12, 1, 7.5],
  [-6, -18.5, 4.5, 1],
  [6, -18.5, 4.5, 1],
  [-6, -5.5, 4.5, 1],
  [6, -5.5, 4.5, 1],
  // corridor A→B
  [-2.5, -2.5, 1, 3.5],
  [2.5, -2.5, 1, 3.5],
  // puzzle room (B)
  [-8.5, 6, 1, 6.5],
  [8.5, 6, 1, 6.5],
  [-5.5, 0.5, 4, 1],
  [5.5, 0.5, 4, 1],
  [-5.5, 11.5, 4, 1],
  [5.5, 11.5, 4, 1],
  // web room (C)
  [-4.5, 18, 1, 7.5],
  [4.5, 18, 1, 7.5],
  [0, 25.5, 5, 1],
  // boss antechamber
  [-6.5, 33, 1, 6],
  [6.5, 33, 1, 6],
  [0, 27.5, 7, 1],
  [0, 38.5, 7, 1],
]

const DUNGEON_GELS: GelSpec[] = [
  { id: 'dgel1', kind: 'dungeon', x: -4, z: -13 },
  { id: 'dgel2', kind: 'dungeon', x: 4, z: -11 },
  { id: 'dgel3', kind: 'dungeon', x: 0, z: -8 },
]

function Wall({ x, z, hx, hz }: { x: number; z: number; hx: number; hz: number }) {
  return (
    <mesh position={[x, 1.6, z]}>
      <boxGeometry args={[hx * 2, 3.2, hz * 2]} />
      <meshToonMaterial color="#4a3a2a" />
    </mesh>
  )
}

function Torch({ x, z }: { x: number; z: number }) {
  const flame = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    flame.current.scale.setScalar(1 + Math.sin(t * 11 + x) * 0.2)
  })
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.06, 0.09, 1.6, 5]} />
        <meshToonMaterial color="#3a2a1a" />
      </mesh>
      <mesh ref={flame} position={[0, 1.75, 0]}>
        <coneGeometry args={[0.16, 0.4, 6]} />
        <meshBasicMaterial color="#ffb347" />
      </mesh>
      <pointLight position={[0, 1.9, 0]} intensity={6} distance={9} color="#ffb347" />
    </group>
  )
}

/** Big sleepy door of hardened gunk. Soothed open by the lullaby. */
function GunkDoor({ open }: { open: boolean }) {
  const root = useRef<THREE.Group>(null!)
  const melt = useRef(open ? 1 : 0)

  useFrame((_, dt) => {
    const target = open ? 1 : 0
    melt.current += (target - melt.current) * Math.min(1, dt * 2)
    root.current.scale.y = 1 - melt.current * 0.92
    root.current.position.y = -melt.current * 0.5
    root.current.visible = melt.current < 0.97
  })

  return (
    <group position={[0, 0, 11.5]}>
      <group ref={root}>
        <mesh position={[0, 1.6, 0]} scale={[1, 1.4, 0.5]}>
          <sphereGeometry args={[1.9, 10, 8]} />
          <meshToonMaterial color="#6a8a3a" />
        </mesh>
        {/* sleepy face */}
        <mesh position={[-0.5, 2.2, -0.85]} scale={[1, 0.18, 1]}>
          <sphereGeometry args={[0.28, 8, 6]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.5, 2.2, -0.85]} scale={[1, 0.18, 1]}>
          <sphereGeometry args={[0.28, 8, 6]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 1.5, -0.92]} scale={[1, 0.5, 1]}>
          <sphereGeometry args={[0.25, 8, 6]} />
          <meshBasicMaterial color="#2a1a1a" />
        </mesh>
      </group>
    </group>
  )
}

export function DungeonScene() {
  const doorOpen = useGame((s) => !!s.flags['dungeon-door'])
  const combatDone = useGame((s) => !!s.flags['dungeon-combat'])
  const [webBroken, setWebBroken] = useState(false)
  const webFired = useRef(false)

  // colliders depend on progression
  useEffect(() => {
    const walls: Collider[] = WALLS.map(([x, z, hx, hz]) => box(x, z, hx, hz))
    if (!combatDone) walls.push(box(0, -5.5, 2.0, 0.9)) // vine gate
    if (!doorOpen) walls.push(box(0, 11.5, 2.2, 1.0)) // gunk door
    setColliders(walls)
  }, [doorOpen, combatDone])

  // spawn + entry dialogue + interactables
  useEffect(() => {
    const g = useGame.getState()
    const sp = g.nextSpawn ?? { x: 0, z: -22, heading: 0 }
    g.setNextSpawn(null)
    spawnPlayer(sp.x, sp.z, sp.heading)

    if (!g.flags['dungeon-intro']) {
      g.setFlag('dungeon-intro')
      setTimeout(() => useGame.getState().say(dlg.dungeonEntry), 600)
    }

    // sealed door inspection
    interactables.set('gunk-door', {
      id: 'gunk-door',
      x: 0,
      z: 10.5,
      radius: 2.5,
      label: 'Inspect the snoring door',
      enabled: () => !useGame.getState().flags['dungeon-door'],
      onInteract: () => useGame.getState().say(dlg.gunkDoorHint),
    })

    // emergency exit chute in the antechamber
    interactables.set('chute', {
      id: 'chute',
      x: -5,
      z: 29,
      radius: 1.8,
      label: 'Gunk Chute',
      onInteract: () =>
        useGame.getState().say(dlg.chute, () => {
          sfx.splash()
          spawnPlayer(0, -22, 0)
        }),
    })

    // the boss door
    interactables.set('boss-door', {
      id: 'boss-door',
      x: 0,
      z: 37,
      radius: 2.5,
      label: 'The Ominous Door',
      onInteract: () => {
        const s = useGame.getState()
        if (s.flags['boss-defeated']) {
          s.say([
            {
              name: 'Ominous Door',
              text: 'The room beyond is vacant. The eye has been... handled. The door is just a door now. It dreams of retirement.',
            },
          ])
        } else {
          s.say(dlg.bossDoor, () => {
            sfx.bossRoar()
            useGame.getState().setNextSpawn({ x: 0, z: -12, heading: 0 })
            useGame.getState().setScene('boss')
          })
        }
      },
    })

    return () => clearSceneState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // lullaby opens the gunk door when nearby
  useEffect(
    () =>
      events.on('song', (songId) => {
        if (songId !== 'lullaby') return
        const g = useGame.getState()
        if (g.flags['dungeon-door']) return
        if (dist2(player.pos.x, player.pos.z, 0, 11.5) < 8 * 8) {
          g.setFlag('dungeon-door')
          sfx.doorRumble()
          g.showToast(dlg.gunkDoorOpen)
        } else {
          g.showToast('The lullaby echoes... but nothing sleepy is close enough to hear it.')
        }
      }),
    [],
  )

  // web drop trigger
  useFrame(() => {
    if (webFired.current || webBroken) return
    if (dist2(player.pos.x, player.pos.z, 0, 18.5) < 1.6 * 1.6) {
      webFired.current = true
      setWebBroken(true)
      sfx.thud()
      sfx.splash()
      const g = useGame.getState()
      g.showToast(dlg.webDrop)
      spawnPlayer(0, 30, 0)
    }
  })

  return (
    <>
      <color attach="background" args={['#1d1828']} />
      <fog attach="fog" args={['#1d1828', 12, 36]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 10, 2]} intensity={0.5} color="#9be564" />

      {/* gunk floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 6]}>
        <planeGeometry args={[26, 70]} />
        <meshToonMaterial color="#5a4a36" />
      </mesh>
      {/* goo puddles */}
      {[[-5, -10], [6, 4], [-3, 20], [3, 32]].map(([x, z], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.0, z]}>
          <circleGeometry args={[1.4, 10]} />
          <meshToonMaterial color="#6a8a3a" transparent opacity={0.8} />
        </mesh>
      ))}

      {WALLS.map(([x, z, hx, hz], i) => (
        <Wall key={i} x={x} z={z} hx={hx} hz={hz} />
      ))}

      {/* vine gate over combat-room exit */}
      {!combatDone && (
        <group position={[0, 0, -5.5]}>
          {[-1.2, -0.4, 0.4, 1.2].map((x, i) => (
            <mesh key={i} position={[x, 1.4, 0]} rotation={[0, 0, (i % 2 ? 1 : -1) * 0.12]}>
              <cylinderGeometry args={[0.09, 0.12, 2.8, 5]} />
              <meshToonMaterial color="#3c7a2c" />
            </mesh>
          ))}
        </group>
      )}

      <GunkDoor open={doorOpen} />

      {/* web floor in room C */}
      {!webBroken && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 18.5]}>
          <circleGeometry args={[1.9, 8]} />
          <meshBasicMaterial color="#d8d8e8" transparent opacity={0.55} wireframe />
        </mesh>
      )}
      {/* decorative corner webs */}
      {[[-3.5, 14], [3.5, 22]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.8, z]} rotation={[0, i ? -0.7 : 0.7, 0]}>
          <planeGeometry args={[1.8, 1.8]} />
          <meshBasicMaterial color="#d8d8e8" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
      ))}

      <Torch x={-2.8} z={-19} />
      <Torch x={2.8} z={-19} />
      <Torch x={-7} z={2} />
      <Torch x={7} z={2} />
      <Torch x={-5.5} z={36} />
      <Torch x={5.5} z={36} />

      {/* ominous boss door visual */}
      <group position={[0, 0, 37.8]}>
        <mesh position={[0, 1.9, 0]}>
          <boxGeometry args={[3.6, 3.8, 0.6]} />
          <meshToonMaterial color="#2a1f30" />
        </mesh>
        <mesh position={[0, 2.2, -0.35]}>
          <sphereGeometry args={[0.5, 10, 8]} />
          <meshBasicMaterial color="#c94f7c" />
        </mesh>
      </group>

      <Pot x={-7.5} z={-17} />
      <Pot x={7.5} z={-17} />
      <Pot x={-7} z={10} rich />
      <Grass x={-6} z={3} />
      <Grass x={6} z={9} />

      <GossipStone id="dungeon1" x={-6.5} z={-7} leak="greed" />
      <GossipStone id="dungeon2" x={5} z={29} />

      {!combatDone && (
        <Enemies
          spawns={DUNGEON_GELS}
          onAllDead={() => {
            const g = useGame.getState()
            g.setFlag('dungeon-combat')
            sfx.doorRumble()
            g.showToast(dlg.combatCleared)
          }}
        />
      )}

      <ExitTrigger x={0} z={-26} radius={2} to="plains" spawn={{ x: 0, z: 23, heading: Math.PI }} />

      <Pickups />
      <Gravy />
      <Player />
      <FollowCamera dist={7} height={4.2} />
    </>
  )
}
