import { useCallback, useEffect, useState } from 'react'
import { elapsedMs, formatDuration, isExpired, readAttempt, remainingMs, startAttempt } from '../lib/attempt-clock'

export function useAttemptClock(
  assessmentId: string | undefined,
  limitMinutes: number,
  options?: { autostart?: boolean },
) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (options?.autostart && assessmentId && limitMinutes > 0) {
      startAttempt(assessmentId, limitMinutes)
      setNow(Date.now())
    }
  }, [assessmentId, limitMinutes, options?.autostart])

  const clock = assessmentId ? readAttempt(assessmentId) : null
  const remaining = clock ? remainingMs(clock, now) : limitMinutes * 60_000
  const elapsed = clock ? elapsedMs(clock, now) : 0
  const expired = clock ? isExpired(clock, now) : false

  const start = useCallback(() => {
    if (!assessmentId) {
      return null
    }
    const next = startAttempt(assessmentId, limitMinutes)
    setNow(Date.now())
    return next
  }, [assessmentId, limitMinutes])

  return {
    started: Boolean(clock),
    remainingMs: remaining,
    elapsedMs: elapsed,
    expired,
    label: formatDuration(remaining),
    elapsedLabel: formatDuration(elapsed),
    start,
  }
}
