import { useEffect, useRef, useState } from 'react'

/** Width of a container element, tracked with a ResizeObserver. */
export function useMeasure<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T | null>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!enabled || !ref.current) return
    const el = ref.current
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0
      setWidth(Math.round(w))
    })
    ro.observe(el)
    setWidth(Math.round(el.getBoundingClientRect().width))
    return () => ro.disconnect()
  }, [enabled])

  return { ref, width }
}
