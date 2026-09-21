import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger'
  children: ReactNode
}

export function Button({ variant = 'primary', children, type = 'button', ...props }: ButtonProps) {
  return (
    <button className={`btn btn--${variant}`} type={type} {...props}>
      {children}
    </button>
  )
}
