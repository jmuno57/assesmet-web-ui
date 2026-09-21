export const ATTEMPT_STORAGE_PREFIX = 'kata.attempt.'

export type AttemptClock = {
  startedAt: number
  limitMs: number
}

function keyOf(assessmentId: string) {
  return `${ATTEMPT_STORAGE_PREFIX}${assessmentId}`
}

export function readAttempt(assessmentId: string): AttemptClock | null {
  const raw = sessionStorage.getItem(keyOf(assessmentId))
  if (!raw) {
    return null
  }
  try {
    const parsed = JSON.parse(raw) as AttemptClock
    if (typeof parsed.startedAt !== 'number' || typeof parsed.limitMs !== 'number') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function startAttempt(assessmentId: string, limitMinutes: number, now = Date.now()): AttemptClock {
  const existing = readAttempt(assessmentId)
  if (existing) {
    return existing
  }
  const clock: AttemptClock = { startedAt: now, limitMs: Math.max(1, limitMinutes) * 60_000 }
  sessionStorage.setItem(keyOf(assessmentId), JSON.stringify(clock))
  return clock
}

export function remainingMs(clock: AttemptClock, now = Date.now()) {
  return Math.max(0, clock.startedAt + clock.limitMs - now)
}

export function elapsedMs(clock: AttemptClock, now = Date.now()) {
  return Math.min(clock.limitMs, Math.max(0, now - clock.startedAt))
}

export function isExpired(clock: AttemptClock, now = Date.now()) {
  return remainingMs(clock, now) <= 0
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
