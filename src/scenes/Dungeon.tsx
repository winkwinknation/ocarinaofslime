// Inside the Great Gunk Tree. (Stub — full dungeon lands in phase 6.)
import { useEffect } from 'react'
import { setColliders, clearSceneState, spawnPlayer } from '../game/world'
import { boundsWalls } from '../game/collision'
import { Player } from '../game/Player'
import { FollowCamera } from '../game/Camera'
import { Gravy } from '../game/Gravy'
import { Pickups } from '../game/Pickups'
import { ExitTrigger } from '../game/props'
import { useGame } from '../state/store'

export function DungeonScene() {
  useEffect(() => {
    setColliders(boundsWalls(18))
    const g = useGame.getState()
    const sp = g.nextSpawn ?? { x: 0, z: -16, heading: 0 }
    g.setNextSpawn(null)
    spawnPlayer(sp.x, sp.z, sp.heading)
    return () => clearSceneState()
  }, [])

  return (
    <>
      <color attach="background" args={['#2a2438']} />
      <fog attach="fog" args={['#2a2438', 10, 34]} />
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 6, 0]} intensity={40} color="#9be564" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[24, 20]} />
        <meshToonMaterial color="#5a4a36" />
      </mesh>

      <ExitTrigger x={0} z={-18.5} radius={2} to="plains" spawn={{ x: 0, z: 23, heading: Math.PI }} />

      <Pickups />
      <Gravy />
      <Player />
      <FollowCamera />
    </>
  )
}
