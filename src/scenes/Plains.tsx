// Sloshy Plains — open field: Gels, Sloshpona, the fishing pond, gossip stones,
// and a guy who is definitely not suspicious.
import { useEffect } from 'react'
import { setColliders, clearSceneState, spawnPlayer, interactables } from '../game/world'
import { boundsWalls, circle } from '../game/collision'
import type { Collider } from '../game/collision'
import { Player } from '../game/Player'
import { FollowCamera } from '../game/Camera'
import { Gravy } from '../game/Gravy'
import { Pickups } from '../game/Pickups'
import { NPC } from '../game/NPC'
import { Enemies } from '../game/Enemy'
import type { GelSpec } from '../game/Enemy'
import { Horse } from '../game/Horse'
import { Grass, Pot, GossipStone, Sign, ExitTrigger } from '../game/props'
import { SlimeRain } from '../game/SlimeRain'
import { useGame } from '../state/store'
import { dlg } from '../content/dialogue'
import { SONGS, noteSymbols } from '../content/songs'
import * as events from '../game/events'

const POND = { x: 14, z: 6, r: 5 }

const TREES: [number, number][] = [
  [-20, -20], [-22, -8], [-21, 5], [-19, 16], [-10, 22], [8, 22], [20, 18],
  [22, -4], [19, -18], [8, -22], [-6, -21], [22, 8],
]

const ROCKS: [number, number, number][] = [
  [-12, -8, 1.3],
  [6, 12, 1.1],
  [-5, 8, 0.9],
  [10, -12, 1.4],
  [-16, 10, 1.0],
]

const GRASS: [number, number][] = [
  [-8, -14], [-4, -10], [3, -14], [7, -8], [-14, -2], [-9, 3], [-3, -2], [4, -3],
  [-17, -12], [12, -5], [-12, 14], [-6, 16], [2, 16], [7, 5], [-2, 10], [18, 12],
  [20, 2], [16, -8], [3, 7], [-18, 2],
]

const GELS: GelSpec[] = [
  { id: 'gel1', kind: 'gel', x: -6, z: -6 },
  { id: 'gel2', kind: 'gel', x: 6, z: -10 },
  { id: 'gel3', kind: 'gel', x: -10, z: 8 },
  { id: 'gel4', kind: 'gel', x: 2, z: 12 },
  { id: 'big1', kind: 'big', x: -2, z: 2 },
]

function Tree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.35, 0.5, 2.4, 7]} />
        <meshToonMaterial color="#6b4226" />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <sphereGeometry args={[1.8, 8, 7]} />
        <meshToonMaterial color="#3c9342" />
      </mesh>
    </group>
  )
}

