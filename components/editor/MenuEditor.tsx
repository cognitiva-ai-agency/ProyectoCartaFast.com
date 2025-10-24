'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useMenuFilesystem } from '@/hooks/useMenuFilesystem'
import { Category, MenuItem } from '@/types'
import { Button, Spinner } from '@/components/ui'
import { DraggableCategory } from './DraggableCategory'
import { AddCategoryModal } from './AddCategoryModal'
import { AddMenuItemModal } from './AddMenuItemModal'

export interface MenuEditorProps {
  restaurantId: string
  restaurantSlug: string
  isDemo?: boolean
}

/**
 * Main Menu Editor with drag-and-drop functionality
 * Allows reordering categories and items within categories
 */
export function MenuEditor({ restaurantId, restaurantSlug, isDemo = false }: MenuEditorProps) {
  // IMPORTANT: Always use filesystem hook when Supabase is not configured
  // Since we're running in filesystem mode (no Supabase .env configured),
  // we use useMenuFilesystem for all restaurants
  const {
    menu,
    categories,
    items,
    isLoading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    reorderItems,
  } = useMenuFilesystem(restaurantSlug)

  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<'category' | 'item' | null>(null)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [selectedCategoryForItem, setSelectedCategoryForItem] = useState<{ id: string; name: string } | null>(null)
  const [currentCurrency, setCurrentCurrency] = useState('EUR')
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(true)

  // Load currency from theme config
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const res = await fetch(`/api/restaurants/${restaurantSlug}/theme`, { cache: 'no-store' })
        if (res.ok) {
          const themeData = await res.json()
          setCurrentCurrency(themeData.currency || 'CLP')
        }
      } catch (err) {
        console.error('Error loading currency:', err)
      } finally {
        setIsLoadingCurrency(false)
      }
    }

    // Load immediately
    loadCurrency()

    // Poll for currency changes every 2 seconds (for real-time updates when editing settings)
    const interval = setInterval(loadCurrency, 2000)
    return () => clearInterval(interval)
  }, [restaurantSlug])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    setActiveType(active.data.current?.type || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      setActiveId(null)
      setActiveType(null)
      return
    }

    const activeType = active.data.current?.type
    const overType = over.data.current?.type

    // Reorder categories
    if (activeType === 'category' && overType === 'category') {
      const oldIndex = categories.findIndex((c) => c.id === active.id)
      const newIndex = categories.findIndex((c) => c.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(categories, oldIndex, newIndex)
        reorderCategories(reordered)
      }
    }

    // Handle item dragging
    if (activeType === 'item') {
      const activeItem = items.find((i) => i.id === active.id)

      if (!activeItem) {
        setActiveId(null)
        setActiveType(null)
        return
      }

      // Case 1: Dragging item over a category (move to that category)
      if (overType === 'category') {
        const targetCategoryId = over.id as string

        if (activeItem.category_id !== targetCategoryId) {
          // Move item to new category
          const targetCategoryItems = items.filter((i) => i.category_id === targetCategoryId)
          const newPosition = targetCategoryItems.length

          updateMenuItem(activeItem.id, {
            ...activeItem,
            category_id: targetCategoryId,
            position: newPosition
          })
        }
      }

      // Case 2: Dragging item over another item
      if (overType === 'item') {
        const overItem = items.find((i) => i.id === over.id)

        if (overItem) {
          // Same category - just reorder
          if (activeItem.category_id === overItem.category_id) {
            const categoryItems = items.filter((i) => i.category_id === activeItem.category_id)
            const oldIndex = categoryItems.findIndex((i) => i.id === active.id)
            const newIndex = categoryItems.findIndex((i) => i.id === over.id)

            if (oldIndex !== -1 && newIndex !== -1) {
              const reordered = arrayMove(categoryItems, oldIndex, newIndex)
              reorderItems(activeItem.category_id, reordered)
            }
          }
          // Different category - move to new category
          else {
            // Simply update the category_id - updateMenuItem will handle it
            updateMenuItem(activeItem.id, {
              category_id: overItem.category_id
            })
          }
        }
      }
    }

    setActiveId(null)
    setActiveType(null)
  }

  const handleAddCategory = () => {
    setShowAddCategoryModal(true)
  }

  const handleAddCategorySubmit = async (name: string, description: string, imageUrl: string) => {
    await addCategory(name, description, imageUrl)
  }

  const handleAddItem = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (category) {
      setSelectedCategoryForItem({ id: category.id, name: category.name })
      setShowAddItemModal(true)
    }
  }

  const handleAddItemSubmit = async (categoryId: string, itemData: Partial<MenuItem>) => {
    await addMenuItem(categoryId, itemData)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-ios-red/10 border border-ios-red rounded-ios-lg p-6 text-center">
        <p className="text-ios-red font-medium">Error al cargar el menú</p>
        <p className="text-sm text-ios-gray-600 mt-2">{error}</p>
      </div>
    )
  }

  if (!menu) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-xl font-semibold text-ios-gray-700 mb-2">
          No se pudo cargar el menú
        </h3>
        <p className="text-ios-gray-500">Intenta recargar la página</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ios-gray-900">Editor de Menú</h2>
          <p className="text-ios-gray-600 flex items-center gap-2 mt-1">
            <svg className="w-5 h-5 text-ios-blue" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="9" cy="5" r="1.5"/>
              <circle cx="9" cy="12" r="1.5"/>
              <circle cx="9" cy="19" r="1.5"/>
              <circle cx="15" cy="5" r="1.5"/>
              <circle cx="15" cy="12" r="1.5"/>
              <circle cx="15" cy="19" r="1.5"/>
            </svg>
            Usa el ícono azul de 6 puntos para reordenar categorías
          </p>
        </div>

        <Button onClick={handleAddCategory} size="lg">
          + Nueva Categoría
        </Button>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="bg-ios-gray-50 rounded-ios-xl p-12 text-center border-2 border-dashed border-ios-gray-300">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-ios-gray-700 mb-2">
            Tu menú está vacío
          </h3>
          <p className="text-ios-gray-500 mb-6">
            Comienza creando tu primera categoría de platos
          </p>
          <Button onClick={handleAddCategory} size="lg">
            + Crear Primera Categoría
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {categories.map((category) => {
                const categoryItems = items
                  .filter((item) => item.category_id === category.id)
                  .sort((a, b) => a.position - b.position)

                return (
                  <DraggableCategory
                    key={category.id}
                    category={category}
                    items={categoryItems}
                    onUpdateCategory={updateCategory}
                    onDeleteCategory={deleteCategory}
                    onAddItem={handleAddItem}
                    onUpdateItem={updateMenuItem}
                    onDeleteItem={deleteMenuItem}
                    onReorderItems={reorderItems}
                    currency={currentCurrency}
                  />
                )
              })}
            </div>
          </SortableContext>

          {/* Drag Overlay - Mejorado */}
          <DragOverlay>
            {activeId && activeType === 'category' && (() => {
              const cat = categories.find((c) => c.id === activeId)
              return cat ? (
                <div className="bg-white rounded-2xl p-6 shadow-2xl border-4 border-ios-blue opacity-90 min-w-[400px]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-ios-blue text-white font-bold">
                      {cat.position + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-xl text-ios-gray-900">
                        {cat.name}
                      </p>
                      {cat.description && (
                        <p className="text-sm text-ios-gray-600 mt-1">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <svg className="w-8 h-8 text-ios-blue" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="9" cy="5" r="1.5"/>
                      <circle cx="9" cy="12" r="1.5"/>
                      <circle cx="9" cy="19" r="1.5"/>
                      <circle cx="15" cy="5" r="1.5"/>
                      <circle cx="15" cy="12" r="1.5"/>
                      <circle cx="15" cy="19" r="1.5"/>
                    </svg>
                  </div>
                </div>
              ) : null
            })()}
            {activeId && activeType === 'item' && (
              <div className="bg-white rounded-ios-lg p-4 shadow-2xl border-2 border-ios-green opacity-90">
                <p className="font-semibold text-lg">
                  {items.find((i) => i.id === activeId)?.name}
                </p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Helper Tips - Mejorado */}
      <div className="bg-gradient-to-br from-ios-blue/10 to-ios-purple/10 rounded-2xl p-6 border-2 border-ios-blue/20 shadow-lg">
        <h4 className="font-bold text-lg text-ios-blue mb-4 flex items-center gap-2">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
          </svg>
          Cómo reordenar categorías:
        </h4>
        <div className="grid gap-3">
          <div className="flex items-start gap-3 bg-white/50 p-3 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-ios-blue/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-ios-blue" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="9" cy="5" r="1.5"/>
                <circle cx="9" cy="12" r="1.5"/>
                <circle cx="9" cy="19" r="1.5"/>
                <circle cx="15" cy="5" r="1.5"/>
                <circle cx="15" cy="12" r="1.5"/>
                <circle cx="15" cy="19" r="1.5"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-ios-gray-900 mb-1">1. Agarra el ícono de 6 puntos azul</p>
              <p className="text-sm text-ios-gray-600">Busca el botón azul con 6 puntos al lado del número de posición</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/50 p-3 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-ios-green/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🖱️</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-ios-gray-900 mb-1">2. Arrastra a la nueva posición</p>
              <p className="text-sm text-ios-gray-600">Mantén presionado y mueve hacia arriba o abajo donde quieras</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/50 p-3 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-ios-purple/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-ios-gray-900 mb-1">3. Suelta para guardar</p>
              <p className="text-sm text-ios-gray-600">Al soltar, el orden se guarda automáticamente</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-ios-blue/20">
          <p className="text-sm text-ios-gray-700">
            <strong>Otros consejos:</strong> Haz clic en cualquier texto para editarlo • Usa los iconos para mostrar/ocultar o eliminar
          </p>
        </div>
      </div>

      {/* Modals */}
      {showAddCategoryModal && (
        <AddCategoryModal
          onAdd={handleAddCategorySubmit}
          onClose={() => setShowAddCategoryModal(false)}
        />
      )}

      {showAddItemModal && selectedCategoryForItem && (
        <AddMenuItemModal
          categoryId={selectedCategoryForItem.id}
          categoryName={selectedCategoryForItem.name}
          onAdd={handleAddItemSubmit}
          onClose={() => {
            setShowAddItemModal(false)
            setSelectedCategoryForItem(null)
          }}
          currency={currentCurrency}
        />
      )}
    </div>
  )
}
