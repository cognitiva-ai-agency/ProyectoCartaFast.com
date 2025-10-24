import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

/**
 * iOS-style Badge component
 */
export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-ios'

  const variants = {
    default: 'bg-ios-gray-100 text-ios-gray-700',
    primary: 'bg-ios-blue/10 text-ios-blue',
    secondary: 'bg-ios-gray-200 text-ios-gray-600',
    success: 'bg-ios-green/10 text-ios-green',
    warning: 'bg-ios-orange/10 text-ios-orange',
    danger: 'bg-ios-red/10 text-ios-red',
    info: 'bg-ios-blue/10 text-ios-blue',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  return (
    <span
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