export function PlainsScene() {
  useEffect(() => {
    const walls: Collider[] = [
      ...boundsWalls(25),
      ...TREES.map(([x, z]) => circle(x, z, 0.7)),
      ...ROCKS.map(([x, z, r]) => circle(x, z, r)),
      circle(POND.x, POND.z, POND.r - 0.6), // can't walk on water (it's barely water)
      circle(9, 1.5, 0.55), // Old Mackerel
      circle(-19, -22, 0.55), // Sketchy Slime
      circle(-4.5, -6, 0.4), // horse-shaped sign
    ]
    setColliders(walls)
    const g = useGame.getState()
    const sp = g.nextSpawn ?? { x: 0, z: -23, heading: 0 }
    g.setNextSpawn(null)
    spawnPlayer(sp.x, sp.z, sp.heading)

    // the horse-shaped sign teaches Sloshpona's Song
    interactables.set('horse-sign', {
      id: 'horse-sign',
      x: -4.5,
      z: -6,
      radius: 1.8,
      label: 'Read the horse-shaped sign',
      onInteract: () => {
        const g = useGame.getState()
        if (!g.items.ocarina) g.say(dlg.horseSignNoOcarina)
        else if (!g.songs.includes('sloshpona'))
          g.say(dlg.horseSign, () => events.emit('teach-song', 'sloshpona'))
        else g.say(dlg.horseSignAfter)
      },
    })

    // fishing spot
    interactables.set('fish-spot', {
      id: 'fish-spot',
      x: POND.x - POND.r + 0.6,
      z: POND.z - 1,
      radius: 1.8,
      label: 'Fish',
      onInteract: () => useGame.getState().setFishing(true),
    })

    return () => clearSceneState()
  }, [])

  return (
    <>
      <color attach="background" args={['#9adcb8']} />
      <fog attach="fog" args={['#9adcb8', 28, 64]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[8, 14, 5]} intensity={1.3} />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[52, 28]} />
        <meshToonMaterial color="#74c75e" />
      </mesh>

      {/* pond */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[POND.x, 0.0, POND.z]}>
        <circleGeometry args={[POND.r, 20]} />
        <meshToonMaterial color="#3e8ec4" transparent opacity={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[POND.x, 0.02, POND.z]}>
        <ringGeometry args={[POND.r - 0.4, POND.r, 20]} />
        <meshToonMaterial color="#b09362" />
      </mesh>

      {/* paths */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.011, 0]}>
        <planeGeometry args={[3, 50]} />
        <meshToonMaterial color="#b09362" />
      </mesh>

      {TREES.map(([x, z], i) => (
        <Tree key={i} x={x} z={z} />
      ))}
      {ROCKS.map(([x, z, r], i) => (
        <mesh key={`r${i}`} position={[x, r * 0.45, z]}>
          <dodecahedronGeometry args={[r, 0]} />
          <meshToonMaterial color="#8d9499" />
        </mesh>
      ))}
      {GRASS.map(([x, z], i) => (
        <Grass key={`g${i}`} x={x} z={z} />
      ))}
      <Pot x={10.5} z={2.2} />
      <Pot x={11.5} z={1.2} />

      <Sign
        id="plains"
        x={1.8}
        z={-21}
        lines={[
          {
            name: 'Sign',
            text: '⬆ NORTH: The Great Gunk Tree (currently: sick)\n⬇ SOUTH: Goo-kiri Village\n→ EAST: pond. you can fish. the fish are aware.',
          },
        ]}
      />

      {/* the horse-shaped sign (it's a sign, shaped like a horse) */}
      <group position={[-4.5, 0, -6]} rotation={[0, 0.5, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 1, 6]} />
          <meshToonMaterial color="#6b4226" />
        </mesh>
        {/* horse-silhouette board: body + neck + head + ears */}
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[1.0, 0.45, 0.08]} />
          <meshToonMaterial color="#8a5a2b" />
        </mesh>
        <mesh position={[0.45, 1.45, 0]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.22, 0.5, 0.08]} />
          <meshToonMaterial color="#8a5a2b" />
        </mesh>
        <mesh position={[0.62, 1.62, 0]}>
          <boxGeometry args={[0.34, 0.18, 0.08]} />
          <meshToonMaterial color="#8a5a2b" />
        </mesh>
        <mesh position={[0.52, 1.78, 0]}>
          <coneGeometry args={[0.05, 0.14, 4]} />
          <meshToonMaterial color="#6b4226" />
        </mesh>
        {/* board legs (the horse has legs. it's a thorough sign) */}
        <mesh position={[-0.3, 0.78, 0]}>
          <boxGeometry args={[0.1, 0.25, 0.08]} />
          <meshToonMaterial color="#8a5a2b" />
        </mesh>
        <mesh position={[0.3, 0.78, 0]}>
          <boxGeometry args={[0.1, 0.25, 0.08]} />
          <meshToonMaterial color="#8a5a2b" />
        </mesh>
      </group>

      {/* fishing rod marker at the spot */}
      <group position={[POND.x - POND.r + 0.6, 0, POND.z - 1]}>
        <mesh position={[0.2, 0.5, 0]} rotation={[0, 0, -0.7]}>
          <cylinderGeometry args={[0.03, 0.04, 1.4, 5]} />
          <meshToonMaterial color="#8a5a2b" />
        </mesh>
      </group>

      <GossipStone id="plains1" x={-20} z={12} leak="moon" />
      <GossipStone id="plains2" x={18} z={-16} />

      {/* ---------- NPCs ---------- */}
      <NPC
        id="mackerel"
        x={9}
        z={1.5}
        color="#5a8ad8"
        name="Old Mackerel"
        hat="beard"
        getDialogue={() => {
          const g = useGame.getState()
          if (!g.items.ocarina) return { lines: dlg.mackerelNoOcarina }
          if (!g.songs.includes('squelch')) {
            return {
              lines: dlg.mackerelFirst,
              onDone: () => events.emit('teach-song', 'squelch'),
            }
          }
          return { lines: dlg.mackerelAfter }
        }}
      />

      <NPC
        id="sketchy"
        x={-19}
        z={-22}
        color="#4a4a5e"
        name="Sketchy Slime"
        hat="hood"
        label="Whisper"
        getDialogue={() => {
          const g = useGame.getState()
          const order = ['zoomies', 'violence', 'rae', 'greed', 'bighead', 'moon']
          const next = order.find((id) => !g.flags[`found-${id}`])
          if (!next) return { lines: dlg.sketchySoldOut }
          return {
            lines: dlg.sketchyIntro,
            onDone: () => {
              const s = useGame.getState()
              if (s.spendGloopees(20)) {
                s.setFlag(`found-${next}`)
                s.saveGame()
                const song = SONGS.find((x) => x.id === next)!
                s.say(dlg.sketchyReveal(song.name, noteSymbols(song.notes)), () =>
                  useGame.getState().showToast('📖 Cheat-o-pedia updated! (pause menu)'),
                )
              } else {
                s.say(dlg.sketchyBroke)
              }
            },
          }
        }}
      />

      <Enemies spawns={GELS} />
      <Horse />

      {/* exits */}
      <ExitTrigger x={0} z={-25.5} radius={2} to="village" spawn={{ x: 0, z: 19, heading: Math.PI }} />
      <ExitTrigger x={0} z={25.5} radius={2.5} to="dungeon" spawn={{ x: 0, z: -16, heading: 0 }} />

      {/* gunk tree silhouette at the north edge */}
      <group position={[0, 0, 29]}>
        <mesh position={[0, 4, 0]}>
          <cylinderGeometry args={[2.2, 3.4, 8, 9]} />
          <meshToonMaterial color="#5a4a36" />
        </mesh>
        <mesh position={[0, 9, 0]}>
          <sphereGeometry args={[4.5, 9, 8]} />
          <meshToonMaterial color="#4a6b3a" />
        </mesh>
        {/* sick face */}
        <mesh position={[-0.8, 5.2, -2.9]}>
          <sphereGeometry args={[0.35, 6, 6]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.8, 5.2, -2.9]}>
          <sphereGeometry args={[0.35, 6, 6]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 4.2, -3.1]} rotation={[0.3, 0, 0]}>
          <torusGeometry args={[0.5, 0.12, 6, 10, Math.PI]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      </group>

      <SlimeRain />
      <Pickups />
      <Gravy />
      <Player />
      <FollowCamera />
    </>
  )
}
