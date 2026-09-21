import { ProgrammingLanguage, type ProgrammingLanguage as Language } from '../../types/models'
import { Select } from '../ui/Field'

type CodeEditorProps = {
  language: Language
  value: string
  disabled?: boolean
  onLanguageChange?: (language: Language) => void
  onChange: (value: string) => void
}

export function CodeEditor({ language, value, disabled, onLanguageChange, onChange }: CodeEditorProps) {
  return (
    <div className="editor">
      <div className="editor__meta">
        <span>Editor de código</span>
        {onLanguageChange ? (
          <Select
            id="editor-lang"
            label="Lenguaje"
            value={language}
            disabled={disabled}
            onChange={(event) => onLanguageChange(event.target.value as Language)}
          >
            {Object.values(ProgrammingLanguage).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        ) : (
          <span>{language}</span>
        )}
      </div>
      <textarea
        className="field__control editor__area"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        disabled={disabled}
      />
    </div>
  )
}
