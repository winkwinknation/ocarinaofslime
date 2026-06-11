// World props: cuttable grass, smashable pots, chests, gossip stones, huts, signs, exits.
import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { player, interactables, breakables } from './world'
import { useGame } from '../state/store'
import type { DialogueLine, SceneId } from '../state/store'
import { sfx } from '../audio/notes'
import { dropLoot } from './Pickups'
import { dlg } from '../content/dialogue'
import * as events from './events'

let uid = 0
const nextUid = () => `prop-${++uid}`

// ---------- Grass ----------
export function Grass({ x, z }: { x: number; z: number }) {
  const [cut, setCut] = useState(false)
  const id = useRef(nextUid())

  useEffect(() => {
    if (cut) return
    const key = id.current
    breakables.set(key, {
      id: key,
      x,
      z,
      radius: 0.5,
      broken: false,
      smash: () => {
        breakables.delete(key)
        setCut(true)
        sfx.squish()
        dropLoot(x, z, 'grass')
      },
    })
    return () => {
      breakables.delete(key)
    }
  }, [x, z, cut])

  if (cut) return null
  return (
    <group position={[x, 0, z]} rotation={[0, (x * 7 + z * 13) % 3, 0]}>
      {[-0.12, 0, 0.12].map((ox, i) => (
        <mesh key={i} position={[ox, 0.28, (i - 1) * 0.08]} rotation={[0, 0, (i - 1) * 0.25]}>
          <coneGeometry args={[0.09, 0.6, 4]} />
          <meshToonMaterial color={i === 1 ? '#3f9b2f' : '#4fae3c'} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- Pot ----------
export function Pot({ x, z, rich = false }: { x: number; z: number; rich?: boolean }) {
  const [broken, setBroken] = useState(false)
  const id = useRef(nextUid())

  useEffect(() => {
    if (broken) return
    const key = id.current
    breakables.set(key, {
      id: key,
      x,
      z,
      radius: 0.55,
      broken: false,
      smash: () => {
        breakables.delete(key)
        setBroken(true)
        sfx.potBreak()
        dropLoot(x, z, rich ? 'rich' : 'pot')
      },
    })
    return () => {
      breakables.delete(key)
    }
  }, [x, z, broken, rich])

  if (broken) {
    return (
      <group position={[x, 0, z]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 0.25, 0.05, (i % 2) * 0.2 - 0.1]} rotation={[0.4 * i, i, 0]}>
            <boxGeometry args={[0.18, 0.06, 0.18]} />
            <meshToonMaterial color="#b5651d" />
          </mesh>
        ))}
      </group>
    )
  }
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.18, 0.3, 0.62, 9]} />
        <meshToonMaterial color={rich ? '#c9a227' : '#b5651d'} />
      </mesh>
      <mesh position={[0, 0.66, 0]}>
        <cylinderGeometry args={[0.22, 0.16, 0.12, 9]} />
        <meshToonMaterial color={rich ? '#a8861f' : '#8a4d16'} />
      </mesh>
    </group>
  )
}

// ---------- Chest ----------
export function Chest({
  id,
  x,
  z,
  heading = 0,
  onOpen,
}: {
  id: string
  x: number
  z: number
  heading?: number
  onOpen: () => void
}) {
  const opened = useGame((s) => !!s.flags[`chest-${id}`])
  const setFlag = useGame((s) => s.setFlag)
  const lid = useRef<THREE.Group>(null!)
  const anim = useRef(opened ? 1 : 0)

  useEffect(() => {
    if (opened) return
    const key = `chest-${id}`
    interactables.set(key, {
      id: key,
      x,
      z,
      radius: 1.8,
      label: 'Open',
      onInteract: () => {
        setFlag(`chest-${id}`)
        sfx.chestJingle()
        onOpen()
      },
    })
    return () => {
      interactables.delete(key)
    }
  }, [id, x, z, opened, setFlag, onOpen])

  useFrame((_, dt) => {
    const target = opened ? 1 : 0
    anim.current += (target - anim.current) * Math.min(1, dt * 5)
    lid.current.rotation.x = -anim.current * 1.9
  })

  return (
    <group position={[x, 0, z]} rotation={[0, heading, 0]}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.1, 0.6, 0.75]} />
        <meshToonMaterial color="#8a5a2b" />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[1.14, 0.12, 0.79]} />
        <meshToonMaterial color="#c9a227" />
      </mesh>
      <group ref={lid} position={[0, 0.6, -0.375]}>
        <mesh position={[0, 0.12, 0.375]}>
          <boxGeometry args={[1.1, 0.26, 0.75]} />
          <meshToonMaterial color="#a06a32" />
        </mesh>
        <mesh position={[0, 0.13, 0.74]}>
          <boxGeometry args={[0.16, 0.18, 0.06]} />
          <meshToonMaterial color="#ffd23e" />
        </mesh>
      </group>
    </group>
  )
}

