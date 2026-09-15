// Module-level singleton — all registered containers share the same scrollLeft
const containers = new Set()
let syncing = false

export function useSyncScroll() {
  function register(el) { if (el) containers.add(el) }
  function unregister(el) { containers.delete(el) }
  function onScroll(e) {
    if (syncing) return
    syncing = true
    const x = e.currentTarget.scrollLeft
    for (const c of containers) {
      if (c !== e.currentTarget) c.scrollLeft = x
    }
    syncing = false
  }
  return { register, unregister, onScroll }
}
