'use client'

import { useState } from 'react'
import { Button, Input, ImageUploader } from '@/components/ui'

interface AddCategoryModalProps {
  onAdd: (name: string, description: string, imageUrl: string) => void
  onClose: () => void
}

/**
 * AddCategoryModal - Modal para agregar nueva categoría con imagen
 */
export function AddCategoryModal({ onAdd, onClose }: AddCategoryModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert('Por favor ingresa un nombre para la categoría')
      return
    }

    setIsSubmitting(true)
    try {
      await onAdd(name.trim(), description.trim(), imageUrl)
      onClose()
    } catch (error) {
      console.error('Error al agregar categoría:', error)
      alert('Error al agregar la categoría')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-ios-xl shadow-ios-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ios-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-ios-gray-900">
              Nueva Categoría
            </h2>
            <button
              onClick={onClose}
              className="text-ios-gray-400 hover:text-ios-gray-600 transition-ios"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-ios-gray-900 mb-1">
                Nombre de la Categoría *
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Entrantes, Platos Principales, Postres"
                className="w-full"
                autoFocus
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-ios-gray-900 mb-1">
                Descripción (Opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descripción de la categoría..."
                className="w-full px-4 py-2 border border-ios-gray-300 rounded-ios focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Image */}
            <ImageUploader
              value={imageUrl}
              onChange={setImageUrl}
              label="Imagen de la Categoría (Opcional)"
              placeholder="URL de la imagen o sube un archivo"
            />

            {/* Helper Text */}
            <div className="bg-ios-blue/5 rounded-ios-lg p-4 border border-ios-blue/20">
              <p className="text-xs text-ios-gray-700 flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
                <span>
                  <strong>Consejo:</strong> Las categorías organizan tu menú.
                  Puedes agregar una imagen representativa para cada sección.
                </span>
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-ios-gray-200 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting || !name.trim()}
          >
            Crear Categoría
          </Button>
        </div>
      </div>
    </div>
  )
}
