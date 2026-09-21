import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Countdown } from '../../components/attempt/Countdown'
import { CodeEditor } from '../../components/editor/CodeEditor'
import { ConsoleOutput } from '../../components/console/ConsoleOutput'
import { Button } from '../../components/ui/Button'
import { Card, Spinner } from '../../components/ui/Feedback'
import { useAssessment } from '../../hooks/useAssessments'
import { useAttempt } from '../../hooks/useAttempt'
import { useAttemptClock } from '../../hooks/useAttemptClock'
import { useQuestions } from '../../hooks/useQuestions'
import type { ProgrammingLanguage } from '../../types/models'

export function CandidateAttemptPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { assessment, loading, error } = useAssessment(id)
  const questions = useQuestions(id)
  const current = questions.items[0]
  const [source, setSource] = useState('')
  const [language, setLanguage] = useState<ProgrammingLanguage | ''>('')
  const attempt = useAttempt()
  const clock = useAttemptClock(id, assessment?.timeLimitMinutes ?? 0, { autostart: true })
  const autoSubmitted = useRef(false)

  useEffect(() => {
    if (current?.starterCode) {
      setSource(current.starterCode)
    }
    if (current?.language) {
      setLanguage(current.language)
    }
  }, [current?.starterCode, current?.language])

  const submitCurrent = useCallback(async () => {
    if (!assessment || !current || !language) {
      return
    }
    const submission = await attempt.submit({
      assessmentId: assessment.id,
      timeSpentSeconds: Math.ceil(clock.elapsedMs / 1000),
      answers: [{ questionId: current.id, source, language }],
    })
    if (submission) {
      navigate(`/candidate/results/${submission.id}`, { state: { submission } })
    }
  }, [assessment, attempt, clock.elapsedMs, current, language, navigate, source])

  useEffect(() => {
    if (!clock.expired || autoSubmitted.current || !assessment || !current || !language) {
      return
    }
    autoSubmitted.current = true
    void submitCurrent()
  }, [assessment, clock.expired, current, language, submitCurrent])

  if (loading || questions.loading) {
    return <Spinner />
  }
  if (error || questions.error) {
    return <p className="error-text">{error ?? questions.error}</p>
  }
  if (!assessment || !current || !language) {
    return <p className="muted">Este assessment no tiene preguntas.</p>
  }

  const locked = clock.expired || attempt.submitting

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>{assessment.name}</h1>
          <p className="muted">
            {current.title} — {current.description}
          </p>
        </div>
        <Countdown label={clock.label} remainingMs={clock.remainingMs} started={clock.started} />
      </div>
      {clock.expired ? <p className="error-text">El tiempo se agotó. Se envía la respuesta actual.</p> : null}
      <Card>
        <CodeEditor
          language={language}
          value={source}
          disabled={locked}
          onLanguageChange={setLanguage}
          onChange={setSource}
        />
      </Card>
      <div className="row">
        <Button
          variant="ghost"
          disabled={attempt.running || locked}
          onClick={() =>
            void attempt.run({
              source,
              language,
              tests: current.testCases,
            })
          }
        >
          Ejecutar
        </Button>
        <Button disabled={locked} onClick={() => void submitCurrent()}>
          Enviar y calificar
        </Button>
        <Link to={`/candidate/assessments/${assessment.id}`}>
          <Button variant="ghost">Volver al detalle</Button>
        </Link>
      </div>
      {attempt.error ? <p className="error-text">{attempt.error}</p> : null}
      <ConsoleOutput result={attempt.lastRun} />
    </div>
  )
}
