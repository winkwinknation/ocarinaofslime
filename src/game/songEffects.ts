// What happens when a song is successfully played in free-play mode.
import { useGame } from '../state/store'
import type { SongDef } from '../content/songs'
import { sfx } from '../audio/notes'
import { coinRain } from './Pickups'
import { player } from './world'
import * as events from './events'

/** Returns a banner string to flash in the overlay, or null if the song fizzled. */
export function applySong(song: SongDef): string | null {
  const g = useGame.getState()

  if (song.kind === 'story') {
    if (!g.songs.includes(song.id)) return null // can't invoke what you haven't learned
    events.emit('song', song.id)
    switch (song.id) {
      case 'lullaby':
        if (g.scene !== 'dungeon') {
          g.showToast('You feel sleepy. The grass feels sleepy. Doors, somewhere, feel sleepy.')
        }
        break
      case 'sloshpona':
        if (g.scene !== 'plains') {
          g.showToast('Sloshpona respects fences. (She only comes when called in the plains.)')
        }
        break
      case 'squelch':
        g.showToast('It begins to rain slime. Gross. Refreshing. Gross again.')
        break
      case 'slurpia':
        g.showToast('♪ A certified village banger plays. Dancing is now mandatory. ♪')
        break
      case 'slime':
        sfx.sadKazoo()
        g.showToast('It does nothing. Time is a construct.')
        break
    }
    return song.name
  }

  // ---------- cheat songs ----------
  const firstFind = !g.flags[`found-${song.id}`]
  if (firstFind) g.setFlag(`found-${song.id}`)

  if (song.id === 'greed') {
    // one-shot, not a toggle
    g.addGloopees(999)
    coinRain(player.pos.x, player.pos.z)
    sfx.cheatOn()
    g.showToast(
      firstFind
        ? `🎉 CHEAT DISCOVERED: ${song.name}! ${song.blurb}`
        : '💰 +999 gloopees. Again. The treasury weeps.',
    )
    g.saveGame()
    events.emit('song', song.id)
    return song.name
  }

  const on = g.toggleCheat(song.id)
  if (on) {
    sfx.cheatOn()
    g.showToast(
      firstFind ? `🎉 CHEAT DISCOVERED: ${song.name}! ${song.blurb}` : `✅ ${song.name}: ON`,
    )
    if (song.id === 'rae') {
      setTimeout(() => {
        sfx.hey()
        useGame.getState().hey()
        useGame.getState().showToast('🧚 HEY! LISTEN! ...your majesty.')
      }, 2200)
    }
  } else {
    sfx.cheatOff()
    g.showToast(`◻ ${song.name}: off`)
  }
  events.emit('song', song.id)
  return song.name
}
