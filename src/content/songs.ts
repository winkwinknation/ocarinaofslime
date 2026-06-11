// Every song in the game — story songs AND cheat songs. All melodies original.
// Note indices: 0=Ⓐ(D4) 1=▼(F4) 2=►(A4) 3=◄(C5) 4=▲(D5)

export interface SongDef {
  id: string
  name: string
  notes: number[]
  kind: 'story' | 'cheat'
  hint: string // riddle shown in the Cheat-o-pedia / by hint vendors
  blurb: string // what it does, shown when learned/discovered
}

export const SONGS: SongDef[] = [
  // ---------- story songs ----------
  {
    id: 'lullaby',
    name: "Slime's Lullaby",
    notes: [0, 3, 2, 0, 3, 2],
    kind: 'story',
    hint: 'A royal melody, passed down the Raelda family for literal weeks.',
    blurb: 'Opens sealed gunk doors. Also slaps as a ringtone.',
  },
  {
    id: 'sloshpona',
    name: "Sloshpona's Song",
    notes: [4, 2, 1, 4, 2, 1],
    kind: 'story',
    hint: 'Summons a horse-shaped friend.',
    blurb: 'Summons Sloshpona the slime horse (plains only — she has boundaries).',
  },
  {
    id: 'squelch',
    name: 'Song of Squelch',
    notes: [1, 1, 4, 1, 1, 4],
    kind: 'story',
    hint: 'The weather forecast, but a threat.',
    blurb: 'Makes it rain slime. Fish love it. Gossip stones dance to it.',
  },
  {
    id: 'slurpia',
    name: "Slurpia's Song",
    notes: [2, 3, 2, 3, 4, 2],
    kind: 'story',
    hint: 'A certified banger from the village DJ.',
    blurb: 'A groovy loop. Nearby NPCs are legally required to dance.',
  },
  {
    id: 'slime',
    name: 'Song of Slime',
    notes: [0, 0, 0, 0, 0, 0],
    kind: 'story',
    hint: 'One note. Six times. Art.',
    blurb: 'It does nothing. Time is a construct.',
  },

  // ---------- cheat songs ----------
  {
    id: 'rae',
    name: 'Song of Rae',
    notes: [4, 4, 0, 0, 4, 4],
    kind: 'cheat',
    hint: "There's a song named after you. Obviously. Two crowns held high, two humble bows, two crowns again.",
    blurb: 'RAE MODE: invincible, golden, and legally royalty.',
  },
  {
    id: 'greed',
    name: 'Song of Greed',
    notes: [3, 3, 0, 3, 3, 0],
    kind: 'cheat',
    hint: 'Grabby grabby hands to the left, then bow to the money. Twice.',
    blurb: '+999 gloopees. The economy is ruined and it is your fault.',
  },
  {
    id: 'violence',
    name: 'Song of Violence',
    notes: [2, 2, 2, 4, 4, 4],
    kind: 'cheat',
    hint: 'Three steps forward, three notes of pure escalation.',
    blurb: 'Comically gigantic sword. One-shots everything. Barely fits on screen.',
  },
  {
    id: 'zoomies',
    name: 'Song of Zoomies',
    notes: [0, 1, 2, 3, 4, 4],
    kind: 'cheat',
    hint: 'Climb the whole ladder, then hit the top twice because you can.',
    blurb: '3× run speed. The ground is lava and you owe it money.',
  },
  {
    id: 'bighead',
    name: 'Ballad of the Big Head',
    notes: [4, 0, 4, 0, 1, 1],
    kind: 'cheat',
    hint: 'Big, small, big, small... then two low notes for the chin.',
    blurb: 'Classic big-head mode. The cap stretches to fit. Mostly.',
  },
  {
    id: 'moon',
    name: 'Moon Gloop',
    notes: [4, 3, 2, 1, 0, 0],
    kind: 'cheat',
    hint: 'Fall down the whole ladder gently, then land twice. Gravity is a suggestion.',
    blurb: 'Low gravity. Hops become majestic. Physics files a complaint.',
  },
]

export const songById = (id: string) => SONGS.find((s) => s.id === id)!

/** Match the tail of the played-note buffer against every song. */
export function detectSong(buffer: number[]): SongDef | null {
  for (const song of SONGS) {
    const n = song.notes.length
    if (buffer.length < n) continue
    const tail = buffer.slice(buffer.length - n)
    if (tail.every((v, i) => v === song.notes[i])) return song
  }
  return null
}

export const noteSymbols = (notes: number[]) =>
  notes.map((n) => ['Ⓐ', '▼', '►', '◄', '▲'][n]).join(' ')
