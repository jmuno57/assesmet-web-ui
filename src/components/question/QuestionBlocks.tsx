import { useState } from 'react'
import { ProgrammingLanguage, type Question, type QuestionPayload } from '../../types/models'
import { Button } from '../ui/Button'
import { Input, Select, TextArea } from '../ui/Field'

type QuestionListProps = {
  items: Question[]
  onEdit: (question: Question) => void
  onDelete: (question: Question) => void
}

export function QuestionList({ items, onEdit, onDelete }: QuestionListProps) {
  if (items.length === 0) {
    return <p className="muted">Aún no hay preguntas.</p>
  }
  return (
    <div className="stack">
      {items.map((question) => (
        <article className="card stack" key={question.id}>
          <h3>{question.title}</h3>
          <p className="muted">{question.description}</p>
          <p className="muted">{question.testCases.length} casos de prueba</p>
          <div className="row">
            <Button type="button" onClick={() => onEdit(question)}>
              Editar
            </Button>
            <Button type="button" variant="danger" onClick={() => onDelete(question)}>
              Eliminar
            </Button>
          </div>
        </article>
      ))}
    </div>
  )
}

const emptyPayload = (): QuestionPayload => ({
  title: '',
  description: '',
  language: ProgrammingLanguage.JavaScript,
  starterCode: '',
  testCases: [{ input: '', expected: '', points: 50 }],
})

type QuestionFormProps = {
  initial?: QuestionPayload
  submitLabel?: string
  onSubmit: (payload: QuestionPayload) => Promise<unknown>
  onCancel?: () => void
}

export function QuestionForm({ initial, submitLabel = 'Agregar pregunta', onSubmit, onCancel }: QuestionFormProps) {
  const [form, setForm] = useState<QuestionPayload>(initial ?? emptyPayload())
  const [busy, setBusy] = useState(false)

  const setCase = (index: number, patch: Partial<QuestionPayload['testCases'][number]>) => {
    setForm({
      ...form,
      testCases: form.testCases.map((item, current) => (current === index ? { ...item, ...patch } : item)),
    })
  }

  return (
    <form
      className="stack"
      onSubmit={(event) => {
        event.preventDefault()
        setBusy(true)
        void onSubmit(form)
          .then(() => {
            if (!initial) {
              setForm(emptyPayload())
            }
          })
          .finally(() => setBusy(false))
      }}
    >
      <Input id="q-title" label="Título" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
      <TextArea
        id="q-desc"
        label="Descripción"
        value={form.description}
        onChange={(event) => setForm({ ...form, description: event.target.value })}
        required
      />
      <Select
        id="q-lang"
        label="Lenguaje"
        value={form.language}
        onChange={(event) => setForm({ ...form, language: event.target.value as QuestionPayload['language'] })}
      >
        {Object.values(ProgrammingLanguage).map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
      </Select>
      <TextArea
        id="q-starter"
        label="Código inicial"
        className="field__control editor__area"
        value={form.starterCode}
        onChange={(event) => setForm({ ...form, starterCode: event.target.value })}
      />
      {form.testCases.map((testCase, index) => (
        <div className="stack" key={`case-${index}`}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong>Caso {index + 1}</strong>
            {form.testCases.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setForm({ ...form, testCases: form.testCases.filter((_, current) => current !== index) })}
              >
                Quitar caso
              </Button>
            ) : null}
          </div>
          <Input
            id={`q-in-${index}`}
            label="Input del caso"
            value={testCase.input}
            onChange={(event) => setCase(index, { input: event.target.value })}
          />
          <Input
            id={`q-out-${index}`}
            label="Expected"
            value={testCase.expected}
            onChange={(event) => setCase(index, { expected: event.target.value })}
          />
          <Input
            id={`q-pts-${index}`}
            label="Puntos"
            type="number"
            min={1}
            value={testCase.points}
            onChange={(event) => setCase(index, { points: Number(event.target.value) })}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        onClick={() => setForm({ ...form, testCases: [...form.testCases, { input: '', expected: '', points: 50 }] })}
      >
        Agregar caso de prueba
      </Button>
      <div className="row">
        <Button type="submit" disabled={busy}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  )
}
