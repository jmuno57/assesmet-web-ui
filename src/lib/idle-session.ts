const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'] as const

export function startIdleWatch(timeoutMs: number, onIdle: () => void): () => void {
  let timer: ReturnType<typeof setTimeout>

  const arm = () => {
    clearTimeout(timer)
    timer = setTimeout(onIdle, timeoutMs)
  }

  ACTIVITY_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, arm, { passive: true })
  })
  arm()

  return () => {
    clearTimeout(timer)
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.removeEventListener(eventName, arm)
    })
  }
}
