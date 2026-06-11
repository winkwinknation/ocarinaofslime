// Goo-kiri Village — the hub. (Phase 2: bones; content lands in phase 3.)
import { useEffect } from 'react'
import { setColliders, clearSceneState, spawnPlayer } from '../game/world'
import { boundsWalls, circle } from '../game/collision'
import type { Collider } from '../game/collision'
import { Player } from '../game/Player'
import { FollowCamera } from '../game/Camera'

const TREES: [number, number][] = [
  [-16, -14],
  [-19, -4],
  [-17, 8],
  [-10, 16],
  [4, 18],
  [14, 15],
  [19, 4],
  [17, -8],
  [10, -17],
  [-4, -19],
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

export function VillageScene() {
  useEffect(() => {
    const walls: Collider[] = [
      ...boundsWalls(21),
      ...TREES.map(([x, z]) => circle(x, z, 0.7)),
    ]
    setColliders(walls)
    spawnPlayer(0, -6, 0)
    return () => clearSceneState()
  }, [])

  return (
    <>
      <color attach="background" args={['#7ec8e3']} />
      <fog attach="fog" args={['#7ec8e3', 22, 48]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 12, 4]} intensity={1.4} />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[40, 24]} />
        <meshToonMaterial color="#62b54a" />
      </mesh>

      {TREES.map(([x, z], i) => (
        <Tree key={i} x={x} z={z} />
      ))}

      <Player />
      <FollowCamera />
    </>
  )
}
