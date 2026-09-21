import { Link, useNavigate, useParams } from 'react-router-dom'
import { Countdown } from '../../components/attempt/Countdown'
import { Badge, Card, Spinner } from '../../components/ui/Feedback'
import { Button } from '../../components/ui/Button'
import { useAssessment } from '../../hooks/useAssessments'
import { useAttemptClock } from '../../hooks/useAttemptClock'
import { useQuestions } from '../../hooks/useQuestions'
import { useMySubmissions } from '../../hooks/useSubmissions'

function statusLabel(started: boolean, expired: boolean, submitted: boolean) {
  if (submitted) {
    return 'Enviado'
  }
  if (expired) {
    return 'Tiempo agotado'
  }
  if (started) {
    return 'En curso'
  }
  return 'No iniciado'
}

export function CandidateDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { assessment, loading, error } = useAssessment(id)
  const questions = useQuestions(id)
  const mine = useMySubmissions(id)
  const clock = useAttemptClock(id, assessment?.timeLimitMinutes ?? 0)
  const latest = mine.items[0]
  const maxFromQuestions = questions.items.reduce(
    (sum, question) => sum + question.testCases.reduce((inner, test) => inner + test.points, 0),
    0,
  )
  const maxScore = latest?.maxScore ?? maxFromQuestions
  const score = latest?.score ?? 0
  const submitted = Boolean(latest)
  const status = statusLabel(clock.started, clock.expired, submitted)

  if (loading || questions.loading || mine.loading) {
    return <Spinner />
  }
  if (error || questions.error || mine.error) {
    return <p className="error-text">{error ?? questions.error ?? mine.error}</p>
  }
  if (!assessment) {
    return <p className="muted">Assessment no encontrado.</p>
  }

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1>{assessment.name}</h1>
          <p className="muted">{assessment.description}</p>
        </div>
        <Badge tone={submitted ? 'ok' : clock.expired ? 'err' : clock.started ? 'warn' : 'default'}>{status}</Badge>
      </div>
      <div className="grid-cards">
        <Card>
          <Countdown label={clock.label} remainingMs={clock.remainingMs} started={clock.started} />
        </Card>
        <Card>
          <div className="stack">
            <span className="muted">Puntaje acumulado</span>
            <strong className="countdown__value">
              {score} / {maxScore || 0}
            </strong>
            <span className="muted">{submitted ? 'Último envío calificado' : 'Aún no hay envío'}</span>
          </div>
        </Card>
        <Card>
          <div className="stack">
            <span className="muted">Preguntas</span>
            <strong className="countdown__value">{questions.items.length}</strong>
            <span className="muted">Lenguaje sugerido: {assessment.language}</span>
          </div>
        </Card>
      </div>
      <Card>
        <div className="stack">
          <h2>Preguntas</h2>
          {questions.items.length === 0 ? <p className="muted">Esta evaluación no tiene preguntas.</p> : null}
          {questions.items.map((question) => (
            <article key={question.id} className="stack">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h3>{question.title}</h3>
                <Badge>{question.language}</Badge>
              </div>
              <p className="muted">{question.description}</p>
              <p className="muted">
                {question.testCases.length} casos · {question.testCases.reduce((sum, test) => sum + test.points, 0)} pts
              </p>
            </article>
          ))}
        </div>
      </Card>
      <div className="row">
        <Button
          disabled={questions.items.length === 0}
          onClick={() => {
            clock.start()
            navigate(`/candidate/assessments/${assessment.id}/attempt`)
          }}
        >
          {clock.expired ? 'Revisar envío' : clock.started ? 'Continuar' : 'Comenzar evaluación'}
        </Button>
        {latest ? (
          <Link to={`/candidate/results/${latest.id}`} state={{ submission: latest }}>
            <Button variant="ghost">Ver último resultado</Button>
          </Link>
        ) : null}
        <Link to="/candidate/assessments">
          <Button variant="ghost">Volver al catálogo</Button>
        </Link>
      </div>
    </div>
  )
}
