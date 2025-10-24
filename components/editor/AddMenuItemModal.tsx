'use client'

import { useState } from 'react'
import { Button, Input, ImageUploader } from '@/components/ui'
import { MenuItem } from '@/types'
import { IngredientSelector } from './IngredientSelector'
import { getCurrency } from '@/lib/currencies'

interface AddMenuItemModalProps {
  categoryId: string
  categoryName: string
  onAdd: (categoryId: string, itemData: Partial<MenuItem>) => void
  onClose: () => void
  currency?: string
}

/**
 * AddMenuItemModal - Modal para agregar nuevo plato con imagen e ingredientes
 */
export function AddMenuItemModal({
  categoryId,
  categoryName,
  onAdd,
  onClose,
  currency = 'EUR',
}: AddMenuItemModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [ingredientIds, setIngredientIds] = useState<string[]>([])
  const [showIngredientSelector, setShowIngredientSelector] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currencyData = getCurrency(currency)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert('Por favor ingresa un nombre para el plato')
      return
    }

    const priceValue = parseFloat(price)
    if (isNaN(priceValue) || priceValue <= 0) {
      alert('Por favor ingresa un precio válido')
      return
    }

    setIsSubmitting(true)
    try {
      const itemData: Partial<MenuItem> = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: priceValue,
        image_url: imageUrl || undefined,
        ingredients: ingredientIds.length > 0 ? ingredientIds : undefined,
      }

      await onAdd(categoryId, itemData)
      onClose()
    } catch (error) {
      console.error('Error al agregar plato:', error)
      alert('Error al agregar el plato')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-ios-xl shadow-ios-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-ios-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-ios-gray-900">
                  Nuevo Plato
                </h2>
                <p className="text-sm text-ios-gray-600 mt-1">
                  Categoría: {categoryName}
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
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-ios-gray-900 mb-1">
                  Nombre del Plato *
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Paella Valenciana, Solomillo a la Parrilla"
                  className="w-full"
                  autoFocus
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-ios-gray-900 mb-1">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe los ingredientes y preparación..."
                  className="w-full px-4 py-2 border border-ios-gray-300 rounded-ios focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-ios-gray-900 mb-1">
                  Precio ({currencyData.symbol}) *
                </label>
                <Input
                  type="number"
                  step={currencyData.decimals === 0 ? '1' : '0.01'}
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={currencyData.decimals === 0 ? '1000' : '12.50'}
                  className="w-full"
                  required
                />
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-ios-gray-900">
                    Ingredientes
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowIngredientSelector(true)}
                  >
                    {ingredientIds.length > 0 ? (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Agregar
                      </span>
                    )}
                  </Button>
                </div>
                {ingredientIds.length > 0 ? (
                  <p className="text-sm text-ios-gray-600">
                    {ingredientIds.length} ingrediente(s) seleccionado(s)
                  </p>
                ) : (
                  <p className="text-sm text-ios-gray-500">
                    Ningún ingrediente seleccionado aún
                  </p>
                )}
              </div>

              {/* Image */}
              <ImageUploader
                value={imageUrl}
                onChange={setImageUrl}
                label="Imagen del Plato (Opcional)"
                placeholder="URL de la imagen o sube un archivo"
              />
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
              disabled={isSubmitting || !name.trim() || !price}
            >
              Crear Plato
            </Button>
          </div>
        </div>
      </div>

      {/* Ingredient Selector */}
      {showIngredientSelector && (
        <IngredientSelector
          selectedIngredientIds={ingredientIds}
          onChange={setIngredientIds}
          onClose={() => setShowIngredientSelector(false)}
        />
      )}
    </>
  )
}
