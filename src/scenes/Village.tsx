// Goo-kiri Village — the hub. Huts, NPCs, loot, the sword chest, the shop, and Smido.
import { useEffect } from 'react'
import { setColliders, clearSceneState, spawnPlayer } from '../game/world'
import { boundsWalls, circle, box } from '../game/collision'
import type { Collider } from '../game/collision'
import { Player } from '../game/Player'
import { FollowCamera } from '../game/Camera'
import { Gravy } from '../game/Gravy'
import { Pickups } from '../game/Pickups'
import { NPC } from '../game/NPC'
import { Grass, Pot, Chest, GossipStone, Sign, Mailbox, Hut, ExitTrigger } from '../game/props'
import { useGame } from '../state/store'
import { dlg } from '../content/dialogue'
import { sfx } from '../audio/notes'
import * as events from '../game/events'
import { player } from '../game/world'
import { dist2 } from '../game/collision'
import { SlimeRain } from '../game/SlimeRain'

const TREES: [number, number][] = [
  [-16, -14],
  [-19, -4],
  [-17, 8],
  [-12, 17],
  [4, 18],
  [14, 15],
  [19, 4],
  [17, -8],
  [10, -17],
  [-4, -19],
]

const HUTS: { x: number; z: number; heading: number; color?: string }[] = [
  { x: -12, z: -12, heading: 0.5 }, // Glink's
  { x: -15, z: 2, heading: 1.2, color: '#b9874a' }, // Mildew's
  { x: 13, z: -8, heading: -0.9, color: '#d9a45b' }, // shop
  { x: 12, z: 7, heading: -1.6, color: '#9f7c45' }, // Mopey's
  { x: -8, z: 12, heading: 2.4, color: '#c98f8f' }, // Slurpia's
  { x: 6, z: 15, heading: 3.0, color: '#a8a86a' }, // Philosopher's
]

const GRASS: [number, number][] = [
  [-3, -8], [-5, -5], [2, -4], [5, -7], [7, -2], [-8, -3], [3, 2], [-2, 5],
  [6, 6], [-6, 7], [-10, 9], [9, 1], [12, 2], [-12, 8], [-9, -14], [5, -13],
  [8, -12], [-3, 12], [2, 10], [14, 10], [-16, -8], [16, -2], [-14, 13], [10, 12],
  [0, -2], [-4, 1],
]

const POTS: { x: number; z: number; rich?: boolean }[] = [
  { x: 14.8, z: -5.2 },
  { x: 15.6, z: -6.6 },
  { x: -13.2, z: 4.8 },
  { x: -14.0, z: -0.6 },
  { x: -6.6, z: 14.2 },
  { x: 8.0, z: 13.4 },
  { x: -10.0, z: -9.8 },
  { x: 18.5, z: -15.5, rich: true }, // the Pot of Greed
]

function Tree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.35, 0.5, 2.4, 7]} />
        <meshToonMaterial color="#6b4226" />
      </mesh>
      <mesh position={[0, 3.0, 0]}>
        <coneGeometry args={[1.7, 2.6, 8]} />
        <meshToonMaterial color="#2f7a33" />
      </mesh>
      <mesh position={[0, 4.4, 0]}>
        <coneGeometry args={[1.1, 1.8, 8]} />
        <meshToonMaterial color="#3c9342" />
      </mesh>
    </group>
  )
}

function teach(songId: string) {
  events.emit('teach-song', songId)
}

