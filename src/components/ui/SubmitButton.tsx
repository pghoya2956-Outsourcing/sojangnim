'use client'

import { useFormStatus } from 'react-dom'
import LoadingSpinner from './LoadingSpinner'

interface SubmitButtonProps {
  children: React.ReactNode
  loadingText?: string
  className?: string
}

export default function SubmitButton({
  children,
  loadingText = '처리 중...',
  className = '',
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        flex items-center justify-center gap-2
        transition-all duration-100
        active:scale-[0.98]
        disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100
        ${className}
      `}
    >
      {pending ? (
        <>
          <LoadingSpinner size="sm" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}
