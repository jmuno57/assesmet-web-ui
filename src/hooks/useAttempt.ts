import { useCallback, useState } from 'react'
import { readErrorMessage } from '../lib/http'
import { executionService, submissionService } from '../services/api'
import type { ExecutionPayload, ExecutionResult, SubmitPayload, Submission } from '../types/models'

export function useAttempt() {
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [lastRun, setLastRun] = useState<ExecutionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (payload: ExecutionPayload) => {
    setRunning(true)
    setError(null)
    try {
      const result = await executionService.run(payload)
      setLastRun(result)
      return result
    } catch (cause) {
      const message = readErrorMessage(cause, 'No se pudo ejecutar el código')
      setError(message)
      return undefined
    } finally {
      setRunning(false)
    }
  }, [])

  const submit = useCallback(async (payload: SubmitPayload) => {
    setSubmitting(true)
    setError(null)
    try {
      const submission: Submission = await submissionService.submit(payload)
      return submission
    } catch (cause) {
      const message = readErrorMessage(cause, 'No se pudo calificar el intento')
      setError(message)
      return undefined
    } finally {
      setSubmitting(false)
    }
  }, [])

  return { running, submitting, lastRun, error, run, submit }
}
