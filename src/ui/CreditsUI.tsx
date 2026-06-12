// Scrolling credits. Every role is true from a certain point of view.
import { useGame } from '../state/store'
import { sfx } from '../audio/notes'

export function CreditsUI() {
  const setScene = useGame((s) => s.setScene)
  const heyCount = useGame((s) => s.heyCount)
  const gossipFound = useGame((s) => s.gossipFound)
  const recordFish = useGame((s) => s.recordFish)
  const cheats = useGame((s) => s.flags)

  const cheatsFound = ['rae', 'greed', 'violence', 'zoomies', 'bighead', 'moon'].filter(
    (c) => cheats[`found-${c}`],
  ).length

  const ROLES: [string, string][] = [
    ['Directed by', 'a slime'],
    ['Produced by', 'Slimetendo® (all rights reserved-ish)'],
    ['Executive Producer', 'the concept of waiting'],
    ['Lighting Director', 'The Sun'],
    ['QA', 'nobody'],
    ['Combat Choreography', 'a stick'],
    ['Horse', 'three slimes in a costume (allegedly)'],
    ['Fairy Vocal Coach', 'regret'],
    ['Hydration Consultant', 'the entire cast'],
    ['Legal Counsel', 'Legally Distinct LLC'],
    ['Music', 'an ocarina that is slightly a potato'],
    ['Weather Effects', 'one (1) song'],
    ['Catering', 'the Pot of Greed'],
    ['Economy Design', 'grass'],
    ['Boss Therapy', 'pending'],
    ['Localization', 'declined'],
  ]

  return (
    <div className="credits-roll">
      <div className="credits-inner" style={{ animationDuration: '52s' }}>
        <h2 style={{ fontSize: 34 }}>OCARINA OF SLIME</h2>
        <div style={{ color: '#9b8ec4', fontSize: 14 }}>a Slimetendo® production</div>
        <br />
        {ROLES.map(([role, name]) => (
          <div key={role}>
            <span className="role">{role}</span>
            {name}
          </div>
        ))}
        <h2>YOUR LEGEND, BY THE NUMBERS</h2>
        <div>
          <span className="role">Times Gravy said HEY! LISTEN!</span>
          {heyCount} (each one a gift)
        </div>
        <div>
          <span className="role">Gossip stones found</span>
          {gossipFound.length} / 6
        </div>
        <div>
          <span className="role">Record fish</span>
          {recordFish > 0 ? `${recordFish}cm` : 'the fish remain unbothered'}
        </div>
        <div>
          <span className="role">Cheats discovered</span>
          {cheatsFound} / 6 {cheatsFound === 6 ? '— Rae-certified gamer' : ''}
        </div>
        <h2>SPECIAL THANKS</h2>
        <div style={{ fontSize: 22, color: '#ff9ad5' }}>
          Rae
          <div style={{ fontSize: 14, color: '#d8d0ff' }}>
            who couldn't wait for the real one 💚
          </div>
        </div>
        <br />
        <br />
        <div style={{ fontSize: 20, color: '#8aff5a' }}>Thanks for playing!</div>
        <div style={{ fontSize: 16 }}>Now go wait for the real one like everyone else.</div>
        <br />
        <div style={{ fontSize: 12, color: '#665a8a' }}>
          no slimes were harmed. several were mildly inconvenienced.
        </div>
      </div>
      <button
        className="menu-btn"
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 15,
          minWidth: 0,
          padding: '8px 24px',
          opacity: 0.85,
        }}
        onClick={() => {
          sfx.menuSelect()
          setScene('title')
        }}
      >
        back to title
      </button>
    </div>
  )
}
