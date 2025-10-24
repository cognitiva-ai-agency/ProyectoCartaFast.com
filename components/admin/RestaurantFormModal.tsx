'use client'

import { useState } from 'react'

interface RestaurantFormModalProps {
  onClose: () => void
  onSubmit: (data: {
    name: string
    slug: string
    password: string
  }) => Promise<void>
}

export default function RestaurantFormModal({
  onClose,
  onSubmit,
}: RestaurantFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    // Validar slug
    if (!formData.slug.trim()) {
      newErrors.slug = 'El slug es requerido'
    } else if (formData.slug === 'restoranmaestroadmin') {
      newErrors.slug = 'Este slug está reservado para el administrador'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'El slug solo puede contener letras minúsculas, números y guiones'
    }

    // Validar contraseña
    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      // Si llega aquí, fue exitoso
      onClose()
    } catch (error: any) {
      setApiError(error.message || 'Error al crear el restaurante')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo al editar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Convertir slug a minúsculas automáticamente
  const handleSlugChange = (value: string) => {
    const slug = value.toLowerCase().replace(/\s+/g, '-')
    handleInputChange('slug', slug)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-ios-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-ios-blue to-ios-blue/80 px-6 py-4 rounded-t-ios-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Nuevo Restaurante
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error general de API */}
          {apiError && (
            <div className="bg-ios-red/10 border border-ios-red/20 rounded-ios p-3 text-ios-red text-sm">
              {apiError}
            </div>
          )}

          {/* Nombre del Restaurante */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ios-gray-700 mb-2">
              Nombre del Restaurante *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 rounded-ios border ${
                errors.name
                  ? 'border-ios-red focus:ring-ios-red'
                  : 'border-ios-gray-300 focus:ring-ios-blue'
              } focus:outline-none focus:ring-2 transition-all`}
              placeholder="Ej: La Buena Mesa"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-ios-red">{errors.name}</p>
            )}
          </div>

          {/* Slug (URL) */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-ios-gray-700 mb-2">
              Slug (URL) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-gray-500 font-mono">
                /
              </span>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={`w-full pl-8 pr-4 py-3 rounded-ios border ${
                  errors.slug
                    ? 'border-ios-red focus:ring-ios-red'
                    : 'border-ios-gray-300 focus:ring-ios-blue'
                } focus:outline-none focus:ring-2 transition-all font-mono`}
                placeholder="la-buena-mesa"
                disabled={isSubmitting}
              />
            </div>
            {errors.slug && (
              <p className="mt-1 text-sm text-ios-red">{errors.slug}</p>
            )}
            <p className="mt-1 text-xs text-ios-gray-500">
              Solo letras minúsculas, números y guiones. Se usará en la URL pública.
            </p>
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ios-gray-700 mb-2">
              Contraseña *
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full px-4 py-3 rounded-ios border ${
                errors.password
                  ? 'border-ios-red focus:ring-ios-red'
                  : 'border-ios-gray-300 focus:ring-ios-blue'
              } focus:outline-none focus:ring-2 transition-all`}
              placeholder="Mínimo 6 caracteres"
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-ios-red">{errors.password}</p>
            )}
          </div>

          {/* Estado por defecto */}
          <div className="bg-ios-gray-50 rounded-ios p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-ios-green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-ios-gray-700">
                  El restaurante se creará con estado <strong>Activo</strong>
                </p>
                <p className="text-xs text-ios-gray-500">
                  Podrás cambiarlo después desde la tabla
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-ios border border-ios-gray-300 text-ios-gray-700 font-medium hover:bg-ios-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-ios bg-ios-blue text-white font-medium hover:bg-ios-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creando...
                </>
              ) : (
                <>
                  Crear Restaurante
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
