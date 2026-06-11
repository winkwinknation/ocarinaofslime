import { create } from 'zustand'
import * as events from '../game/events'
import { clearPresses } from '../input/input'

export type SceneId =
  | 'title'
  | 'intro'
  | 'village'
  | 'plains'
  | 'dungeon'
  | 'boss'
  | 'ending'
  | 'credits'

export interface DialogueLine {
  name: string
  text: string
}

export interface DialogueState {
  lines: DialogueLine[]
  index: number
  onDone?: () => void
}

const SAVE_KEY = 'ocarinaofslime-save-v1'

interface SaveData {
  scene: SceneId
  hearts: number
  maxHearts: number
  gloopees: number
  items: string[]
  songs: string[]
  cheats: string[]
  flags: string[]
  heyCount: number
  gossipFound: string[]
  recordFish: number
}

interface GameStore {
  // persisted
  scene: SceneId
  hearts: number // in half-heart steps (3.0 = three full hearts)
  maxHearts: number
  gloopees: number
  items: Record<string, boolean> // sword, shield, ocarina
  songs: string[] // learned song ids, in order
  cheats: Record<string, boolean> // active cheat ids
  flags: Record<string, boolean> // story/world flags
  heyCount: number
  gossipFound: string[]
  recordFish: number // cm, longest catch

  // transient
  dialogue: DialogueState | null
  ocarinaOpen: boolean
  paused: boolean
  toast: string | null
  touchMode: boolean
  prompt: string | null
  ceremony: { title: string; subtitle: string; onClose?: () => void } | null
  nextSpawn: { x: number; z: number; heading: number } | null

  // actions
  setScene: (s: SceneId) => void
  say: (lines: DialogueLine[], onDone?: () => void) => void
  advance: () => void
  addGloopees: (n: number) => void
  spendGloopees: (n: number) => boolean
  damage: (n: number) => void
  heal: (n: number) => void
  addMaxHeart: () => void
  giveItem: (id: string) => void
  learnSong: (id: string) => void
  toggleCheat: (id: string) => boolean
  setFlag: (id: string, v?: boolean) => void
  hey: (n?: number) => void
  showToast: (msg: string) => void
  setOcarinaOpen: (v: boolean) => void
  setPaused: (v: boolean) => void
  setTouchMode: (v: boolean) => void
  setPrompt: (s: string | null) => void
  foundGossip: (id: string) => void
  setRecordFish: (cm: number) => void
  showCeremony: (title: string, subtitle: string, onClose?: () => void) => void
  closeCeremony: () => void
  setNextSpawn: (s: { x: number; z: number; heading: number } | null) => void
  saveGame: () => void
  loadGame: () => boolean
  newGame: () => void
}

const freshState = {
  scene: 'title' as SceneId,
  hearts: 3,
  maxHearts: 3,
  gloopees: 0,
  items: {} as Record<string, boolean>,
  songs: [] as string[],
  cheats: {} as Record<string, boolean>,
  flags: {} as Record<string, boolean>,
  heyCount: 0,
  gossipFound: [] as string[],
  recordFish: 0,
}

let toastTimer: ReturnType<typeof setTimeout> | undefined