// ---------- Gossip Stone ----------
export function GossipStone({ id, x, z }: { id: string; x: number; z: number }) {
  const dance = useRef(0)
  const root = useRef<THREE.Group>(null!)

  useEffect(() => {
    const key = `gossip-${id}`
    interactables.set(key, {
      id: key,
      x,
      z,
      radius: 1.7,
      label: 'Listen to the weird stone',
      onInteract: () => {
        const g = useGame.getState()
        sfx.blip()
        g.say(dlg.gossip[id] ?? [{ name: 'Gossip Stone', text: '...' }], () => {
          const before = g.gossipFound.length
          g.foundGossip(id)
          const after = useGame.getState().gossipFound.length
          if (after === 6 && before === 5) {
            sfx.songFanfare()
            useGame.getState().showToast(dlg.gossipAllFound)
          }
        })
      },
    })
    return () => {
      interactables.delete(key)
    }
  }, [id, x, z])

  // gossip stones dance when the Song of Squelch plays
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    if (dance.current > 0) {
      dance.current -= dt
      root.current.rotation.z = Math.sin(t * 10) * 0.25
      root.current.position.y = Math.abs(Math.sin(t * 10)) * 0.3
    } else {
      root.current.rotation.z = 0
      root.current.position.y = 0
    }
  })

  useEffect(
    () =>
      events.on('song', (songId) => {
        if (songId === 'squelch') dance.current = 5
      }),
    [],
  )

  return (
    <group position={[x, 0, z]}>
      <group ref={root}>
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.32, 0.45, 1.3, 6]} />
          <meshToonMaterial color="#7d8a99" />
        </mesh>
        <mesh position={[0, 0.95, 0.3]}>
          <sphereGeometry args={[0.11, 8, 8]} />
          <meshBasicMaterial color="#3ec6ff" />
        </mesh>
      </group>
    </group>
  )
}

// ---------- Sign ----------
export function Sign({
  id,
  x,
  z,
  lines,
}: {
  id: string
  x: number
  z: number
  lines: DialogueLine[]
}) {
  useEffect(() => {
    const key = `sign-${id}`
    interactables.set(key, {
      id: key,
      x,
      z,
      radius: 1.6,
      label: 'Read',
      onInteract: () => {
        sfx.blip()
        useGame.getState().say(lines)
      },
    })
    return () => {
      interactables.delete(key)
    }
  }, [id, x, z, lines])

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1, 6]} />
        <meshToonMaterial color="#6b4226" />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[1.1, 0.55, 0.08]} />
        <meshToonMaterial color="#8a5a2b" />
      </mesh>
    </group>
  )
}

// ---------- Mailbox ----------
export function Mailbox({ x, z }: { x: number; z: number }) {
  useEffect(() => {
    const key = 'mailbox'
    interactables.set(key, {
      id: key,
      x,
      z,
      radius: 1.6,
      label: 'Check mail',
      onInteract: () => {
        const g = useGame.getState()
        sfx.blip()
        if (!g.items.ocarina) {
          g.say(dlg.mailNoOcarina)
        } else if (!g.songs.includes('lullaby')) {
          g.say(dlg.letter, () => events.emit('teach-song', 'lullaby'))
        } else {
          g.say([
            { name: 'Mailbox', text: 'No new mail. The princess is busy being mysterious.' },
          ])
        }
      },
    })
    return () => {
      interactables.delete(key)
    }
  }, [x, z])

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 1.1, 6]} />
        <meshToonMaterial color="#555" />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[0.4, 0.32, 0.55]} />
        <meshToonMaterial color="#d04545" />
      </mesh>
      <mesh position={[0, 1.32, 0.1]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.05, 0.22, 0.05]} />
        <meshToonMaterial color="#ffd23e" />
      </mesh>
    </group>
  )
}

// ---------- Hut ----------
export function Hut({
  x,
  z,
  heading = 0,
  color = '#c98f4e',
  roof = '#7a4f2a',
  scale = 1,
}: {
  x: number
  z: number
  heading?: number
  color?: string
  roof?: string
  scale?: number
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, heading, 0]} scale={scale}>
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[1.9, 2.1, 2, 10]} />
        <meshToonMaterial color={color} />
      </mesh>
      <mesh position={[0, 2.6, 0]}>
        <coneGeometry args={[2.5, 1.8, 10]} />
        <meshToonMaterial color={roof} />
      </mesh>
      {/* door */}
      <mesh position={[0, 0.75, 2.02]}>
        <boxGeometry args={[0.9, 1.5, 0.1]} />
        <meshToonMaterial color="#4a3018" />
      </mesh>
      {/* tiny window */}
      <mesh position={[1.2, 1.3, 1.6]} rotation={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 8]} />
        <meshToonMaterial color="#ffe9a8" />
      </mesh>
    </group>
  )
}

// ---------- Exit trigger ----------
export function ExitTrigger({
  x,
  z,
  radius,
  to,
  spawn,
  enabled,
}: {
  x: number
  z: number
  radius: number
  to: SceneId
  spawn: { x: number; z: number; heading: number }
  enabled?: () => boolean
}) {
  const fired = useRef(false)

  useFrame(() => {
    if (fired.current) return
    if (enabled && !enabled()) return
    const dx = player.pos.x - x
    const dz = player.pos.z - z
    if (dx * dx + dz * dz < radius * radius) {
      fired.current = true
      const g = useGame.getState()
      g.setNextSpawn(spawn)
      g.setScene(to)
    }
  })

  return null
}
