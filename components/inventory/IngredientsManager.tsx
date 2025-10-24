'use client'

import { useState, useEffect } from 'react'
import { INGREDIENT_CATEGORIES, Ingredient } from '@/lib/ingredients'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Spinner, Input, ConfirmDialog } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface IngredientsManagerProps {
  restaurantSlug: string
}

export function IngredientsManager({ restaurantSlug }: IngredientsManagerProps) {
  const [categories, setCategories] = useState<{ [key: string]: string }>({})
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('CARNES')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationMessage, setConfirmationMessage] = useState('')

  // Category management states
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [editingCategoryKey, setEditingCategoryKey] = useState<string | null>(null)
  const [categoryFormKey, setCategoryFormKey] = useState('')
  const [categoryFormLabel, setCategoryFormLabel] = useState('')

  // Form states
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState<keyof typeof INGREDIENT_CATEGORIES>('OTROS')
  const [formIsAllergen, setFormIsAllergen] = useState(false)
  const [formDietType, setFormDietType] = useState<'vegan' | 'vegetarian' | 'animal'>('vegan')
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [newCategoryKey, setNewCategoryKey] = useState('')
  const [newCategoryLabel, setNewCategoryLabel] = useState('')

  // Confirm dialog states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    title: string
    message: string
    onConfirm: () => void
    variant?: 'danger' | 'warning' | 'info'
  }>({
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger'
  })

  useEffect(() => {
    loadIngredients()
  }, [restaurantSlug])

  const loadIngredients = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/restaurants/${restaurantSlug}/ingredients`, { cache: 'no-store' })
      const data = await res.json()
      const loadedCategories = data.categories || {}
      setCategories(loadedCategories)
      setIngredients(data.ingredients || [])

      // Initialize active category with the first available category
      const firstCategoryKey = Object.keys(loadedCategories)[0]
      if (firstCategoryKey && !loadedCategories[activeCategory]) {
        setActiveCategory(firstCategoryKey)
      }
    } catch (err) {
      console.error('Error loading ingredients:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const saveData = async (updatedCategories: { [key: string]: string }, updatedIngredients: Ingredient[]) => {
    try {
      setIsSaving(true)
      await fetch(`/api/restaurants/${restaurantSlug}/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updatedCategories, ingredients: updatedIngredients })
      })
      setCategories(updatedCategories)
      setIngredients(updatedIngredients)
      return true
    } catch (err) {
      console.error('Error saving data:', err)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const saveIngredients = async (updatedIngredients: Ingredient[]) => {
    return saveData(categories, updatedIngredients)
  }

  const saveCategories = async (updatedCategories: { [key: string]: string }) => {
    return saveData(updatedCategories, ingredients)
  }

  const handleCreateNewCategoryInline = async () => {
    if (!newCategoryLabel.trim()) {
      alert('Por favor ingresa un nombre para la categoría')
      return
    }

    // Generate key automatically from label
    // Convert to uppercase, remove accents, replace spaces and special chars with underscores
    const generatedKey = newCategoryLabel
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^A-Z0-9]+/g, '_') // Replace non-alphanumeric with underscore
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores

    if (categories[generatedKey]) {
      alert(`Ya existe una categoría con el nombre "${newCategoryLabel}" (clave: ${generatedKey})`)
      return
    }

    const updatedCategories = {
      ...categories,
      [generatedKey]: newCategoryLabel.trim()
    }

    const success = await saveCategories(updatedCategories)

    if (success) {
      setFormCategory(generatedKey as keyof typeof INGREDIENT_CATEGORIES)
      setShowNewCategoryInput(false)
      setNewCategoryKey('')
      setNewCategoryLabel('')
      showMessage('Categoría creada correctamente')
    }
  }

  const handleAddIngredient = async () => {
    if (!formName.trim()) {
      alert('Por favor ingresa un nombre para el ingrediente')
      return
    }

    const newIngredient: Ingredient = {
      id: `custom-${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      isCommonAllergen: formIsAllergen,
      dietType: formDietType
    }

    const updatedIngredients = [...ingredients, newIngredient]
    const success = await saveIngredients(updatedIngredients)

    if (success) {
      setFormName('')
      setFormCategory('OTROS')
      setFormIsAllergen(false)
      setFormDietType('vegan')
      setShowAddForm(false)
      setShowNewCategoryInput(false)
      setNewCategoryKey('')
      setNewCategoryLabel('')
      showMessage('Ingrediente agregado correctamente')
      setActiveCategory(formCategory) // Switch to the category where it was added
    }
  }

  const handleEditIngredient = async () => {
    if (!editingIngredient || !formName.trim()) {
      alert('Por favor completa todos los campos')
      return
    }

    const updatedIngredients = ingredients.map(ing =>
      ing.id === editingIngredient.id
        ? {
            ...ing,
            name: formName.trim(),
            category: formCategory,
            isCommonAllergen: formIsAllergen,
            dietType: formDietType
          }
        : ing
    )

    const success = await saveIngredients(updatedIngredients)

    if (success) {
      setShowEditForm(false)
      setEditingIngredient(null)
      setFormName('')
      setFormCategory('OTROS')
      setFormIsAllergen(false)
      setFormDietType('vegan')
      setShowNewCategoryInput(false)
      setNewCategoryKey('')
      setNewCategoryLabel('')
      showMessage('Ingrediente actualizado correctamente')
      setActiveCategory(formCategory) // Switch to the updated category
    }
  }

  const handleDeleteIngredient = (ingredient: Ingredient) => {
    setConfirmDialogConfig({
      title: 'Eliminar Ingrediente',
      message: `¿Estás seguro de eliminar "${ingredient.name}"? Esta acción no se puede deshacer.`,
      variant: 'danger',
      onConfirm: async () => {
        const updatedIngredients = ingredients.filter(ing => ing.id !== ingredient.id)
        const success = await saveIngredients(updatedIngredients)

        if (success) {
          showMessage('Ingrediente eliminado correctamente')
        }
      }
    })
    setConfirmDialogOpen(true)
  }

  const openEditForm = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient)
    setFormName(ingredient.name)
    setFormCategory(ingredient.category)
    setFormIsAllergen(ingredient.isCommonAllergen || false)
    setFormDietType(ingredient.dietType || 'vegan')
    setShowEditForm(true)
    setShowAddForm(false)
  }

  const showMessage = (message: string) => {
    setConfirmationMessage(message)
    setShowConfirmation(true)
    setTimeout(() => setShowConfirmation(false), 3000)
  }

  // Category management functions
  const handleAddCategory = async () => {
    if (!categoryFormLabel.trim()) {
      alert('Por favor ingresa un nombre para la categoría')
      return
    }

    // Generate key automatically from label
    const generatedKey = categoryFormLabel
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^A-Z0-9]+/g, '_') // Replace non-alphanumeric with underscore
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores

    if (categories[generatedKey]) {
      alert(`Ya existe una categoría con el nombre "${categoryFormLabel}" (clave: ${generatedKey})`)
      return
    }

    const updatedCategories = {
      ...categories,
      [generatedKey]: categoryFormLabel.trim()
    }

    const success = await saveCategories(updatedCategories)

    if (success) {
      setCategoryFormKey('')
      setCategoryFormLabel('')
      setEditingCategoryKey(null)
      showMessage('Categoría agregada correctamente')
    }
  }

  const handleEditCategory = async () => {
    if (!editingCategoryKey || !categoryFormLabel.trim()) {
      alert('Por favor ingresa un nombre para la categoría')
      return
    }

    const updatedCategories = {
      ...categories,
      [editingCategoryKey]: categoryFormLabel.trim()
    }

    const success = await saveCategories(updatedCategories)

    if (success) {
      setCategoryFormKey('')
      setCategoryFormLabel('')
      setEditingCategoryKey(null)
      showMessage('Categoría actualizada correctamente')
    }
  }

  const handleDeleteCategory = (categoryKey: string) => {
    const ingredientsInCategory = ingredients.filter(ing => ing.category === categoryKey)

    if (ingredientsInCategory.length > 0) {
      alert(`No puedes eliminar esta categoría porque contiene ${ingredientsInCategory.length} ingrediente(s). Primero mueve o elimina los ingredientes.`)
      return
    }

    setConfirmDialogConfig({
      title: 'Eliminar Categoría',
      message: `¿Estás seguro de eliminar la categoría "${categories[categoryKey]}"? Esta acción no se puede deshacer.`,
      variant: 'danger',
      onConfirm: async () => {
        const updatedCategories = { ...categories }
        delete updatedCategories[categoryKey]

        const success = await saveCategories(updatedCategories)

        if (success) {
          // If the deleted category was active, switch to the first available
          if (activeCategory === categoryKey) {
            const firstKey = Object.keys(updatedCategories)[0]
            if (firstKey) {
              setActiveCategory(firstKey)
            }
          }
          showMessage('Categoría eliminada correctamente')
        }
      }
    })
    setConfirmDialogOpen(true)
  }

  const openEditCategoryForm = (categoryKey: string) => {
    setEditingCategoryKey(categoryKey)
    setCategoryFormKey(categoryKey)
    setCategoryFormLabel(categories[categoryKey])
  }

  const ingredientsByCategory = Object.entries(categories).map(([key, label]) => ({
    key,
    label,
    ingredients: ingredients.filter(ing => ing.category === key),
  }))

  const activeIngredients = ingredients.filter(ing => ing.category === activeCategory)

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
    <div className="space-y-6">
      {/* Header Card */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Ingredientes</CardTitle>
              <p className="text-sm text-ios-gray-600 mt-1">
                Edita tu lista de ingredientes de forma rápida y sencilla. Haz clic directamente en cualquier campo para modificarlo.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {showConfirmation && (
                <div className="flex items-center gap-2 text-ios-green font-medium animate-fade-in">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {confirmationMessage}
                </div>
              )}
              <Badge variant="primary" size="sm">
                {ingredients.length} total
              </Badge>
              <Button
                onClick={() => setShowCategoryManager(true)}
                size="sm"
                variant="ghost"
                disabled={isSaving}
                className="text-ios-blue hover:bg-ios-blue/10"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Categorías
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(true)
                  setShowEditForm(false)
                  setFormName('')
                  setFormCategory(activeCategory as keyof typeof INGREDIENT_CATEGORIES)
                  setFormIsAllergen(false)
                }}
                size="sm"
                disabled={isSaving}
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuevo Ingrediente
              </Button>
            </div>
          </div>

          {/* Add/Edit Form */}
          {(showAddForm || showEditForm) && (
            <div className="mt-4 p-4 bg-ios-blue/5 rounded-ios-lg border-2 border-ios-blue/20">
              <h3 className="text-sm font-semibold text-ios-gray-900 mb-3">
                {showEditForm ? `✏️ Editar: ${editingIngredient?.name}` : '➕ Agregar Nuevo Ingrediente'}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-ios-gray-700 mb-1">
                    Nombre del ingrediente
                  </label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej: Quinoa Roja"
                    className="w-full"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        showEditForm ? handleEditIngredient() : handleAddIngredient()
                      }
                    }}
                  />
                </div>
                <div className="space-y-3">
                  {/* Category Selection or Creation */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-ios-gray-700">
                        Categoría
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                        className="text-xs font-medium text-ios-blue hover:underline"
                      >
                        {showNewCategoryInput ? '← Seleccionar existente' : '+ Nueva categoría'}
                      </button>
                    </div>

                    {showNewCategoryInput ? (
                      <div className="space-y-2 p-3 bg-ios-blue/5 rounded-ios-lg border border-ios-blue/20">
                        <div>
                          <Input
                            value={newCategoryLabel}
                            onChange={(e) => setNewCategoryLabel(e.target.value)}
                            placeholder="Nombre de la categoría (ej: Bebidas, Postres, etc.)"
                            className="text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newCategoryLabel.trim()) {
                                handleCreateNewCategoryInline()
                              }
                            }}
                          />
                          <p className="text-xs text-ios-gray-500 mt-1">
                            La clave se generará automáticamente
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={handleCreateNewCategoryInline}
                          disabled={isSaving || !newCategoryLabel.trim()}
                          className="w-full"
                        >
                          {isSaving ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              Creando...
                            </>
                          ) : (
                            'Crear y Usar Categoría'
                          )}
                        </Button>
                      </div>
                    ) : (
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as keyof typeof INGREDIENT_CATEGORIES)}
                        className="w-full px-3 py-2 border border-ios-gray-300 rounded-ios-lg text-sm focus:ring-2 focus:ring-ios-blue focus:border-ios-blue"
                      >
                        {Object.entries(categories).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Allergen Checkbox */}
                  <div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-white border border-ios-gray-300 rounded-ios-lg cursor-pointer hover:bg-ios-gray-50">
                      <input
                        type="checkbox"
                        checked={formIsAllergen}
                        onChange={(e) => setFormIsAllergen(e.target.checked)}
                        className="w-4 h-4 text-ios-orange focus:ring-ios-orange"
                      />
                      <span className="text-sm font-medium text-ios-gray-700">
                        Alérgeno común
                      </span>
                    </label>
                  </div>

                  {/* Diet Type Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-ios-gray-700 mb-1">
                      Tipo Dietético
                    </label>
                    <select
                      value={formDietType}
                      onChange={(e) => setFormDietType(e.target.value as 'vegan' | 'vegetarian' | 'animal')}
                      className="w-full px-3 py-2 border border-ios-gray-300 rounded-ios-lg text-sm focus:ring-2 focus:ring-ios-blue focus:border-ios-blue"
                    >
                      <option value="vegan">🌱 Vegano</option>
                      <option value="vegetarian">🥚 Vegetariano</option>
                      <option value="animal">🥩 Animal</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowAddForm(false)
                      setShowEditForm(false)
                      setEditingIngredient(null)
                      setFormName('')
                    }}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={showEditForm ? handleEditIngredient : handleAddIngredient}
                    disabled={isSaving || !formName.trim()}
                  >
                    {isSaving ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Guardando...
                      </>
                    ) : (
                      showEditForm ? 'Actualizar' : 'Agregar'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Main Content with Sidebar */}
      <div className="flex gap-4">
        {/* Category Sidebar - PROMINENTE */}
        <Card variant="elevated" className="w-64 flex-shrink-0">
          <CardHeader className="pb-3">
            <h3 className="font-bold text-ios-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-ios-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Categorías
            </h3>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1.5">
              {ingredientsByCategory.map(({ key, label, ingredients: catIngredients }) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={cn(
                    'w-full px-4 py-3 text-left text-sm font-medium transition-all rounded-ios-lg border-l-4',
                    activeCategory === key
                      ? 'bg-ios-blue text-white border-ios-blue shadow-ios'
                      : 'border-transparent text-ios-gray-700 hover:bg-ios-gray-100 bg-ios-gray-50'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{label}</span>
                    <Badge
                      variant={activeCategory === key ? "default" : "secondary"}
                      size="sm"
                      className={cn(
                        activeCategory === key && "bg-white/20 text-white"
                      )}
                    >
                      {catIngredients.length}
                    </Badge>
                  </div>
                  <span className={cn(
                    "text-xs",
                    activeCategory === key ? "text-white/80" : "text-ios-gray-500"
                  )}>
                    {catIngredients.length === 1 ? '1 ingrediente' : `${catIngredients.length} ingredientes`}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ingredients Table */}
        <Card variant="elevated" className="flex-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
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
          </CardHeader>
          <CardContent>
            {activeIngredients.length === 0 ? (
              <div className="text-center py-16 bg-ios-gray-50 rounded-ios-lg">
                <svg className="w-20 h-20 mx-auto text-ios-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-lg text-ios-gray-600 font-semibold mb-2">
                  No hay ingredientes en esta categoría
                </p>
                <p className="text-sm text-ios-gray-500">
                  Agrega uno nuevo con el botón "Nuevo Ingrediente"
                </p>
              </div>
            ) : (
              <div className="overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-ios-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-ios-gray-600 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-ios-gray-600 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-ios-gray-600 uppercase tracking-wider">
                        Alérgeno
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-ios-gray-600 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-ios-gray-600 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ios-gray-100">
                    {activeIngredients.map((ingredient) => {
                      const isCustom = ingredient.id.startsWith('custom-')
                      return (
                        <tr
                          key={ingredient.id}
                          className="hover:bg-ios-blue/5 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="font-medium text-ios-gray-900">
                              {ingredient.name}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary" size="sm">
                              {categories[ingredient.category]}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {ingredient.isCommonAllergen ? (
                              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-ios-orange/10 text-ios-orange text-xs font-medium">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Sí
                              </div>
                            ) : (
                              <span className="text-ios-gray-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {ingredient.dietType === 'vegan' && (
                              <Badge variant="success" size="sm">🌱 Vegano</Badge>
                            )}
                            {ingredient.dietType === 'vegetarian' && (
                              <Badge variant="warning" size="sm">🥚 Vegetariano</Badge>
                            )}
                            {ingredient.dietType === 'animal' && (
                              <Badge variant="secondary" size="sm">🥩 Animal</Badge>
                            )}
                            {!ingredient.dietType && (
                              <span className="text-ios-gray-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => openEditForm(ingredient)}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-ios-blue rounded-ios hover:bg-ios-blue/90 transition-ios flex items-center gap-1.5"
                                disabled={isSaving}
                                title="Editar ingrediente"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteIngredient(ingredient)}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-ios-red rounded-ios hover:bg-ios-red/90 transition-ios flex items-center gap-1.5"
                                disabled={isSaving}
                                title="Eliminar ingrediente"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-ios-xl shadow-ios-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-ios-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-ios-gray-900">
                  Gestionar Categorías
                </h2>
                <button
                  onClick={() => {
                    setShowCategoryManager(false)
                    setEditingCategoryKey(null)
                    setCategoryFormKey('')
                    setCategoryFormLabel('')
                  }}
                  className="text-ios-gray-400 hover:text-ios-gray-600 transition-ios"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Add/Edit Form */}
            <div className="px-6 py-4 bg-ios-gray-50 border-b border-ios-gray-200">
              <h3 className="text-sm font-semibold text-ios-gray-900 mb-3">
                {editingCategoryKey ? 'Editar Categoría' : 'Agregar Nueva Categoría'}
              </h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={categoryFormLabel}
                    onChange={(e) => setCategoryFormLabel(e.target.value)}
                    placeholder="Nombre de la categoría (ej: Bebidas, Postres, etc.)"
                    className="flex-1"
                    disabled={isSaving}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && categoryFormLabel.trim()) {
                        editingCategoryKey ? handleEditCategory() : handleAddCategory()
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={editingCategoryKey ? handleEditCategory : handleAddCategory}
                    disabled={isSaving || !categoryFormLabel.trim()}
                  >
                    {isSaving ? <Spinner size="sm" /> : (editingCategoryKey ? 'Actualizar' : 'Agregar')}
                  </Button>
                  {editingCategoryKey && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingCategoryKey(null)
                        setCategoryFormKey('')
                        setCategoryFormLabel('')
                      }}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
                {!editingCategoryKey && (
                  <p className="text-xs text-ios-gray-500">
                    💡 La clave se generará automáticamente en MAYÚSCULAS
                  </p>
                )}
              </div>
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                {Object.entries(categories).map(([key, label]) => {
                  const ingredientCount = ingredients.filter(ing => ing.category === key).length
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 bg-ios-gray-50 rounded-ios-lg border border-ios-gray-200 hover:border-ios-blue/30 transition-all"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-ios-gray-900">{label}</div>
                        <div className="text-xs text-ios-gray-500 flex items-center gap-2">
                          <span>Clave: {key}</span>
                          <span>•</span>
                          <span>{ingredientCount} ingrediente{ingredientCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditCategoryForm(key)}
                          className="px-3 py-1 text-xs font-medium text-ios-blue bg-ios-blue/10 rounded hover:bg-ios-blue/20 transition-ios"
                          disabled={isSaving}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(key)}
                          className="px-3 py-1 text-xs font-medium text-ios-red bg-ios-red/10 rounded hover:bg-ios-red/20 transition-ios"
                          disabled={isSaving || ingredientCount > 0}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-ios-gray-200">
              <Button
                onClick={() => {
                  setShowCategoryManager(false)
                  setEditingCategoryKey(null)
                  setCategoryFormKey('')
                  setCategoryFormLabel('')
                }}
                className="w-full"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={confirmDialogConfig.onConfirm}
        title={confirmDialogConfig.title}
        message={confirmDialogConfig.message}
        variant={confirmDialogConfig.variant}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}
