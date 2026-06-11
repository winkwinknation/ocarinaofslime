// The full item-get experience: dramatic overlay, jingle already played by the chest.
import { useEffect } from 'react'
import { useGame } from '../state/store'

export function ChestCeremony() {
  const ceremony = useGame((s) => s.ceremony)
  const closeCeremony = useGame((s) => s.closeCeremony)

  useEffect(() => {
    if (!ceremony) return
    const onKey = () => closeCeremony()
    // small delay so the key that opened the chest doesn't instantly dismiss
    const id = setTimeout(() => window.addEventListener('keydown', onKey), 600)
    return () => {
      clearTimeout(id)
      window.removeEventListener('keydown', onKey)
    }
  }, [ceremony, closeCeremony])

  if (!ceremony) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle, rgba(60,40,90,0.5), rgba(5,5,15,0.88))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
        textAlign: 'center',
        padding: 24,
      }}
      onPointerDown={() => setTimeout(closeCeremony, 0)}
    >
      <div style={{ fontSize: 60, animation: 'toast-pop 0.4s ease-out' }}>✨</div>
      <div
        style={{
          fontSize: 'min(7vw, 34px)',
          fontWeight: 900,
          color: '#ffd23e',
          textShadow: '3px 3px 0 rgba(0,0,0,0.6)',
          marginTop: 8,
        }}
      >
        {ceremony.title}
      </div>
      <div style={{ fontSize: 16, color: '#e8e0ff', marginTop: 12, maxWidth: 480 }}>
        {ceremony.subtitle}
      </div>
      <div style={{ fontSize: 12, color: '#9b8ec4', marginTop: 26 }}>
        (press anything to stop posing)
      </div>
    </div>
  )
}
