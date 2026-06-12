import { useState } from 'react'
import { useGame } from '../state/store'
import { SONGS, noteSymbols } from '../content/songs'
import { sfx } from '../audio/notes'

export function PauseMenu() {
  const paused = useGame((s) => s.paused)
  const setPaused = useGame((s) => s.setPaused)
  const setScene = useGame((s) => s.setScene)
  const saveGame = useGame((s) => s.saveGame)
  const flags = useGame((s) => s.flags)
  const cheats = useGame((s) => s.cheats)
  const songs = useGame((s) => s.songs)
  const [tab, setTab] = useState<'menu' | 'songs' | 'cheats'>('menu')

  if (!paused) return null

  const cheatSongs = SONGS.filter((s) => s.kind === 'cheat')
  const storySongs = SONGS.filter((s) => s.kind === 'story')

  return (
    <div className="pause-overlay">
      <div className="pause-title">PAUSED</div>
      <div className="pause-tabs">
        <button
          className={`pause-tab ${tab === 'menu' ? 'active' : ''}`}
          onClick={() => {
            setTab('menu')
            sfx.menuMove()
          }}
        >
          MENU
        </button>
        <button
          className={`pause-tab ${tab === 'songs' ? 'active' : ''}`}
          onClick={() => {
            setTab('songs')
            sfx.menuMove()
          }}
        >
          SONGS
        </button>
        <button
          className={`pause-tab ${tab === 'cheats' ? 'active' : ''}`}
          onClick={() => {
            setTab('cheats')
            sfx.menuMove()
          }}
        >
          CHEAT-O-PEDIA
        </button>
      </div>

      {tab === 'menu' ? (
        <div className="title-menu">
          <button
            className="menu-btn"
            onClick={() => {
              sfx.menuSelect()
              setPaused(false)
            }}
          >
            Resume
          </button>
          <button
            className="menu-btn"
            onClick={() => {
              sfx.menuSelect()
              saveGame()
              setPaused(false)
              setScene('title')
            }}
          >
            Save + Quit to Title
          </button>
          <div className="title-hint">progress autosaves anyway. this button is for drama.</div>
        </div>
      ) : tab === 'songs' ? (
        <div className="cheatopedia">
          <div style={{ fontSize: 12, color: '#9b8ec4', marginBottom: 8 }}>
            Songs you know. Open the ocarina (Z / 🎵) and play the notes — they trigger on
            their own when you get the sequence right.
          </div>
          {storySongs.map((song) => {
            const known = songs.includes(song.id)
            return (
              <div key={song.id} className="cheat-entry">
                <div className="cheat-name">{known ? song.name : '??? ??? ???'}</div>
                {known ? (
                  <>
                    <div className="cheat-notes">{noteSymbols(song.notes)}</div>
                    <div className="cheat-hint">{song.blurb}</div>
                  </>
                ) : (
                  <div className="cheat-hint">{song.hint}</div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="cheatopedia">
          <div style={{ fontSize: 12, color: '#9b8ec4', marginBottom: 8 }}>
            Secret ocarina songs. Yes, Rae, there are cheat codes. Play a song again to turn it
            off. Hints sold by a guy who definitely isn't suspicious.
          </div>
          {cheatSongs.map((song) => {
            const found = !!flags[`found-${song.id}`]
            const active = !!cheats[song.id]
            return (
              <div key={song.id} className="cheat-entry">
                <div className="cheat-name">
                  {found ? song.name : '??? ??? ???'}
                  {active && <span className="cheat-active"> ● ACTIVE</span>}
                </div>
                {found ? (
                  <>
                    <div className="cheat-notes">{noteSymbols(song.notes)}</div>
                    <div className="cheat-hint">{song.blurb}</div>
                  </>
                ) : (
                  <div className="cheat-hint">{song.hint}</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
