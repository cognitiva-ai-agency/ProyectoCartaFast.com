'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Category, MenuItem } from '@/types'
import { Card, Button, Badge, ContentEditable, ConfirmDialog } from '@/components/ui'
import { DraggableMenuItem } from './DraggableMenuItem'
import { cn } from '@/lib/utils'

export interface DraggableCategoryProps {
  category: Category
  items: MenuItem[]
  onUpdateCategory: (categoryId: string, updates: Partial<Category>) => void
  onDeleteCategory: (categoryId: string) => void
  onAddItem: (categoryId: string) => void
  onUpdateItem: (itemId: string, updates: Partial<MenuItem>) => void
  onDeleteItem: (itemId: string) => void
  onReorderItems: (categoryId: string, items: MenuItem[]) => void
  currency?: string
}

/**
 * Draggable Category component with nested draggable items
 */
export function DraggableCategory({
  category,
  items,
  onUpdateCategory,
  onDeleteCategory,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onReorderItems,
  currency = 'EUR',
}: DraggableCategoryProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.id,
    data: {
      type: 'category',
      category,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleNameChange = (newName: string) => {
    onUpdateCategory(category.id, { name: newName })
  }

  const handleDescriptionChange = (newDescription: string) => {
    onUpdateCategory(category.id, { description: newDescription })
  }

  const handleToggleVisibility = () => {
    onUpdateCategory(category.id, { is_visible: !category.is_visible })
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    onDeleteCategory(category.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-all duration-200',
        isDragging && 'opacity-60 scale-105 shadow-2xl z-50 ring-4 ring-ios-blue/30'
      )}
    >
      <Card variant="elevated" padding="none" className={cn(
        "overflow-hidden transition-all",
        isDragging && "shadow-2xl border-2 border-ios-blue"
      )}>
        {/* Category Header */}
        <div className="bg-gradient-to-r from-ios-gray-50 to-white p-4 border-b border-ios-gray-200">
          <div className="flex items-start gap-3">
            {/* Drag Handle - Mejorado */}
            <div className="flex items-center gap-2">
              {/* Número de posición */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-ios-gray-100 text-ios-gray-600 font-bold text-sm">
                {category.position + 1}
              </div>

              {/* Handle de arrastre más visible */}
              <button
                {...attributes}
                {...listeners}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg",
                  "cursor-grab active:cursor-grabbing touch-none",
                  "bg-ios-blue/10 hover:bg-ios-blue/20 active:bg-ios-blue/30",
                  "border-2 border-ios-blue/20 hover:border-ios-blue/40",
                  "transition-all duration-200",
                  "group"
                )}
                title="Arrastra para reordenar"
              >
                <svg className="w-6 h-6 text-ios-blue group-hover:text-ios-blue-dark transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="9" cy="5" r="1.5"/>
                  <circle cx="9" cy="12" r="1.5"/>
                  <circle cx="9" cy="19" r="1.5"/>
                  <circle cx="15" cy="5" r="1.5"/>
                  <circle cx="15" cy="12" r="1.5"/>
                  <circle cx="15" cy="19" r="1.5"/>
                </svg>
              </button>
            </div>

            {/* Category Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <ContentEditable
                  value={category.name}
                  onChange={handleNameChange}
                  placeholder="Nombre de categoría"
                  className="text-xl font-semibold text-ios-gray-900"
                />
                <Badge variant={category.is_visible ? 'success' : 'default'} size="sm">
                  {category.is_visible ? 'Visible' : 'Oculta'}
                </Badge>
                <Badge variant="info" size="sm">
                  {items.length} {items.length === 1 ? 'plato' : 'platos'}
                </Badge>
              </div>

              <ContentEditable
                value={category.description || ''}
                onChange={handleDescriptionChange}
                placeholder="Descripción opcional"
                className="text-sm text-ios-gray-600"
                multiline
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsCollapsed(!isCollapsed)}
                title={isCollapsed ? 'Expandir' : 'Colapsar'}
              >
                {isCollapsed ? '▼' : '▲'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleToggleVisibility}
                title={category.is_visible ? 'Ocultar' : 'Mostrar'}
              >
                {category.is_visible ? '👁️' : '🚫'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                title="Eliminar categoría"
                className="text-ios-red hover:bg-ios-red/10"
              >
                🗑️
              </Button>
            </div>
          </div>
        </div>

        {/* Items List */}
        {!isCollapsed && (
          <div className="p-4 space-y-2">
            {items.length === 0 ? (
              <div className="text-center py-8 text-ios-gray-400">
                <div className="text-4xl mb-2">🍽️</div>
                <p className="text-sm">No hay platos en esta categoría</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddItem(category.id)}
                  className="mt-3"
                >
                  + Agregar Plato
                </Button>
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <DraggableMenuItem
                    key={item.id}
                    item={item}
                    onUpdate={onUpdateItem}
                    onDelete={onDeleteItem}
                    currency={currency}
                  />
                ))}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAddItem(category.id)}
                  className="w-full mt-2 border-2 border-dashed border-ios-gray-300 hover:border-ios-blue"
                >
                  + Agregar Plato
                </Button>
              </>
            )}
          </div>
        )}
      </Card>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar categoría?"
        message={
          items.length > 0
            ? `¿Estás seguro de que deseas eliminar la categoría "${category.name}" y sus ${items.length} ${items.length === 1 ? 'plato' : 'platos'}? Esta acción no se puede deshacer.`
            : `¿Estás seguro de que deseas eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        icon="🗑️"
      />
    </div>
  )
}
