import { useEffect } from 'react'

export function useKeyboard(handlers) {
  useEffect(() => {
    function onKey(e) {
      // Don't fire when typing in inputs
      if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return
      const handler = handlers[e.key] || handlers[e.code]
      if (handler) { e.preventDefault(); handler(e) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handlers])
}
