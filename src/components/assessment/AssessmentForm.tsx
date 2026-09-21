import { useState } from 'react'
import { ProgrammingLanguage, type AssessmentPayload } from '../../types/models'
import { Button } from '../ui/Button'
import { Input, Select, TextArea } from '../ui/Field'

type AssessmentFormProps = {
  initial?: AssessmentPayload
  submitLabel: string
  onSubmit: (payload: AssessmentPayload) => Promise<unknown>
}

const empty: AssessmentPayload = {
  name: '',
  description: '',
  timeLimitMinutes: 30,
  language: ProgrammingLanguage.JavaScript,
}

export function AssessmentForm({ initial = empty, submitLabel, onSubmit }: AssessmentFormProps) {
  const [form, setForm] = useState<AssessmentPayload>(initial)
  const [busy, setBusy] = useState(false)

  return (
    <form
      className="stack"
      onSubmit={(event) => {
        event.preventDefault()
        setBusy(true)
        void onSubmit(form).finally(() => setBusy(false))
      }}
    >
      <Input
        id="name"
        label="Nombre"
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        required
      />
      <TextArea
        id="description"
        label="Descripción"
        value={form.description}
        onChange={(event) => setForm({ ...form, description: event.target.value })}
        required
      />
      <Input
        id="time"
        label="Tiempo límite (min)"
        type="number"
        min={5}
        value={form.timeLimitMinutes}
        onChange={(event) => setForm({ ...form, timeLimitMinutes: Number(event.target.value) })}
        required
      />
      <Select
        id="language"
        label="Lenguaje"
        value={form.language}
        onChange={(event) => setForm({ ...form, language: event.target.value as AssessmentPayload['language'] })}
      >
        {Object.values(ProgrammingLanguage).map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
      </Select>
      <Button type="submit" disabled={busy}>
        {submitLabel}
      </Button>
    </form>
  )
}
