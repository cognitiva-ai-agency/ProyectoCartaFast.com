'use client'

import { useRef, useEffect, useState, KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

export interface ContentEditableProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
  placeholder?: string
  className?: string
  multiline?: boolean
  maxLength?: number
}

/**
 * ContentEditable component for inline editing
 * Allows editing text directly in the UI like Notion/Linear
 */
export function ContentEditable({
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder = 'Escribe aquí...',
  className,
  multiline = false,
  maxLength,
}: ContentEditableProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Update content when value changes externally (only when not focused)
  useEffect(() => {
    if (!isFocused && elementRef.current && elementRef.current.textContent !== value) {
      elementRef.current.textContent = value
    }
  }, [value, isFocused])

  const handleInput = () => {
    const newValue = elementRef.current?.textContent || ''

    if (maxLength && newValue.length > maxLength) {
      elementRef.current!.textContent = newValue.slice(0, maxLength)
      return
    }

    onChange(newValue)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault()

      // IMPORTANT: Trigger onChange with current value before blur
      // This ensures the value is saved when user presses Enter
      const currentValue = elementRef.current?.textContent || ''
      onChange(currentValue)

      // Blur after onChange to ensure the change is processed
      elementRef.current?.blur()
    }

    // Prevent newlines if not multiline
    if (!multiline && (e.key === 'Enter' || e.key === 'Return')) {
      e.preventDefault()
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    onFocus?.()
  }

  const handleBlur = () => {
    setIsFocused(false)
    onBlur?.()
  }

  const showPlaceholder = !value && !isFocused

  return (
    <div className="relative">
      <div
        ref={elementRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          'outline-none transition-ios',
          isFocused && 'ring-2 ring-ios-blue rounded-md px-1 -mx-1',
          showPlaceholder && 'empty:before:content-[attr(data-placeholder)] empty:before:text-ios-gray-400',
          className
        )}
        data-placeholder={placeholder}
      />
    </div>
  )
}
