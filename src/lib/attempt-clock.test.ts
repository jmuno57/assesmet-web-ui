import { describe, expect, it, beforeEach } from 'vitest'
import { elapsedMs, formatDuration, isExpired, readAttempt, remainingMs, startAttempt } from './attempt-clock'

describe('attempt clock', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('starts once and counts remaining time', () => {
    const clock = startAttempt('asmt-1', 2, 1_000)
    expect(startAttempt('asmt-1', 9, 2_000)).toEqual(clock)
    expect(remainingMs(clock, 1_000 + 30_000)).toBe(90_000)
    expect(elapsedMs(clock, 1_000 + 30_000)).toBe(30_000)
    expect(isExpired(clock, 1_000 + 120_000)).toBe(true)
    expect(readAttempt('asmt-1')?.limitMs).toBe(120_000)
  })

  it('formats mm:ss', () => {
    expect(formatDuration(90_000)).toBe('01:30')
    expect(formatDuration(0)).toBe('00:00')
  })
})
