import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

type FieldProps = {
  label: string
  id: string
}

export function Input({ label, id, ...props }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field__label">{label}</span>
      <input className="field__control" id={id} {...props} />
    </label>
  )
}

export function TextArea({ label, id, ...props }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field__label">{label}</span>
      <textarea className="field__control" id={id} {...props} />
    </label>
  )
}

export function Select({
  label,
  id,
  children,
  ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field__label">{label}</span>
      <select className="field__control" id={id} {...props}>
        {children}
      </select>
    </label>
  )
}
