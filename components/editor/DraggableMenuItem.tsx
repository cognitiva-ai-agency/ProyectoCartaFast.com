'use client'

import { useState, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MenuItem } from '@/types'
import { Button, Badge, ContentEditable, ConfirmDialog } from '@/components/ui'
import { cn } from '@/lib/utils'
import { getIngredientById, Ingredient } from '@/lib/ingredients'
import { IngredientSelector } from './IngredientSelector'
import { EditImageModal } from './EditImageModal'
import { getCurrency } from '@/lib/currencies'
import { useAuth } from '@/hooks/useAuth'

/**
 * Format price with thousands separator (Chilean/Spanish format)
 * Example: 9990 → "9.990"
 */
function formatPriceForDisplay(price: number, decimals: number): string {
  const fixed = price.toFixed(decimals)
  const [intPart, decPart] = fixed.split('.')

  // Add thousands separator (dot for Chilean format)
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return decimals > 0 ? `${formattedInt},${decPart}` : formattedInt
}

export interface DraggableMenuItemProps {
  item: MenuItem
  onUpdate: (itemId: string, updates: Partial<MenuItem>) => void
  onDelete: (itemId: string) => void
  currency?: string
}

/**
 * Draggable Menu Item component with inline editing
 */
export function DraggableMenuItem({
  item,
  onUpdate,
  onDelete,
  currency = 'EUR',
}: DraggableMenuItemProps) {
  const { session } = useAuth()
  const [showIngredientSelector, setShowIngredientSelector] = useState(false)
  const [showEditImageModal, setShowEditImageModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [isEditingDiscount, setIsEditingDiscount] = useState(false)
  const [isEditingFinalPrice, setIsEditingFinalPrice] = useState(false)
  const [customIngredients, setCustomIngredients] = useState<Ingredient[]>([])
  const [localPrice, setLocalPrice] = useState<string>(String(item.base_price || 0))
  const [localDiscount, setLocalDiscount] = useState<string>(String(item.discount_percentage || 0))
  const [localFinalPrice, setLocalFinalPrice] = useState<string>(
    String((item.base_price || 0) * (1 - (item.discount_percentage || 0) / 100))
  )

  // Sync local price with item.base_price when it changes externally (from server)
  // Note: We don't include isEditingPrice in dependencies to avoid resetting
  // the value immediately after blur, before the server response comes back
  useEffect(() => {
    if (!isEditingPrice) {
      setLocalPrice(String(item.base_price || 0))
    }
  }, [item.base_price])

  // Sync local discount with item.discount_percentage
  useEffect(() => {
    if (!isEditingDiscount) {
      setLocalDiscount(String(item.discount_percentage || 0))
    }
  }, [item.discount_percentage])

  // Sync local final price when base_price or discount_percentage changes
  useEffect(() => {
    if (!isEditingFinalPrice) {
      const calculatedFinalPrice = (item.base_price || 0) * (1 - (item.discount_percentage || 0) / 100)
      setLocalFinalPrice(String(calculatedFinalPrice))
    }
  }, [item.base_price, item.discount_percentage])

  // Load custom ingredients
  useEffect(() => {
    if (session?.slug) {
      loadCustomIngredients()
    }
  }, [session?.slug])

  const loadCustomIngredients = async () => {
    try {
      const res = await fetch(`/api/restaurants/${session?.slug}/ingredients`, {
        cache: 'no-store'
      })
      if (res.ok) {
        const data = await res.json()
        setCustomIngredients(data.ingredients || [])
      }
    } catch (err) {
      console.error('Error loading custom ingredients:', err)
    }
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: 'item',
      item,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleNameChange = (newName: string) => {
    onUpdate(item.id, { name: newName })
  }

  const handleDescriptionChange = (newDescription: string) => {
    onUpdate(item.id, { description: newDescription })
  }

  const handlePriceChange = (newPrice: string) => {
    // While editing, just update local state
    setLocalPrice(newPrice)
  }

  const handlePriceBlur = () => {
    setIsEditingPrice(false)

    // Parse and save the final price
    const price = parseFloat(localPrice.replace(/[^0-9.]/g, ''))
    console.log('💰 DraggableMenuItem - Saving price:', {
      localPrice,
      parsed: price,
      currentPrice: item.base_price || 0,
      itemId: item.id,
      willUpdate: !isNaN(price) && price !== item.base_price
    })

    if (!isNaN(price) && price !== item.base_price) {
      console.log('✅ Calling onUpdate with base_price:', price)
      // Update BOTH price and base_price to ensure compatibility with API
      // API prioritizes 'price' over 'base_price' (line 184 of items route)
      onUpdate(item.id, { base_price: price, price: price })
    } else if (isNaN(price)) {
      // Reset to original if invalid
      console.log('❌ Invalid price, resetting to:', item.base_price)
      setLocalPrice(String(item.base_price || 0))
    } else {
      console.log('⏭️ Price unchanged, skipping update')
    }
  }

  const handlePriceFocus = () => {
    setIsEditingPrice(true)
    setLocalPrice(String(item.base_price || 0))
  }

  const handleDiscountChange = (newDiscount: string) => {
    // While editing, update local state and calculate final price
    setLocalDiscount(newDiscount)

    const discount = parseFloat(newDiscount.replace(/[^0-9.]/g, ''))
    if (!isNaN(discount) && discount >= 0 && discount <= 100) {
      const calculatedFinalPrice = (item.base_price || 0) * (1 - discount / 100)
      setLocalFinalPrice(String(calculatedFinalPrice))
    }
  }

  const handleDiscountBlur = () => {
    setIsEditingDiscount(false)

    // Parse and save the discount percentage
    const discount = parseFloat(localDiscount.replace(/[^0-9.]/g, ''))

    if (!isNaN(discount) && discount >= 0 && discount <= 100 && discount !== item.discount_percentage) {
      onUpdate(item.id, { discount_percentage: discount })
    } else if (isNaN(discount) || discount < 0 || discount > 100) {
      // Reset to original if invalid
      setLocalDiscount(String(item.discount_percentage || 0))
      const calculatedFinalPrice = (item.base_price || 0) * (1 - (item.discount_percentage || 0) / 100)
      setLocalFinalPrice(String(calculatedFinalPrice))
    }
  }

  const handleDiscountFocus = () => {
    setIsEditingDiscount(true)
    setLocalDiscount(String(item.discount_percentage || 0))
  }

  const handleFinalPriceChange = (newFinalPrice: string) => {
    // While editing, update local state and calculate discount percentage
    setLocalFinalPrice(newFinalPrice)

    const finalPrice = parseFloat(newFinalPrice.replace(/[^0-9.]/g, ''))
    const basePrice = item.base_price || 0
    if (!isNaN(finalPrice) && finalPrice >= 0 && finalPrice <= basePrice) {
      // Calculate discount percentage from final price
      const calculatedDiscount = basePrice > 0 ? ((basePrice - finalPrice) / basePrice) * 100 : 0
      setLocalDiscount(String(Math.round(calculatedDiscount * 100) / 100)) // Round to 2 decimals
    }
  }

  const handleFinalPriceBlur = () => {
    setIsEditingFinalPrice(false)

    // Parse the final price
    const finalPrice = parseFloat(localFinalPrice.replace(/[^0-9.]/g, ''))
    const basePrice = item.base_price || 0

    if (!isNaN(finalPrice) && finalPrice >= 0 && finalPrice <= basePrice && basePrice > 0) {
      // Calculate discount percentage from final price
      const calculatedDiscount = ((basePrice - finalPrice) / basePrice) * 100

      // Update the discount percentage (which will automatically update the final price)
      onUpdate(item.id, { discount_percentage: Math.round(calculatedDiscount * 100) / 100 })
    } else if (isNaN(finalPrice) || finalPrice < 0 || finalPrice > basePrice) {
      // Reset to calculated value if invalid
      const calculatedFinalPrice = basePrice * (1 - (item.discount_percentage || 0) / 100)
      setLocalFinalPrice(String(calculatedFinalPrice))
    }
  }

  const handleFinalPriceFocus = () => {
    setIsEditingFinalPrice(true)
    const calculatedFinalPrice = (item.base_price || 0) * (1 - (item.discount_percentage || 0) / 100)
    setLocalFinalPrice(String(calculatedFinalPrice))
  }

  const handleToggleAvailability = () => {
    onUpdate(item.id, { is_available: !item.is_available })
  }

  const handleTogglePromotion = () => {
    // When enabling promotion, set a default 10% discount if none exists
    if (!item.is_promotion) {
      onUpdate(item.id, {
        is_promotion: true,
        discount_percentage: item.discount_percentage || 10
      })
    } else {
      // When disabling, keep the discount_percentage but turn off promotion
      onUpdate(item.id, { is_promotion: false })
    }
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    onDelete(item.id)
  }

  const handleIngredientsChange = (ingredientIds: string[]) => {
    onUpdate(item.id, { ingredients: ingredientIds })
  }

  const handleImageSave = (imageUrl: string) => {
    onUpdate(item.id, { image_url: imageUrl || undefined })
  }

  const currencyData = getCurrency(currency)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white rounded-ios-lg p-4 shadow-ios hover:shadow-ios-lg transition-all',
        isDragging && 'opacity-50 shadow-ios-xl',
        !item.is_available && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-ios-gray-400 hover:text-ios-gray-600 touch-none flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        {/* Image Thumbnail - Clickeable */}
        {item.image_url && (
          <button
            onClick={() => setShowEditImageModal(true)}
            className="relative w-20 h-20 rounded-ios overflow-hidden border border-ios-gray-200 flex-shrink-0 group cursor-pointer transition-transform hover:scale-105"
            title="Editar imagen"
          >
            <img
              src={`${item.image_url}?t=${item.updated_at ? new Date(item.updated_at).getTime() : Date.now()}`}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-semibold">✏️ Editar</span>
            </div>
          </button>
        )}

        {/* Item Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <ContentEditable
              value={item.name}
              onChange={handleNameChange}
              placeholder="Nombre del plato"
              className="text-lg font-semibold text-ios-gray-900 flex-1"
            />

            {/* Badges */}
            <div className="flex gap-1">
              {item.is_promotion && (
                <Badge variant="danger" size="sm">Promo</Badge>
              )}
              {!item.is_available && (
                <Badge variant="default" size="sm">No disponible</Badge>
              )}
            </div>
          </div>

          <ContentEditable
            value={item.description || ''}
            onChange={handleDescriptionChange}
            placeholder="Descripción del plato"
            className="text-sm text-ios-gray-600 mb-2"
            multiline
            maxLength={200}
          />

          {/* Price - Mejorado con mejor UX de edición */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-ios-blue/5 px-3 py-2 rounded-lg border-2 border-ios-blue/20 hover:border-ios-blue/40 transition-all">
              <span className="text-xs font-medium text-ios-gray-600">{currencyData.symbol}</span>
              <ContentEditable
                value={isEditingPrice ? localPrice : formatPriceForDisplay(item.base_price || 0, currencyData.decimals)}
                onChange={handlePriceChange}
                onFocus={handlePriceFocus}
                onBlur={handlePriceBlur}
                placeholder="0"
                className={cn(
                  "text-lg font-bold text-ios-blue min-w-[60px]",
                  isEditingPrice && "bg-white px-2 py-1 rounded border-2 border-ios-blue shadow-sm"
                )}
              />
            </div>

            {item.is_promotion && (
              <div className="flex flex-col gap-2">
                {/* Edición por Porcentaje */}
                <div className="flex items-center gap-1 bg-ios-red/5 px-3 py-2 rounded-lg border-2 border-ios-red/20 hover:border-ios-red/40 transition-all">
                  <span className="text-xs font-medium text-ios-gray-600">Descuento:</span>
                  <ContentEditable
                    value={isEditingDiscount ? localDiscount : String(item.discount_percentage || 0)}
                    onChange={handleDiscountChange}
                    onFocus={handleDiscountFocus}
                    onBlur={handleDiscountBlur}
                    placeholder="0"
                    className={cn(
                      "text-base font-bold text-ios-red min-w-[40px]",
                      isEditingDiscount && "bg-white px-2 py-1 rounded border-2 border-ios-red shadow-sm"
                    )}
                  />
                  <span className="text-xs font-medium text-ios-gray-600">%</span>
                </div>

                {/* Edición por Precio Final */}
                <div className="flex items-center gap-1 bg-ios-green/5 px-3 py-2 rounded-lg border-2 border-ios-green/20 hover:border-ios-green/40 transition-all">
                  <span className="text-xs font-medium text-ios-gray-600">Precio final: {currencyData.symbol}</span>
                  <ContentEditable
                    value={
                      isEditingFinalPrice
                        ? localFinalPrice
                        : formatPriceForDisplay(
                            parseFloat(localFinalPrice),
                            currencyData.decimals
                          )
                    }
                    onChange={handleFinalPriceChange}
                    onFocus={handleFinalPriceFocus}
                    onBlur={handleFinalPriceBlur}
                    placeholder="0"
                    className={cn(
                      "text-base font-bold text-ios-green min-w-[60px]",
                      isEditingFinalPrice && "bg-white px-2 py-1 rounded border-2 border-ios-green shadow-sm"
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggleAvailability}
            title={item.is_available ? 'Marcar no disponible' : 'Marcar disponible'}
            className={cn(
              'text-xs',
              item.is_available ? 'text-ios-green' : 'text-ios-gray-400'
            )}
          >
            {item.is_available ? '✓' : '✗'}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleTogglePromotion}
            title={item.is_promotion ? 'Quitar promoción' : 'Marcar como promoción'}
            className="text-xs"
          >
            {item.is_promotion ? '🏷️' : '💵'}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            title="Eliminar plato"
            className="text-xs text-ios-red hover:bg-ios-red/10"
          >
            🗑️
          </Button>
        </div>
      </div>

      {/* Image and Ingredients */}
      <div className="mt-2 pt-2 border-t border-ios-gray-200 space-y-3">
        {/* Image - Only show button when no image */}
        {!item.image_url && (
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEditImageModal(true)}
              className="text-xs w-full"
            >
              ➕ Agregar Imagen
            </Button>
          </div>
        )}

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-ios-gray-700">Ingredientes:</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowIngredientSelector(true)}
              className="text-xs"
            >
              ✏️ Editar
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {item.ingredients && item.ingredients.length > 0 ? (
              item.ingredients.map((ingredientId) => {
                const ingredient = getIngredientById(ingredientId, customIngredients)
                return (
                  <Badge key={ingredientId} variant="default" size="sm">
                    {ingredient?.name || ingredientId}
                  </Badge>
                )
              })
            ) : (
              <span className="text-xs text-ios-gray-400">Sin ingredientes configurados</span>
            )}
          </div>
        </div>

        {/* Allergens */}
        {item.allergens && item.allergens.length > 0 && (
          <div>
            <span className="text-xs font-medium text-ios-gray-700">Alérgenos:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {item.allergens.map((allergen) => (
                <Badge key={allergen} variant="warning" size="sm">
                  {allergen}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showIngredientSelector && (
        <IngredientSelector
          selectedIngredientIds={item.ingredients || []}
          onChange={handleIngredientsChange}
          onClose={() => setShowIngredientSelector(false)}
        />
      )}

      {showEditImageModal && (
        <EditImageModal
          currentImageUrl={item.image_url}
          itemName={item.name}
          onSave={handleImageSave}
          onClose={() => setShowEditImageModal(false)}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar plato?"
        message={`¿Estás seguro de que deseas eliminar "${item.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        icon="🗑️"
      />
    </div>
  )
}
