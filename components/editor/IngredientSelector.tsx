'use client'

import { useState, useEffect } from 'react'
import { MASTER_INGREDIENTS, INGREDIENT_CATEGORIES, Ingredient } from '@/lib/ingredients'
import { Button, Badge, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

interface IngredientSelectorProps {
  selectedIngredientIds: string[]
  onChange: (ingredientIds: string[]) => void
  onClose: () => void
}

/**
 * IngredientSelector - Modal para seleccionar ingredientes del listado maestro y personalizados
 */
export function IngredientSelector({
  selectedIngredientIds,
  onChange,
  onClose,
}: IngredientSelectorProps) {
  const { session } = useAuth()
  const [categories, setCategories] = useState<{ [key: string]: string }>({})
  const [activeCategory, setActiveCategory] = useState<string>('CARNES')
  const [localSelected, setLocalSelected] = useState<string[]>(selectedIngredientIds)
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newIngredientName, setNewIngredientName] = useState('')
  const [newIngredientCategory, setNewIngredientCategory] = useState<keyof typeof INGREDIENT_CATEGORIES>('OTROS')

  // Load all ingredients from personalized API
  useEffect(() => {
    if (session?.slug) {
      loadIngredients()
    }
  }, [session?.slug])

  const loadIngredients = async () => {
    try {
      const res = await fetch(`/api/restaurants/${session?.slug}/ingredients`, {
        cache: 'no-store'
      })
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || {})
        setAllIngredients(data.ingredients || [])
      }
    } catch (err) {
      console.error('Error loading ingredients:', err)
    }
  }

  const saveIngredients = async (ingredients: Ingredient[]) => {
    try {
      await fetch(`/api/restaurants/${session?.slug}/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories, ingredients })
      })
    } catch (err) {
      console.error('Error saving ingredients:', err)
    }
  }

  const handleAddCustomIngredient = async () => {
    if (!newIngredientName.trim()) {
      alert('Por favor ingresa un nombre para el ingrediente')
      return
    }

    const newIngredient: Ingredient = {
      id: `custom-${Date.now()}`,
      name: newIngredientName.trim(),
      category: newIngredientCategory,
      isCommonAllergen: false
    }

    const updatedIngredients = [...allIngredients, newIngredient]
    setAllIngredients(updatedIngredients)

    // Save to API
    await saveIngredients(updatedIngredients)

    // Reset form
    setNewIngredientName('')
    setShowAddForm(false)

    // Auto-select the new ingredient
    setLocalSelected([...localSelected, newIngredient.id])
  }

  const toggleIngredient = (ingredientId: string) => {
    const newSelected = localSelected.includes(ingredientId)
      ? localSelected.filter(id => id !== ingredientId)
      : [...localSelected, ingredientId]
    setLocalSelected(newSelected)
  }

  const handleSave = () => {
    onChange(localSelected)
    onClose()
  }

  const ingredientsByCategory = Object.entries(categories).map(([key, label]) => ({
    key,
    label,
    ingredients: allIngredients.filter(ing => ing.category === key),
  }))

  const activeIngredients = allIngredients.filter(ing => ing.category === activeCategory)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-ios-xl shadow-ios-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ios-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-ios-gray-900">
              Seleccionar Ingredientes
            </h2>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-ios-blue hover:bg-ios-blue/10"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar Personalizado
              </Button>
              <Badge variant="primary" size="sm">
                {localSelected.length} seleccionados
              </Badge>
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

          {/* Add Custom Ingredient Form */}
          {showAddForm && (
            <div className="mt-4 p-4 bg-ios-gray-50 rounded-ios-lg border border-ios-gray-200">
              <h3 className="text-sm font-semibold text-ios-gray-900 mb-3">
                Agregar Ingrediente Personalizado
              </h3>
              <div className="flex gap-2">
                <Input
                  value={newIngredientName}
                  onChange={(e) => setNewIngredientName(e.target.value)}
                  placeholder="Nombre del ingrediente (ej: Quinoa Roja)"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCustomIngredient()
                    }
                  }}
                />
                <select
                  value={newIngredientCategory}
                  onChange={(e) => setNewIngredientCategory(e.target.value as keyof typeof INGREDIENT_CATEGORIES)}
                  className="px-3 py-2 border border-ios-gray-300 rounded-ios-lg text-sm focus:ring-2 focus:ring-ios-blue focus:border-ios-blue"
                >
                  {Object.entries(categories).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <Button size="sm" onClick={handleAddCustomIngredient}>
                  Agregar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewIngredientName('')
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Category Sidebar - Más visible */}
          <div className="w-56 border-r border-ios-gray-200 overflow-y-auto bg-ios-gray-50 p-3">
            <h4 className="font-bold text-ios-gray-900 mb-3 px-2 flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-ios-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Categorías
            </h4>
            <div className="space-y-1">
              {ingredientsByCategory.map(({ key, label, ingredients }) => {
                const selectedCount = ingredients.filter(ing => localSelected.includes(ing.id)).length
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={cn(
                      'w-full px-3 py-2.5 text-left text-sm font-medium transition-all rounded-ios-lg border-l-4',
                      activeCategory === key
                        ? 'bg-ios-blue text-white border-ios-blue shadow-ios'
                        : 'border-transparent text-ios-gray-700 hover:bg-ios-gray-100 bg-white'
                    )}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-sm">{label}</span>
                      {selectedCount > 0 && (
                        <Badge
                          variant={activeCategory === key ? "default" : "primary"}
                          size="sm"
                          className={cn(
                            "text-xs",
                            activeCategory === key && "bg-white/20 text-white"
                          )}
                        >
                          {selectedCount}
                        </Badge>
                      )}
                    </div>
                    <span className={cn(
                      "text-xs",
                      activeCategory === key ? "text-white/70" : "text-ios-gray-500"
                    )}>
                      {ingredients.length} {ingredients.length === 1 ? 'item' : 'items'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Ingredients Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ios-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-ios-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {categories[activeCategory]}
              </h3>
              <Badge variant="secondary" size="sm">
                {activeIngredients.length} {activeIngredients.length === 1 ? 'ingrediente' : 'ingredientes'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {activeIngredients.map((ingredient) => {
                const isSelected = localSelected.includes(ingredient.id)
                const isCustom = ingredient.id.startsWith('custom-')
                return (
                  <button
                    key={ingredient.id}
                    onClick={() => toggleIngredient(ingredient.id)}
                    className={cn(
                      'px-4 py-2 rounded-ios-lg text-sm font-medium transition-ios text-left',
                      isSelected
                        ? 'bg-ios-blue text-white shadow-ios'
                        : 'bg-ios-gray-100 text-ios-gray-700 hover:bg-ios-gray-200'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        {ingredient.name}
                        {isCustom && (
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded",
                            isSelected ? "bg-white/20" : "bg-ios-green/10 text-ios-green"
                          )}>
                            Tuyo
                          </span>
                        )}
                      </span>
                      {isSelected && (
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    {ingredient.isCommonAllergen && (
                      <span className="text-xs text-ios-orange mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Alérgeno común
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-ios-gray-200 flex items-center justify-between">
          <p className="text-sm text-ios-gray-600">
            Selecciona todos los ingredientes principales de este plato
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Guardar ({localSelected.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
