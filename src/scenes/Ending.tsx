// The healthy Gunk Tree, post-deworming. Backdrop for the ending cards.
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

export function EndingScene() {
  const tree = useRef<THREE.Group>(null!)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    tree.current.scale.y = 1 + Math.sin(t * 1.2) * 0.02 // breathing easy now
    state.camera.position.set(Math.sin(t * 0.1) * 4, 5, -22)
    state.camera.lookAt(0, 7, 0)
  })

  return (
    <>
      <color attach="background" args={['#ffb86b']} />
      <fog attach="fog" args={['#ffb86b', 20, 60]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[-6, 10, -4]} intensity={1.6} color="#ffd9a0" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[60, 24]} />
        <meshToonMaterial color="#74c75e" />
      </mesh>

      <group ref={tree}>
        <mesh position={[0, 5, 0]}>
          <cylinderGeometry args={[2.6, 4, 10, 9]} />
          <meshToonMaterial color="#7a5a3a" />
        </mesh>
        <mesh position={[0, 12, 0]}>
          <sphereGeometry args={[6, 10, 9]} />
          <meshToonMaterial color="#4fae3c" />
        </mesh>
        <mesh position={[-4, 9.5, -2]}>
          <sphereGeometry args={[3, 8, 7]} />
          <meshToonMaterial color="#5fc04c" />
        </mesh>
        <mesh position={[4, 10, 2]}>
          <sphereGeometry args={[3.4, 8, 7]} />
          <meshToonMaterial color="#3c9342" />
        </mesh>
        {/* happy face */}
        <mesh position={[-1, 6.5, -3.6]}>
          <sphereGeometry args={[0.4, 6, 6]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[1, 6.5, -3.6]}>
          <sphereGeometry args={[0.4, 6, 6]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 5.4, -3.9]} rotation={[-0.2, 0, 0]}>
          <torusGeometry args={[0.7, 0.14, 6, 10, Math.PI]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      </group>

      <Sparkles count={80} scale={20} size={4} speed={0.3} color="#fff6c8" position={[0, 8, 0]} />
    </>
  )
}
