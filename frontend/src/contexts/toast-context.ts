import { createContext } from 'react'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastInput {
  title: string
  description?: string
  variant?: ToastVariant
}

export interface ToastContextValue {
  showToast: (toast: ToastInput) => void
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined,
)
