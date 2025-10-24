'use client'

import { useState } from 'react'
import { MenuItem } from '@/types'
import { Button } from '@/components/ui'
import { MASTER_INGREDIENTS, getIngredientById } from '@/lib/ingredients'

interface FilterPanelProps {
  allItems: MenuItem[]
  onFilterChange: (excludedIngredients: string[], includedIngredients: string[]) => void
  themeConfig?: any
}

/**
 * FilterPanel - Permite a los clientes filtrar el menú según sus preferencias
 * - Ingredientes que NO quieren (exclusión)
 * - Ingredientes que SÍ quieren (inclusión)
 */
export function FilterPanel({ allItems, onFilterChange, themeConfig }: FilterPanelProps) {
  const [excludedIngredientIds, setExcludedIngredientIds] = useState<string[]>([])
  const [includedIngredientIds, setIncludedIngredientIds] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  // Extraer todos los IDs de ingredientes únicos de todos los platos
  const allIngredientIds = Array.from(
    new Set(
      allItems.flatMap(item => item.ingredients || [])
    )
  ).sort((a, b) => {
    const nameA = getIngredientById(a)?.name || a
    const nameB = getIngredientById(b)?.name || b
    return nameA.localeCompare(nameB)
  })

  const toggleExcluded = (ingredientId: string) => {
    const newExcluded = excludedIngredientIds.includes(ingredientId)
      ? excludedIngredientIds.filter(i => i !== ingredientId)
      : [...excludedIngredientIds, ingredientId]

    // Si lo agregamos a excluidos, quitarlo de incluidos
    const newIncluded = includedIngredientIds.filter(i => i !== ingredientId)

    setExcludedIngredientIds(newExcluded)
    setIncludedIngredientIds(newIncluded)
    onFilterChange(newExcluded, newIncluded)
  }

  const toggleIncluded = (ingredientId: string) => {
    const newIncluded = includedIngredientIds.includes(ingredientId)
      ? includedIngredientIds.filter(i => i !== ingredientId)
      : [...includedIngredientIds, ingredientId]

    // Si lo agregamos a incluidos, quitarlo de excluidos
    const newExcluded = excludedIngredientIds.filter(i => i !== ingredientId)

    setIncludedIngredientIds(newIncluded)
    setExcludedIngredientIds(newExcluded)
    onFilterChange(newExcluded, newIncluded)
  }

  const clearFilters = () => {
    setExcludedIngredientIds([])
    setIncludedIngredientIds([])
    onFilterChange([], [])
  }

  const hasActiveFilters = excludedIngredientIds.length > 0 || includedIngredientIds.length > 0

  return (
    <div className="bg-white rounded-ios-lg shadow-ios border border-ios-gray-200 mb-6">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-ios-gray-50 transition-ios rounded-t-ios-lg"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <div className="text-left">
            <h3 className="font-semibold text-ios-gray-900">
              Personaliza tu Menú
            </h3>
            <p className="text-sm text-ios-gray-600">
              Filtra por ingredientes que te gustan o no
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <span className="bg-ios-blue text-white text-xs font-medium px-2 py-1 rounded-full">
              {excludedIngredientIds.length + includedIngredientIds.length}
            </span>
          )}
          <svg
            className={`w-5 h-5 text-ios-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-ios-gray-200">
          {/* Excluded Ingredients Section */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-ios-gray-900 flex items-center gap-2">
                <span className="text-lg">🚫</span>
                Ingredientes que NO quiero
              </h4>
              {excludedIngredientIds.length > 0 && (
                <span className="text-xs text-ios-gray-500">
                  {excludedIngredientIds.length} seleccionados
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allIngredientIds.map((ingredientId) => {
                const ingredient = getIngredientById(ingredientId)
                if (!ingredient) return null
                return (
                  <button
                    key={`exclude-${ingredientId}`}
                    onClick={() => toggleExcluded(ingredientId)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-ios ${
                      excludedIngredientIds.includes(ingredientId)
                        ? 'bg-ios-red text-white'
                        : 'bg-ios-gray-100 text-ios-gray-700 hover:bg-ios-gray-200'
                    }`}
                  >
                    {ingredient.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Included Ingredients Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-ios-gray-900 flex items-center gap-2">
                <span className="text-lg">✅</span>
                Ingredientes que SÍ quiero
              </h4>
              {includedIngredientIds.length > 0 && (
                <span className="text-xs text-ios-gray-500">
                  {includedIngredientIds.length} seleccionados
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allIngredientIds.map((ingredientId) => {
                const ingredient = getIngredientById(ingredientId)
                if (!ingredient) return null
                return (
                  <button
                    key={`include-${ingredientId}`}
                    onClick={() => toggleIncluded(ingredientId)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-ios ${
                      includedIngredientIds.includes(ingredientId)
                        ? 'bg-ios-green text-white'
                        : 'bg-ios-gray-100 text-ios-gray-700 hover:bg-ios-gray-200'
                    }`}
                  >
                    {ingredient.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-ios-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          )}

          {/* Filter Info */}
          <div className="mt-4 p-3 bg-ios-blue/5 rounded-ios border border-ios-blue/20">
            <p className="text-xs text-ios-gray-700">
              <strong>💡 Cómo funciona:</strong> Los platos que contengan ingredientes marcados en rojo NO se mostrarán.
              Solo se mostrarán platos que contengan AL MENOS UNO de los ingredientes marcados en verde.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
