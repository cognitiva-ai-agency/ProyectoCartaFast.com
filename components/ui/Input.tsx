import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

/**
 * iOS-style Input component
 * Text input with label, error states, and helper text
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-ios-gray-700 mb-2"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            'w-full px-4 py-3 rounded-ios bg-white border border-ios-gray-300',
            'text-ios-gray-900 placeholder:text-ios-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent',
            'disabled:bg-ios-gray-100 disabled:cursor-not-allowed',
            'transition-ios',
            error && 'border-ios-red focus:ring-ios-red',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />

        {error && (
          <p id={`${inputId}-error`} className="mt-2 text-sm text-ios-red">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-2 text-sm text-ios-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
