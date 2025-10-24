'use client'

import { useState, useRef, useId, useEffect } from 'react'
import { Button } from './Button'
import { Input } from './Input'

interface ImageUploaderProps {
  value?: string
  onChange: (imageUrl: string) => void
  label?: string
  placeholder?: string
}

/**
 * ImageUploader - Componente para subir imágenes
 * Soporta:
 * 1. URL de imagen externa
 * 2. Subir imagen desde dispositivo (convertida a Base64)
 */
export function ImageUploader({
  value,
  onChange,
  label = 'Imagen',
  placeholder = 'URL de la imagen o sube un archivo'
}: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState(value || '')
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('upload')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uniqueId = useId()

  // Sincronizar estado interno con prop value
  useEffect(() => {
    setImageUrl(value || '')
  }, [value])

  const handleUrlChange = (url: string) => {
    setImageUrl(url)
    onChange(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP)')
      return
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB')
      return
    }

    // Convertir a Base64
    setIsUploading(true)
    const reader = new FileReader()

    reader.onloadstart = () => {
      setIsUploading(true)
    }

    reader.onloadend = () => {
      const base64String = reader.result as string
      setImageUrl(base64String)
      onChange(base64String)
      setIsUploading(false)
      setError(null)
    }

    reader.onerror = () => {
      setError('Error al leer el archivo. Intenta nuevamente.')
      setIsUploading(false)
    }

    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageUrl('')
    onChange('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-ios-gray-900">{label}</label>

      {/* Error Message */}
      {error && (
        <div className="bg-ios-red/10 border border-ios-red/30 rounded-ios p-3">
          <p className="text-sm text-ios-red">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-ios-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`px-4 py-2 text-sm font-medium transition-ios border-b-2 flex items-center gap-2 ${
            activeTab === 'url'
              ? 'border-ios-blue text-ios-blue'
              : 'border-transparent text-ios-gray-600 hover:text-ios-gray-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          URL
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 text-sm font-medium transition-ios border-b-2 flex items-center gap-2 ${
            activeTab === 'upload'
              ? 'border-ios-blue text-ios-blue'
              : 'border-transparent text-ios-gray-600 hover:text-ios-gray-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Subir
        </button>
      </div>

      {/* URL Tab */}
      {activeTab === 'url' && (
        <div>
          <Input
            value={imageUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder={placeholder}
            className="w-full"
          />
          <p className="text-xs text-ios-gray-500 mt-1">
            Pega la URL de una imagen (ej: https://ejemplo.com/imagen.jpg)
          </p>
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileUpload}
            className="hidden"
            id={`image-upload-${uniqueId}`}
            disabled={isUploading}
          />
          <label
            htmlFor={`image-upload-${uniqueId}`}
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-ios-lg transition-ios ${
              isUploading
                ? 'border-ios-blue bg-ios-blue/5 cursor-wait'
                : 'border-ios-gray-300 cursor-pointer hover:border-ios-blue hover:bg-ios-blue/5'
            }`}
          >
            <div className="text-center">
              {isUploading ? (
                <>
                  <div className="mb-2">
                    <svg className="w-10 h-10 mx-auto text-ios-blue animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-ios-blue">
                    Cargando imagen...
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-2">
                    <svg className="w-10 h-10 mx-auto text-ios-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-ios-gray-700">
                    Haz clic para seleccionar una imagen
                  </p>
                  <p className="text-xs text-ios-gray-500 mt-1">
                    PNG, JPG, WEBP (máx. 5MB)
                  </p>
                </>
              )}
            </div>
          </label>
        </div>
      )}

      {/* Preview */}
      {imageUrl && !isUploading && (
        <div className="relative">
          <div className="rounded-ios-lg overflow-hidden border-2 border-ios-gray-200 w-full aspect-square">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => {
                setError('Error al cargar la imagen. Verifica la URL o intenta con otra imagen.')
                handleRemoveImage()
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-ios-red text-white rounded-full p-2 shadow-ios hover:bg-ios-red/90 transition-ios"
            title="Eliminar imagen"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
