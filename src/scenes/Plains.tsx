// Sloshy Plains — open field between village and dungeon. (Bones; full content in phase 5.)
import { useEffect } from 'react'
import { setColliders, clearSceneState, spawnPlayer } from '../game/world'
import { boundsWalls, circle } from '../game/collision'
import type { Collider } from '../game/collision'
import { Player } from '../game/Player'
import { FollowCamera } from '../game/Camera'
import { Gravy } from '../game/Gravy'
import { Pickups } from '../game/Pickups'
import { ExitTrigger } from '../game/props'
import { useGame } from '../state/store'

const ROCKS: [number, number, number][] = [
  [-18, -5, 1.2],
  [14, 8, 1.5],
  [-8, 14, 1.0],
  [20, -12, 1.3],
]

export function PlainsScene() {
  useEffect(() => {
    const walls: Collider[] = [
      ...boundsWalls(25),
      ...ROCKS.map(([x, z, r]) => circle(x, z, r)),
    ]
    setColliders(walls)
    const g = useGame.getState()
    const sp = g.nextSpawn ?? { x: 0, z: -23, heading: 0 }
    g.setNextSpawn(null)
    spawnPlayer(sp.x, sp.z, sp.heading)
    return () => clearSceneState()
  }, [])

  return (
    <>
      <color attach="background" args={['#8fd4a8']} />
      <fog attach="fog" args={['#8fd4a8', 26, 60]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[8, 14, 5]} intensity={1.3} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[50, 28]} />
        <meshToonMaterial color="#74c75e" />
      </mesh>

      {ROCKS.map(([x, z, r], i) => (
        <mesh key={i} position={[x, r * 0.5, z]}>
          <dodecahedronGeometry args={[r, 0]} />
          <meshToonMaterial color="#8d9499" />
        </mesh>
      ))}

      {/* back to the village */}
      <ExitTrigger
        x={0}
        z={-25.5}
        radius={2}
        to="village"
        spawn={{ x: 0, z: 19, heading: Math.PI }}
      />

      <Pickups />
      <Gravy />
      <Player />
      <FollowCamera />
    </>
  )
}
