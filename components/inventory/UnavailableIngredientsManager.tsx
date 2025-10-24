'use client'

import { useState, useEffect } from 'react'
import { MASTER_INGREDIENTS, INGREDIENT_CATEGORIES, Ingredient, getAllIngredients } from '@/lib/ingredients'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Spinner } from '@/components/ui'
import { cn } from '@/lib/utils'
import { MenuItem } from '@/types'

export interface UnavailableIngredientsManagerProps {
  restaurantSlug: string
}

export function UnavailableIngredientsManager({ restaurantSlug }: UnavailableIngredientsManagerProps) {
  const [categories, setCategories] = useState<{ [key: string]: string }>({})
  const [unavailableIds, setUnavailableIds] = useState<string[]>([])
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('CARNES')
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    loadData()
  }, [restaurantSlug])

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Load all personalized ingredients
      const ingredientsRes = await fetch(`/api/restaurants/${restaurantSlug}/ingredients`, { cache: 'no-store' })
      const ingredientsData = await ingredientsRes.json()
      const loadedCategories = ingredientsData.categories || {}
      setCategories(loadedCategories)
      setAllIngredients(ingredientsData.ingredients || [])

      // Initialize active category with the first available category
      const firstCategoryKey = Object.keys(loadedCategories)[0]
      if (firstCategoryKey && !loadedCategories[activeCategory]) {
        setActiveCategory(firstCategoryKey)
      }

      // Load unavailable ingredients
      const unavailableRes = await fetch(`/api/restaurants/${restaurantSlug}/unavailable-ingredients`, { cache: 'no-store' })
      const unavailableData = await unavailableRes.json()
      setUnavailableIds(unavailableData.ingredient_ids || [])

      // Load menu items
      const itemsRes = await fetch(`/api/restaurants/${restaurantSlug}/items`, { cache: 'no-store' })
      const itemsData = await itemsRes.json()
      setItems(itemsData)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleIngredient = (ingredientId: string) => {
    setUnavailableIds(prev =>
      prev.includes(ingredientId)
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId]
    )
  }

  const getAffectedItems = (): MenuItem[] => {
    return items.filter(item =>
      item.ingredients?.some(ingId => unavailableIds.includes(ingId))
    )
  }

  const handleApplyChanges = async () => {
    try {
      setIsSaving(true)

      // Save unavailable ingredients list
      await fetch(`/api/restaurants/${restaurantSlug}/unavailable-ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient_ids: unavailableIds })
      })

      // Mark affected items as unavailable
      const affectedItems = getAffectedItems()
      const updatedItems = items.map(item => {
        const isAffected = affectedItems.some(ai => ai.id === item.id)
        if (isAffected) {
          return { ...item, is_available: false }
        }
        // If not affected and was previously marked as unavailable due to ingredients, mark as available
        const hasUnavailableIngredient = item.ingredients?.some(ingId => unavailableIds.includes(ingId))
        if (!hasUnavailableIngredient && !item.is_available) {
          return { ...item, is_available: true }
        }
        return item
      })

      // Save updated items
      await fetch(`/api/restaurants/${restaurantSlug}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItems)
      })

      setItems(updatedItems)
      setShowConfirmation(true)
      setTimeout(() => setShowConfirmation(false), 3000)
    } catch (err) {
      console.error('Error applying changes:', err)
      alert('Error al aplicar cambios')
    } finally {
      setIsSaving(false)
    }
  }

  const ingredientsByCategory = Object.entries(categories).map(([key, label]) => ({
    key,
    label,
    ingredients: allIngredients.filter(ing => ing.category === key),
  }))

  const activeIngredients = allIngredients.filter(ing => ing.category === activeCategory)
  const affectedCount = getAffectedItems().length

  if (isLoading) {
    return (
      <Card variant="elevated">
        <CardContent className="py-12 text-center">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestión de Ingredientes No Disponibles</CardTitle>
            <p className="text-sm text-ios-gray-600 mt-1">
              Marca los ingredientes que no tienes disponibles. Los platos que los contengan se ocultarán automáticamente del menú público.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {showConfirmation && (
              <div className="flex items-center gap-2 text-ios-green font-medium animate-fade-in">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cambios aplicados
              </div>
            )}
            <Badge variant={unavailableIds.length > 0 ? 'warning' : 'default'} size="sm">
              {unavailableIds.length} sin stock
            </Badge>
            {affectedCount > 0 && (
              <Badge variant="danger" size="sm">
                {affectedCount} platos afectados
              </Badge>
            )}
            <Button
              onClick={handleApplyChanges}
              disabled={isSaving}
              size="sm"
              className={cn(
                affectedCount > 0 && 'bg-ios-orange hover:bg-ios-orange/90'
              )}
            >
              {isSaving ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Aplicando...
                </>
              ) : (
                'Aplicar Cambios'
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex gap-4">
          {/* Category Sidebar - Más visible */}
          <div className="w-56 flex-shrink-0 bg-ios-gray-50 rounded-ios-lg p-3">
            <h3 className="font-bold text-ios-gray-900 mb-3 px-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-ios-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Categorías
            </h3>
            <div className="space-y-1.5">
              {ingredientsByCategory.map(({ key, label, ingredients }) => {
                const unavailableCount = ingredients.filter(ing => unavailableIds.includes(ing.id)).length
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={cn(
                      'w-full px-4 py-3 text-left text-sm font-medium transition-all rounded-ios-lg border-l-4',
                      activeCategory === key
                        ? 'bg-ios-blue text-white border-ios-blue shadow-ios'
                        : 'border-transparent text-ios-gray-700 hover:bg-ios-gray-100 bg-white'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{label}</span>
                      {unavailableCount > 0 && (
                        <Badge
                          variant={activeCategory === key ? "default" : "warning"}
                          size="sm"
                          className={cn(
                            activeCategory === key && "bg-white/20 text-white"
                          )}
                        >
                          {unavailableCount}
                        </Badge>
                      )}
                    </div>
                    <span className={cn(
                      "text-xs",
                      activeCategory === key ? "text-white/80" : "text-ios-gray-500"
                    )}>
                      {ingredients.length === 1 ? '1 ingrediente' : `${ingredients.length} ingredientes`}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Ingredients Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-ios-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-ios-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {categories[activeCategory]}
              </h3>
              <Badge variant="primary" size="lg">
                {activeIngredients.length} {activeIngredients.length === 1 ? 'ingrediente' : 'ingredientes'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {activeIngredients.map((ingredient) => {
                const isUnavailable = unavailableIds.includes(ingredient.id)
                const isCustom = ingredient.id.startsWith('custom-')
                const affectedItemsForThis = items.filter(item =>
                  item.ingredients?.includes(ingredient.id)
                )

                return (
                  <button
                    key={ingredient.id}
                    onClick={() => toggleIngredient(ingredient.id)}
                    className={cn(
                      'px-3 py-2 rounded-ios-lg text-sm font-medium transition-all text-left border-2',
                      isUnavailable
                        ? 'bg-ios-red/10 border-ios-red text-ios-red'
                        : 'bg-ios-gray-50 border-transparent text-ios-gray-700 hover:bg-ios-gray-100'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="truncate">{ingredient.name}</span>
                          {isCustom && (
                            <span className="text-xs px-1 py-0.5 rounded bg-ios-green/10 text-ios-green flex-shrink-0">
                              Tuyo
                            </span>
                          )}
                        </div>
                        {affectedItemsForThis.length > 0 && (
                          <span className="text-xs text-ios-gray-500 block mt-0.5">
                            {affectedItemsForThis.length} plato{affectedItemsForThis.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {isUnavailable && (
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Help Section */}
        {affectedCount > 0 && (
          <div className="mt-6 p-4 bg-ios-orange/5 rounded-ios-lg border border-ios-orange/20">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-ios-orange flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-ios-gray-900">
                  {affectedCount} plato{affectedCount !== 1 ? 's' : ''} {affectedCount !== 1 ? 'serán ocultados' : 'será ocultado'} del menú público
                </p>
                <p className="text-sm text-ios-gray-600 mt-1">
                  Al hacer clic en "Aplicar Cambios", los platos que contengan los ingredientes marcados se marcarán automáticamente como "No Disponibles" y no aparecerán en el menú público.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
