import { useCallback, useEffect, useState } from 'react'
import { readErrorMessage } from '../lib/http'
import { questionService } from '../services/api'
import type { Question, QuestionPayload } from '../types/models'

export function useQuestions(assessmentId: string | undefined) {
  const [items, setItems] = useState<Question[]>([])
  const [loading, setLoading] = useState(Boolean(assessmentId))
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!assessmentId) {
      return
    }
    setLoading(true)
    setError(null)
    try {
      setItems(await questionService.listByAssessment(assessmentId))
    } catch (cause) {
      setError(readErrorMessage(cause, 'No se pudieron cargar las preguntas'))
    } finally {
      setLoading(false)
    }
  }, [assessmentId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(
    async (payload: QuestionPayload) => {
      if (!assessmentId) {
        throw new Error('Assessment sin id')
      }
      const created = await questionService.create(assessmentId, payload)
      setItems((current) => [...current, created])
      return created
    },
    [assessmentId],
  )

  const update = useCallback(
    async (questionId: string, payload: QuestionPayload) => {
      if (!assessmentId) {
        throw new Error('Assessment sin id')
      }
      const updated = await questionService.update(assessmentId, questionId, payload)
      setItems((current) => current.map((item) => (item.id === questionId ? updated : item)))
      return updated
    },
    [assessmentId],
  )

  const remove = useCallback(
    async (questionId: string) => {
      if (!assessmentId) {
        throw new Error('Assessment sin id')
      }
      await questionService.remove(assessmentId, questionId)
      setItems((current) => current.filter((item) => item.id !== questionId))
    },
    [assessmentId],
  )

  return { items, loading, error, refresh, create, update, remove }
}