export const useGame = create<GameStore>((set, get) => ({
  ...freshState,

  dialogue: null,
  ocarinaOpen: false,
  paused: false,
  toast: null,
  touchMode: false,
  prompt: null,
  ceremony: null,
  nextSpawn: null,

  setScene: (scene) => {
    set({ scene, dialogue: null, ocarinaOpen: false, paused: false, prompt: null })
    // autosave at every scene transition once past the title
    if (scene !== 'title' && scene !== 'credits') {
      // defer so the scene field is committed first
      setTimeout(() => get().saveGame(), 0)
    }
  },

  say: (lines, onDone) => set({ dialogue: { lines, index: 0, onDone } }),

  advance: () => {
    const d = get().dialogue
    if (!d) return
    if (d.index + 1 < d.lines.length) {
      set({ dialogue: { ...d, index: d.index + 1 } })
    } else {
      set({ dialogue: null })
      // the key that closed the dialogue is buffered as an attack press —
      // drop it so it can't instantly re-trigger the same NPC
      clearPresses()
      d.onDone?.()
    }
  },

  addGloopees: (n) => set((s) => ({ gloopees: Math.min(999, s.gloopees + n) })),

  spendGloopees: (n) => {
    if (get().gloopees < n) return false
    set((s) => ({ gloopees: s.gloopees - n }))
    return true
  },

  damage: (n) => {
    const s = get()
    if (s.cheats.rae) return // RAE MODE: god mode
    const hearts = Math.max(0, s.hearts - n)
    if (hearts <= 0) {
      set({ hearts: Math.min(3, s.maxHearts) })
      s.showToast('You died! Hearts refunded. This is a comedy game.')
      events.emit('player-died')
    } else {
      set({ hearts })
    }
  },

  heal: (n) => set((s) => ({ hearts: Math.min(s.maxHearts, s.hearts + n) })),

  addMaxHeart: () =>
    set((s) => {
      const maxHearts = Math.min(5, s.maxHearts + 1)
      return { maxHearts, hearts: maxHearts }
    }),

  giveItem: (id) => set((s) => ({ items: { ...s.items, [id]: true } })),

  learnSong: (id) =>
    set((s) => (s.songs.includes(id) ? s : { songs: [...s.songs, id] })),

  toggleCheat: (id) => {
    const next = !get().cheats[id]
    set((s) => ({ cheats: { ...s.cheats, [id]: next } }))
    get().saveGame()
    return next
  },

  setFlag: (id, v = true) => set((s) => ({ flags: { ...s.flags, [id]: v } })),

  hey: (n = 1) => set((s) => ({ heyCount: s.heyCount + n })),

  showToast: (msg) => {
    clearTimeout(toastTimer)
    set({ toast: msg })
    toastTimer = setTimeout(() => set({ toast: null }), 3500)
  },

  setOcarinaOpen: (ocarinaOpen) => set({ ocarinaOpen }),
  setPaused: (paused) => set({ paused }),
  setTouchMode: (touchMode) => set({ touchMode }),
  setPrompt: (prompt) => {
    if (get().prompt !== prompt) set({ prompt })
  },

  foundGossip: (id) =>
    set((s) => (s.gossipFound.includes(id) ? s : { gossipFound: [...s.gossipFound, id] })),

  setRecordFish: (cm) => set((s) => ({ recordFish: Math.max(s.recordFish, cm) })),

  showCeremony: (title, subtitle, onClose) => set({ ceremony: { title, subtitle, onClose } }),
  closeCeremony: () => {
    const c = get().ceremony
    set({ ceremony: null })
    clearPresses()
    c?.onClose?.()
  },
  setNextSpawn: (nextSpawn) => set({ nextSpawn }),

  saveGame: () => {
    const s = get()
    const data: SaveData = {
      scene: s.scene === 'title' || s.scene === 'credits' || s.scene === 'ending' ? 'village' : s.scene,
      hearts: s.hearts,
      maxHearts: s.maxHearts,
      gloopees: s.gloopees,
      items: Object.keys(s.items).filter((k) => s.items[k]),
      songs: s.songs,
      cheats: Object.keys(s.cheats).filter((k) => s.cheats[k]),
      flags: Object.keys(s.flags).filter((k) => s.flags[k]),
      heyCount: s.heyCount,
      gossipFound: s.gossipFound,
      recordFish: s.recordFish,
    }
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data))
    } catch {
      /* storage full/denied — the game must go on */
    }
  },

  loadGame: () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return false
      const d = JSON.parse(raw) as SaveData
      set({
        hearts: d.hearts,
        maxHearts: d.maxHearts,
        gloopees: d.gloopees,
        items: Object.fromEntries(d.items.map((k) => [k, true])),
        songs: d.songs,
        cheats: Object.fromEntries(d.cheats.map((k) => [k, true])),
        flags: Object.fromEntries(d.flags.map((k) => [k, true])),
        heyCount: d.heyCount,
        gossipFound: d.gossipFound ?? [],
        recordFish: d.recordFish ?? 0,
      })
      get().setScene(d.scene)
      return true
    } catch {
      return false
    }
  },

  newGame: () => {
    set({ ...freshState })
    try {
      localStorage.removeItem(SAVE_KEY)
    } catch {
      /* ignore */
    }
  },
}))

export function hasSave(): boolean {
  try {
    return localStorage.getItem(SAVE_KEY) !== null
  } catch {
    return false
  }
}
