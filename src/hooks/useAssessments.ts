import { useCallback, useEffect, useState } from 'react'
import { readErrorMessage } from '../lib/http'
import { assessmentService } from '../services/api'
import type { Assessment, AssessmentPayload } from '../types/models'

export function useAssessments() {
  const [items, setItems] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await assessmentService.list()
      setItems(data)
    } catch (cause) {
      setError(readErrorMessage(cause, 'No se pudieron cargar los assessments'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(async (payload: AssessmentPayload) => {
    const created = await assessmentService.create(payload)
    setItems((current) => [created, ...current])
    return created
  }, [])

  return { items, loading, error, refresh, create }
}

export function useAssessment(id: string | undefined) {
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!id) {
      return
    }
    setLoading(true)
    setError(null)
    try {
      setAssessment(await assessmentService.getById(id))
    } catch (cause) {
      setError(readErrorMessage(cause, 'No se pudo cargar el assessment'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const update = useCallback(
    async (payload: AssessmentPayload) => {
      if (!id) {
        throw new Error('Assessment sin id')
      }
      const updated = await assessmentService.update(id, payload)
      setAssessment(updated)
      return updated
    },
    [id],
  )

  return { assessment, loading, error, refresh, update }
}
