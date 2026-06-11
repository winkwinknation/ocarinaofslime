import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGame } from './state/store'
import type { SceneId } from './state/store'
import { useKeyboard } from './input/useKeyboard'
import { unlock } from './audio/engine'
import { GameSystems } from './game/GameSystems'
import { TitleScene } from './scenes/Title'
import { VillageScene } from './scenes/Village'
import { TitleUI } from './ui/TitleUI'
import { IntroUI } from './ui/IntroUI'
import { HUD } from './ui/HUD'
import { DialogueBox } from './ui/DialogueBox'
import { PauseMenu } from './ui/PauseMenu'
import { TouchControls } from './input/TouchControls'

const GAMEPLAY: SceneId[] = ['village', 'plains', 'dungeon', 'boss']

function SceneView() {
  const scene = useGame((s) => s.scene)
  switch (scene) {
    case 'title':
      return <TitleScene />
    case 'intro':
      return null
    case 'village':
      return <VillageScene />
    default:
      return <VillageScene />
  }
}

function RotateJoke() {
  const touchMode = useGame((s) => s.touchMode)
  const [portrait, setPortrait] = useState(false)
  useEffect(() => {
    const mq = matchMedia('(orientation: portrait)')
    const update = () => setPortrait(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  if (!touchMode || !portrait) return null
  return (
    <div className="rotate-joke">
      🔄 rotate your device, hero. (it'll work in portrait but you'll regret it)
    </div>
  )
}

export default function App() {
  useKeyboard()
  const scene = useGame((s) => s.scene)
  const setTouchMode = useGame((s) => s.setTouchMode)
  const inGame = GAMEPLAY.includes(scene)

  // audio unlock on any gesture (iOS requires this) + touch detection
  useEffect(() => {
    const u = () => unlock()
    window.addEventListener('pointerdown', u)
    window.addEventListener('keydown', u)
    if (matchMedia('(pointer: coarse)').matches) setTouchMode(true)
    const t = () => setTouchMode(true)
    window.addEventListener('touchstart', t, { once: true })
    return () => {
      window.removeEventListener('pointerdown', u)
      window.removeEventListener('keydown', u)
      window.removeEventListener('touchstart', t)
    }
  }, [setTouchMode])

  return (
    <>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 55, near: 0.1, far: 120, position: [0, 3, -6] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <GameSystems />
        <SceneView />
      </Canvas>

      <div className="ui-layer">
        {scene === 'title' && <TitleUI />}
        {scene === 'intro' && <IntroUI />}
        {inGame && (
          <>
            <HUD />
            <DialogueBox />
            <TouchControls />
            <PauseMenu />
          </>
        )}
        <RotateJoke />
      </div>
    </>
  )
}