export function VillageScene() {
  const smidoOpen = useGame((s) => !!s.flags['smido-open'])

  // Slurpia's Song cheers up Mopey if he can hear it
  useEffect(
    () =>
      events.on('song', (songId) => {
        if (songId !== 'slurpia') return
        const g = useGame.getState()
        if (g.flags['mopey-cheered']) return
        if (dist2(player.pos.x, player.pos.z, 9.6, 5.4) < 8 * 8) {
          g.setFlag('mopey-cheered')
          setTimeout(() => g.showToast('♪ Mopey heard that. Mopey is VIBING. Talk to him!'), 1500)
        }
      }),
    [],
  )

  useEffect(() => {
    const walls: Collider[] = [
      ...boundsWalls(21),
      ...TREES.map(([x, z]) => circle(x, z, 0.7)),
      ...HUTS.map((h) => circle(h.x, h.z, 2.3)),
      box(2.5, -9, 0.7, 0.5), // sword chest
      box(17.5, -17, 0.7, 0.5), // bonus chest
      circle(-1.8, 20, 0.5), // gate posts
      circle(1.8, 20, 0.5),
      // NPCs
      circle(-5.6, 9.8, 0.55), // Slurpia
      circle(11.6, -5.8, 0.55), // Gloop
      circle(9.6, 5.4, 0.55), // Mopey
      circle(4.5, 12.6, 0.55), // Philosopher
      circle(-3, 2, 0.55), // Brad
      circle(-12.6, 4.2, 0.55), // Mildew
    ]
    if (!smidoOpen) {
      walls.push(box(0, 20.3, 1.5, 0.9)) // gate gap blocked
      walls.push(circle(0, 18.6, 0.8)) // Smido himself
    } else {
      walls.push(circle(2.8, 18.6, 0.8))
    }
    setColliders(walls)

    const g = useGame.getState()
    const sp = g.nextSpawn ?? { x: 0, z: -12, heading: 0 }
    g.setNextSpawn(null)
    spawnPlayer(sp.x, sp.z, sp.heading)

    return () => clearSceneState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smidoOpen])

  return (
    <>
      <color attach="background" args={['#7ec8e3']} />
      <fog attach="fog" args={['#7ec8e3', 24, 52]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 12, 4]} intensity={1.4} />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[44, 28]} />
        <meshToonMaterial color="#62b54a" />
      </mesh>
      {/* dirt plaza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -6]}>
        <circleGeometry args={[7, 18]} />
        <meshToonMaterial color="#b09362" />
      </mesh>
      {/* path to gate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.011, 10]}>
        <planeGeometry args={[3, 24]} />
        <meshToonMaterial color="#b09362" />
      </mesh>

      {TREES.map(([x, z], i) => (
        <Tree key={i} x={x} z={z} />
      ))}
      {HUTS.map((h, i) => (
        <Hut key={i} x={h.x} z={h.z} heading={h.heading} color={h.color} />
      ))}

      {/* gate posts */}
      <mesh position={[-1.8, 1.2, 20]}>
        <cylinderGeometry args={[0.3, 0.4, 2.4, 7]} />
        <meshToonMaterial color="#6b4226" />
      </mesh>
      <mesh position={[1.8, 1.2, 20]}>
        <cylinderGeometry args={[0.3, 0.4, 2.4, 7]} />
        <meshToonMaterial color="#6b4226" />
      </mesh>
      <mesh position={[0, 2.5, 20]}>
        <boxGeometry args={[4.6, 0.4, 0.4]} />
        <meshToonMaterial color="#8a5a2b" />
      </mesh>

      {/* Glink's leaf bed */}
      <mesh position={[-9.2, 0.08, -13.5]} rotation={[-Math.PI / 2, 0, 0.4]}>
        <circleGeometry args={[1, 8]} />
        <meshToonMaterial color="#4fae3c" />
      </mesh>

      {GRASS.map(([x, z], i) => (
        <Grass key={`g${i}`} x={x} z={z} />
      ))}
      {POTS.map((p, i) => (
        <Pot key={`p${i}`} x={p.x} z={p.z} rich={p.rich} />
      ))}

      {/* chests */}
      <Chest
        id="sword"
        x={2.5}
        z={-9}
        heading={Math.PI}
        onOpen={() => {
          const g = useGame.getState()
          g.giveItem('sword')
          g.showCeremony(dlg.swordChest.title, dlg.swordChest.subtitle)
        }}
      />
      <Chest
        id="bonus"
        x={17.5}
        z={-17}
        heading={Math.PI * 0.75}
        onOpen={() => {
          const g = useGame.getState()
          g.addGloopees(1)
          g.showCeremony(dlg.bonusChest.title, dlg.bonusChest.subtitle)
        }}
      />

      <Mailbox x={1.2} z={-12.5} />
      <Sign id="village" x={1.8} z={6} lines={dlg.signVillage} />
      <GossipStone id="village1" x={-18} z={-17} />
      <GossipStone id="village2" x={16.5} z={12.5} />

      {/* ---------- NPCs ---------- */}
      <NPC
        id="slurpia"
        x={-5.6}
        z={9.8}
        color="#7fe07f"
        name="Slurpia"
        hat="flower"
        getDialogue={() => {
          const g = useGame.getState()
          if (!g.items.ocarina) {
            return {
              lines: dlg.slurpiaFirst,
              onDone: () => {
                const s = useGame.getState()
                sfx.chestJingle()
                s.giveItem('ocarina')
                s.showCeremony(dlg.ocarinaGet.title, dlg.ocarinaGet.subtitle, () => {
                  useGame.getState().say(dlg.slurpiaTeach, () => teach('slurpia'))
                })
              },
            }
          }
          if (!g.songs.includes('slurpia')) {
            return { lines: dlg.slurpiaTeach, onDone: () => teach('slurpia') }
          }
          return { lines: dlg.slurpiaAfter }
        }}
      />

      <NPC
        id="gloop"
        x={11.6}
        z={-5.8}
        color="#f0a040"
        name="Gloop"
        hat="visor"
        label="Shop"
        getDialogue={() => {
          const g = useGame.getState()
          if (g.items.shield) return { lines: dlg.shopAfter }
          return {
            lines: dlg.shopIntro,
            onDone: () => {
              const s = useGame.getState()
              if (s.spendGloopees(40)) {
                s.giveItem('shield')
                sfx.chestJingle()
                s.showCeremony(dlg.shieldGet.title, dlg.shieldGet.subtitle, () =>
                  useGame.getState().say(dlg.shopBought),
                )
              } else {
                s.say(dlg.shopBroke(s.gloopees))
              }
            },
          }
        }}
      />

      <NPC
        id="mopey"
        x={9.6}
        z={5.4}
        color="#6a9fd8"
        name="Mopey"
        hat="cloud"
        getDialogue={() => {
          const g = useGame.getState()
          if (g.flags['mopey-heart-given']) return { lines: dlg.mopeyAfter }
          if (g.flags['mopey-cheered']) {
            return {
              lines: dlg.mopeyCheered,
              onDone: () => {
                const s = useGame.getState()
                s.setFlag('mopey-heart-given')
                s.addMaxHeart()
                sfx.chestJingle()
                s.showCeremony(
                  'You got a HEART CONTAINER!',
                  "Mopey's emergency heart. Max hearts +1. He insists he has more.",
                )
              },
            }
          }
          return { lines: dlg.mopeySad }
        }}
      />

      <NPC
        id="philosopher"
        x={4.5}
        z={12.6}
        color="#9a9a9a"
        name="The Philosopher"
        hat="beard"
        getDialogue={() => {
          const g = useGame.getState()
          if (g.songs.includes('slime')) return { lines: dlg.philosopherAfter }
          if (g.items.ocarina) {
            return { lines: dlg.philosopherFirst, onDone: () => teach('slime') }
          }
          return { lines: dlg.philosopherFirst.slice(0, 2) }
        }}
      />

      <NPC
        id="brad"
        x={-3}
        z={2}
        color="#f08fc0"
        name="Brad"
        getDialogue={() => {
          const g = useGame.getState()
          const alt = !!g.flags['brad-alt']
          g.setFlag('brad-alt', !alt)
          return { lines: alt ? dlg.brad2 : dlg.brad }
        }}
      />

      <NPC
        id="mildew"
        x={-12.6}
        z={4.2}
        color="#b08fd8"
        name="Old Lady Mildew"
        hat="cone"
        getDialogue={() => ({ lines: dlg.mildew })}
      />

      <NPC
        id="smido"
        x={smidoOpen ? 2.8 : 0}
        z={18.6}
        color="#8a9a3a"
        name="Smido"
        scale={1.25}
        getDialogue={() => {
          const g = useGame.getState()
          if (g.flags['smido-open']) return { lines: dlg.smidoAfter }
          if (g.items.sword && g.items.shield) {
            return {
              lines: dlg.smidoOpen,
              onDone: () => {
                useGame.getState().setFlag('smido-open')
                sfx.doorRumble()
              },
            }
          }
          if (g.items.sword) return { lines: dlg.smidoSwordOnly }
          return { lines: dlg.smidoBlocked }
        }}
      />

      <ExitTrigger
        x={0}
        z={21.5}
        radius={1.8}
        to="plains"
        spawn={{ x: 0, z: -23, heading: 0 }}
        enabled={() => !!useGame.getState().flags['smido-open']}
      />

      <SlimeRain />
      <Pickups />
      <Gravy />
      <Player />
      <FollowCamera />
    </>
  )
}
