import { afterEach, describe, expect, it, vi } from 'vitest'
import { startIdleWatch } from './idle-session'

describe('idle session', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('fires onIdle after the timeout without activity', () => {
    vi.useFakeTimers()
    const onIdle = vi.fn()
    const stop = startIdleWatch(5 * 60 * 1000, onIdle)
    vi.advanceTimersByTime(5 * 60 * 1000 - 1)
    expect(onIdle).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onIdle).toHaveBeenCalledTimes(1)
    stop()
  })

  it('resets the timer on user activity', () => {
    vi.useFakeTimers()
    const onIdle = vi.fn()
    const stop = startIdleWatch(5 * 60 * 1000, onIdle)
    vi.advanceTimersByTime(4 * 60 * 1000)
    window.dispatchEvent(new Event('keydown'))
    vi.advanceTimersByTime(4 * 60 * 1000)
    expect(onIdle).not.toHaveBeenCalled()
    vi.advanceTimersByTime(60 * 1000)
    expect(onIdle).toHaveBeenCalledTimes(1)
    stop()
  })
})
