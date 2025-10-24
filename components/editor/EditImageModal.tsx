'use client'

import { useState, useEffect } from 'react'
import { Button, ImageUploader } from '@/components/ui'

interface EditImageModalProps {
  currentImageUrl?: string
  itemName: string
  onSave: (imageUrl: string) => void
  onClose: () => void
}

/**
 * EditImageModal - Modal para editar la imagen de un plato
 */
export function EditImageModal({
  currentImageUrl,
  itemName,
  onSave,
  onClose,
}: EditImageModalProps) {
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update imageUrl when currentImageUrl changes
  useEffect(() => {
    // Store the clean URL without timestamp
    setImageUrl(currentImageUrl || '')
  }, [currentImageUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Remove timestamp if exists (it was only for display)
    const cleanImageUrl = imageUrl.split('?')[0]

    setIsSubmitting(true)
    try {
      await onSave(cleanImageUrl)
      onClose()
    } catch (error) {
      console.error('Error al guardar imagen:', error)
      alert('Error al guardar la imagen')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (newImageUrl: string) => {
    // Update with the new image URL (base64 or URL)
    setImageUrl(newImageUrl)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-ios-xl shadow-ios-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ios-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-ios-gray-900">
                Editar Imagen
              </h2>
              <p className="text-sm text-ios-gray-600 mt-1">
                {itemName}
              </p>
            </div>
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
          <div className="p-6">
            <div className="space-y-4">
              {/* Current image preview */}
              {currentImageUrl && (
                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                    Imagen Actual
                  </label>
                  <div className="relative w-full max-w-md h-48 rounded-lg overflow-hidden border-2 border-ios-gray-200">
                    <img
                      src={`${currentImageUrl}?t=${Date.now()}`}
                      alt={itemName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af"%3ESin imagen%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Image uploader */}
              <ImageUploader
                value={imageUrl}
                onChange={handleImageChange}
                label={currentImageUrl ? "Cambiar Imagen" : "Agregar Imagen"}
                placeholder="Sube una nueva imagen o pega una URL"
              />
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
            disabled={isSubmitting}
          >
            Guardar Imagen
          </Button>
        </div>
      </div>
    </div>
  )
}
