// Fullscreen helpers. On Android this hides the URL bar (which never auto-hides
// for us since the page can't scroll). iPhone Safari has no Fullscreen API —
// every call here must fail silently there.

type FsElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void }
type FsDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
}

export function isFullscreen(): boolean {
  const d = document as FsDocument
  return !!(d.fullscreenElement || d.webkitFullscreenElement)
}

export function enterFullscreen() {
  const el = document.documentElement as FsElement
  try {
    const p = el.requestFullscreen
      ? el.requestFullscreen({ navigationUI: 'hide' })
      : el.webkitRequestFullscreen?.()
    void (p as Promise<void> | undefined)?.catch(() => {})
  } catch {
    /* unsupported — that's fine */
  }
}

export function exitFullscreen() {
  const d = document as FsDocument
  try {
    const p = d.exitFullscreen ? d.exitFullscreen() : d.webkitExitFullscreen?.()
    void (p as Promise<void> | undefined)?.catch(() => {})
  } catch {
    /* ignore */
  }
}

export function toggleFullscreen() {
  if (isFullscreen()) exitFullscreen()
  else enterFullscreen()
}
