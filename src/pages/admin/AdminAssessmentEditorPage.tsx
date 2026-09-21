import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AssessmentForm } from '../../components/assessment/AssessmentForm'
import { QuestionForm, QuestionList } from '../../components/question/QuestionBlocks'
import { Card, Spinner } from '../../components/ui/Feedback'
import { useAssessment } from '../../hooks/useAssessments'
import { useQuestions } from '../../hooks/useQuestions'
import { ProgrammingLanguage, type AssessmentPayload, type Question } from '../../types/models'
import { assessmentService } from '../../services/api'

export function AdminAssessmentEditorPage() {
  const { id } = useParams()
  const isNew = id === 'new' || !id
  const navigate = useNavigate()
  const { assessment, loading, error, update } = useAssessment(isNew ? undefined : id)
  const questions = useQuestions(isNew ? undefined : id)
  const [editing, setEditing] = useState<Question | null>(null)

  const createNew = async (payload: AssessmentPayload) => {
    const created = await assessmentService.create(payload)
    navigate(`/admin/assessments/${created.id}`, { replace: true })
  }

  if (!isNew && loading) {
    return <Spinner />
  }
  if (!isNew && error) {
    return <p className="error-text">{error}</p>
  }

  return (
    <div className="stack">
      <h1>{isNew ? 'Nuevo assessment' : assessment?.name}</h1>
      <Card>
        <AssessmentForm
          initial={
            assessment
              ? {
                  name: assessment.name,
                  description: assessment.description,
                  timeLimitMinutes: assessment.timeLimitMinutes,
                  language: assessment.language,
                }
              : {
                  name: '',
                  description: '',
                  timeLimitMinutes: 30,
                  language: ProgrammingLanguage.JavaScript,
                }
          }
          submitLabel={isNew ? 'Crear' : 'Guardar'}
          onSubmit={isNew ? createNew : update}
        />
      </Card>
      {!isNew ? (
        <>
          <h2>Preguntas</h2>
          {questions.error ? <p className="error-text">{questions.error}</p> : null}
          {questions.loading ? (
            <Spinner />
          ) : (
            <QuestionList
              items={questions.items}
              onEdit={setEditing}
              onDelete={(question) => {
                if (window.confirm(`¿Eliminar la pregunta "${question.title}"?`)) {
                  void questions.remove(question.id).then(() => {
                    if (editing?.id === question.id) {
                      setEditing(null)
                    }
                  })
                }
              }}
            />
          )}
          <Card>
            <h3>{editing ? 'Editar pregunta' : 'Agregar pregunta'}</h3>
            <QuestionForm
              key={editing?.id ?? 'new-question'}
              initial={
                editing
                  ? {
                      title: editing.title,
                      description: editing.description,
                      language: editing.language,
                      starterCode: editing.starterCode,
                      testCases: editing.testCases.map((testCase) => ({
                        input: testCase.input,
                        expected: testCase.expected,
                        points: testCase.points,
                      })),
                    }
                  : undefined
              }
              submitLabel={editing ? 'Guardar pregunta' : 'Agregar pregunta'}
              onCancel={editing ? () => setEditing(null) : undefined}
              onSubmit={async (payload) => {
                if (editing) {
                  await questions.update(editing.id, payload)
                  setEditing(null)
                  return
                }
                await questions.create(payload)
              }}
            />
          </Card>
        </>
      ) : null}
    </div>
  )
}
