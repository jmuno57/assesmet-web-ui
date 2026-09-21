import { useCallback, useEffect, useState } from 'react'
import { readErrorMessage } from '../lib/http'
import { submissionService } from '../services/api'
import type { Submission } from '../types/models'

export function useSubmissions(assessmentId?: string) {
  const [items, setItems] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = assessmentId
        ? await submissionService.listByAssessment(assessmentId)
        : await submissionService.list()
      setItems(data)
    } catch (cause) {
      setError(readErrorMessage(cause, 'No se pudieron cargar los resultados'))
    } finally {
      setLoading(false)
    }
  }, [assessmentId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { items, loading, error, refresh }
}

export function useMySubmissions(assessmentId?: string) {
  const [items, setItems] = useState<Submission[]>([])
  const [loading, setLoading] = useState(Boolean(assessmentId))
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!assessmentId) {
      return
    }
    setLoading(true)
    setError(null)
    try {
      setItems(await submissionService.listMine(assessmentId))
    } catch (cause) {
      setError(readErrorMessage(cause, 'No se pudieron cargar tus envíos'))
    } finally {
      setLoading(false)
    }
  }, [assessmentId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { items, loading, error, refresh }
}
