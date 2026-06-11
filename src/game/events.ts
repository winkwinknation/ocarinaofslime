// Tiny event bus for cross-system signals (song played, enemy died, etc.)

type Handler = (data?: unknown) => void

const handlers = new Map<string, Set<Handler>>()

export function on(name: string, fn: Handler): () => void {
  let set = handlers.get(name)
  if (!set) {
    set = new Set()
    handlers.set(name, set)
  }
  set.add(fn)
  return () => set.delete(fn)
}

export function emit(name: string, data?: unknown) {
  handlers.get(name)?.forEach((fn) => fn(data))
}
