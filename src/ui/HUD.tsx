import { useGame } from '../state/store'

const HEART_PATH =
  'M5 8.5C1 5.5 0 3.5 0 2.2 0 .8 1.2 0 2.4 0 3.4 0 4.4.6 5 1.6 5.6.6 6.6 0 7.6 0 8.8 0 10 .8 10 2.2 10 3.5 9 5.5 5 8.5Z'

function Heart({ frac, id }: { frac: number; id: string }) {
  return (
    <svg viewBox="0 0 10 9" width="26" height="24">
      <path d={HEART_PATH} fill="#3a2230" stroke="#1c1018" strokeWidth="0.5" />
      {frac > 0 && (
        <>
          <defs>
            <clipPath id={id}>
              <rect x="0" y="0" width={10 * frac} height="9" />
            </clipPath>
          </defs>
          <path d={HEART_PATH} fill="#ff3355" clipPath={`url(#${id})`} />
        </>
      )}
    </svg>
  )
}

function GloopeeIcon() {
  return (
    <svg viewBox="0 0 10 12" width="16" height="20">
      <path
        d="M5 0C5 0 9.5 5.5 9.5 8.2 9.5 10.4 7.5 12 5 12 2.5 12 0.5 10.4 0.5 8.2 0.5 5.5 5 0 5 0Z"
        fill="#7ae056"
        stroke="#2c8a2c"
        strokeWidth="0.6"
      />
    </svg>
  )
}

const CHEAT_ICONS: Record<string, string> = {
  rae: '👑',
  greed: '💰',
  violence: '🗡️',
  zoomies: '💨',
  bighead: '🎈',
  moon: '🌙',
}

export function HUD() {
  const hearts = useGame((s) => s.hearts)
  const maxHearts = useGame((s) => s.maxHearts)
  const gloopees = useGame((s) => s.gloopees)
  const heyCount = useGame((s) => s.heyCount)
  const cheats = useGame((s) => s.cheats)
  const prompt = useGame((s) => s.prompt)
  const toast = useGame((s) => s.toast)
  const dialogue = useGame((s) => s.dialogue)
  const touchMode = useGame((s) => s.touchMode)

  const activeCheats = Object.keys(cheats).filter((k) => cheats[k])

  return (
    <>
      <div className="hud-hearts">
        {Array.from({ length: maxHearts }, (_, i) => (
          <Heart key={i} id={`h${i}`} frac={Math.max(0, Math.min(1, hearts - i))} />
        ))}
      </div>
      <div className="hud-gloopees">
        <GloopeeIcon />
        <span>{gloopees}</span>
      </div>
      <div className="hud-hey">
        <div>GRAVY'S "HEY!" COUNT</div>
        <div className="count">{heyCount}</div>
      </div>
      {activeCheats.length > 0 && (
        <div className="hud-cheats" title="active cheats">
          {activeCheats.map((c) => (
            <span key={c}>{CHEAT_ICONS[c] ?? '❓'}</span>
          ))}
        </div>
      )}
      {prompt && !dialogue && (
        <div className="hud-prompt">
          <span className="abtn">{touchMode ? 'A' : '␣'}</span>
          {prompt}
        </div>
      )}
      {toast && <div className="hud-toast">{toast}</div>}
    </>
  )
}
