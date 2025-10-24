'use client'

import { Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  icon?: string
}

/**
 * Professional Confirmation Dialog Component
 * iOS-style modal for confirmations instead of browser alerts
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  icon = '⚠️'
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const variantColors = {
    danger: {
      bg: 'bg-ios-red/10',
      border: 'border-ios-red/20',
      text: 'text-ios-red',
      button: 'danger' as const
    },
    warning: {
      bg: 'bg-ios-orange/10',
      border: 'border-ios-orange/20',
      text: 'text-ios-orange',
      button: 'warning' as const
    },
    info: {
      bg: 'bg-ios-blue/10',
      border: 'border-ios-blue/20',
      text: 'text-ios-blue',
      button: 'primary' as const
    }
  }

  const colors = variantColors[variant]

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="relative w-full max-w-md bg-white rounded-ios-xl shadow-ios-xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Icon and Title */}
                <div className={`flex flex-col items-center px-6 pt-6 pb-4 border-2 ${colors.border} ${colors.bg} rounded-t-ios-xl`}>
                  <div className="text-5xl mb-3">{icon}</div>
                  <h2 className={`text-xl font-semibold ${colors.text} text-center`}>
                    {title}
                  </h2>
                </div>

                {/* Message */}
                <div className="px-6 py-4">
                  <p className="text-center text-ios-gray-700 leading-relaxed">
                    {message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-6 pb-6">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="flex-1"
                  >
                    {cancelText}
                  </Button>
                  <Button
                    variant={colors.button}
                    onClick={handleConfirm}
                    className="flex-1"
                  >
                    {confirmText}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  )
}
