// Title screen 3D: a slowly spinning low-poly ocarina over the void.
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

export function TitleScene() {
  const spin = useRef<THREE.Group>(null!)

  useFrame((state, dt) => {
    spin.current.rotation.y += dt * 0.6
    spin.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.18
    state.camera.position.set(0, 0.4, 5)
    state.camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <color attach="background" args={['#1a0a2e']} />
      <fog attach="fog" args={['#1a0a2e', 6, 16]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 6, 3]} intensity={1.6} />
      <pointLight position={[-3, -2, 4]} intensity={8} color="#9be564" />

      <group ref={spin}>
        {/* sweet-potato ocarina body */}
        <mesh scale={[1.55, 0.85, 1.0]}>
          <sphereGeometry args={[1, 14, 12]} />
          <meshToonMaterial color="#3f6fb5" />
        </mesh>
        {/* mouthpiece */}
        <mesh position={[0.55, 0.75, 0]} rotation={[0, 0, -0.25]}>
          <cylinderGeometry args={[0.18, 0.22, 0.5, 8]} />
          <meshToonMaterial color="#345d99" />
        </mesh>
        <mesh position={[0.61, 0.99, 0]} rotation={[Math.PI / 2, 0, -0.25]}>
          <torusGeometry args={[0.13, 0.05, 6, 10]} />
          <meshToonMaterial color="#2a4d80" />
        </mesh>
        {/* finger holes */}
        {[
          [-0.55, 0.45, 0.55],
          [-0.15, 0.55, 0.62],
          [0.25, 0.5, 0.6],
          [-0.35, 0.0, 0.92],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} scale={[1, 1, 0.35]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshBasicMaterial color="#101a30" />
          </mesh>
        ))}
      </group>

      <Sparkles count={70} scale={9} size={3.5} speed={0.35} color="#9be564" />
      <Sparkles count={30} scale={7} size={2.5} speed={0.2} color="#d77aff" />
    </>
  )
}
