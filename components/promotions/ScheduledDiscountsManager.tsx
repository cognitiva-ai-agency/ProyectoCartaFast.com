'use client'

import { useState, useEffect } from 'react'
import { ScheduledDiscount, Category } from '@/types'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Spinner, Select, Input, ConfirmDialog } from '@/components/ui'
import { cn } from '@/lib/utils'
import { getNextActivation, formatTimeRemaining } from '@/lib/scheduled-discounts'

export interface ScheduledDiscountsManagerProps {
  restaurantSlug: string
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
]

/**
 * Scheduled Discounts Manager Component
 * Manages automatic time-based discounts by category
 */
export function ScheduledDiscountsManager({ restaurantSlug }: ScheduledDiscountsManagerProps) {
  const [discounts, setDiscounts] = useState<ScheduledDiscount[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [timezone, setTimezone] = useState('America/Santiago')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [discountToDelete, setDiscountToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<ScheduledDiscount>>({
    name: '',
    category_id: '',
    discount_percentage: 10,
    days_of_week: [],
    start_time: '17:00',
    end_time: '19:00',
    is_active: true
  })

  useEffect(() => {
    loadData()
  }, [restaurantSlug])

  // Update current time every minute for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Load categories
      const categoriesRes = await fetch(`/api/restaurants/${restaurantSlug}/categories`, { cache: 'no-store' })
      const categoriesData = await categoriesRes.json()
      setCategories(categoriesData)

      // Load scheduled discounts
      const discountsRes = await fetch(`/api/restaurants/${restaurantSlug}/scheduled-discounts`, { cache: 'no-store' })
      const discountsData = await discountsRes.json()
      setDiscounts(discountsData.discounts || [])

      // Load timezone from theme
      const themeRes = await fetch(`/api/restaurants/${restaurantSlug}/theme`, { cache: 'no-store' })
      const themeData = await themeRes.json()
      setTimezone(themeData.timezone || 'America/Santiago')
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const saveDiscounts = async (updatedDiscounts: ScheduledDiscount[]) => {
    try {
      await fetch(`/api/restaurants/${restaurantSlug}/scheduled-discounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discounts: updatedDiscounts })
      })
    } catch (err) {
      console.error('Error saving discounts:', err)
    }
  }

  const handleCreateOrUpdate = async () => {
    if (!formData.name || !formData.category_id || !formData.days_of_week || formData.days_of_week.length === 0) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    if (editingId) {
      // Update existing discount
      const updatedDiscounts = discounts.map(d =>
        d.id === editingId
          ? { ...d, ...formData, updated_at: new Date().toISOString() } as ScheduledDiscount
          : d
      )
      setDiscounts(updatedDiscounts)
      await saveDiscounts(updatedDiscounts)
      setEditingId(null)
    } else {
      // Create new discount
      const newDiscount: ScheduledDiscount = {
        id: `discount-${Date.now()}`,
        restaurant_id: restaurantSlug,
        name: formData.name!,
        category_id: formData.category_id!,
        discount_percentage: formData.discount_percentage || 10,
        days_of_week: formData.days_of_week!,
        start_time: formData.start_time || '17:00',
        end_time: formData.end_time || '19:00',
        is_active: formData.is_active !== undefined ? formData.is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const updatedDiscounts = [...discounts, newDiscount]
      setDiscounts(updatedDiscounts)
      await saveDiscounts(updatedDiscounts)
    }

    // Reset form
    setFormData({
      name: '',
      category_id: '',
      discount_percentage: 10,
      days_of_week: [],
      start_time: '17:00',
      end_time: '19:00',
      is_active: true
    })
    setShowCreateForm(false)
  }

  const handleEdit = (discount: ScheduledDiscount) => {
    setFormData({
      name: discount.name,
      category_id: discount.category_id,
      discount_percentage: discount.discount_percentage,
      days_of_week: discount.days_of_week,
      start_time: discount.start_time,
      end_time: discount.end_time,
      is_active: discount.is_active
    })
    setEditingId(discount.id)
    setShowCreateForm(true)
  }

  const handleDelete = (discountId: string) => {
    setDiscountToDelete(discountId)
    setConfirmDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!discountToDelete) return

    const updatedDiscounts = discounts.filter(d => d.id !== discountToDelete)
    setDiscounts(updatedDiscounts)
    await saveDiscounts(updatedDiscounts)

    setDiscountToDelete(null)
    setConfirmDialogOpen(false)
  }

  const handleToggleActive = async (discountId: string) => {
    const updatedDiscounts = discounts.map(d =>
      d.id === discountId
        ? { ...d, is_active: !d.is_active, updated_at: new Date().toISOString() }
        : d
    )
    setDiscounts(updatedDiscounts)
    await saveDiscounts(updatedDiscounts)
  }

  const handleToggleDay = (day: number) => {
    const current = formData.days_of_week || []
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day].sort((a, b) => a - b)
    setFormData({ ...formData, days_of_week: updated })
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Categoría desconocida'
  }

  const getDaysLabel = (days: number[]) => {
    if (days.length === 7) return 'Todos los días'
    if (days.length === 0) return 'Ningún día'
    return days
      .map(d => {
        const dayObj = DAYS_OF_WEEK.find(day => day.value === d)
        return dayObj ? dayObj.label.substring(0, 3) : ''
      })
      .join(', ')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Descuentos Programados por Categoría</CardTitle>
              <p className="text-sm text-ios-gray-600 mt-1">
                Configura descuentos automáticos por horario para categorías específicas (ej: Happy Hour)
              </p>
            </div>
            <Button
              onClick={() => {
                setShowCreateForm(!showCreateForm)
                setEditingId(null)
                setFormData({
                  name: '',
                  category_id: '',
                  discount_percentage: 10,
                  days_of_week: [],
                  start_time: '17:00',
                  end_time: '19:00',
                  is_active: true
                })
              }}
              size="sm"
            >
              {showCreateForm ? '✕ Cancelar' : '+ Nuevo Descuento'}
            </Button>
          </div>
        </CardHeader>

        {showCreateForm && (
          <CardContent className="border-t border-ios-gray-200">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Name */}
                <Input
                  label="Nombre del Descuento"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Happy Hour Bebidas"
                />

                {/* Category */}
                <div>
                  <Select
                    label="Categoría"
                    value={formData.category_id || ''}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    options={[
                      { value: '', label: 'Selecciona una categoría' },
                      ...categories.map(cat => ({ value: cat.id, label: cat.name }))
                    ]}
                  />
                </div>
              </div>

              {/* Discount Percentage */}
              <div>
                <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                  Porcentaje de Descuento: {formData.discount_percentage}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="70"
                  step="5"
                  value={formData.discount_percentage || 10}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) })}
                  className="w-full h-2 bg-ios-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-ios-gray-500 mt-1">
                  <span>5%</span>
                  <span>70%</span>
                </div>
              </div>

              {/* Days of Week */}
              <div>
                <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                  Días de la Semana
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day.value}
                      onClick={() => handleToggleDay(day.value)}
                      className={cn(
                        'px-4 py-2 rounded-lg font-medium transition-all text-sm',
                        formData.days_of_week?.includes(day.value)
                          ? 'bg-ios-blue text-white'
                          : 'bg-ios-gray-100 text-ios-gray-700 hover:bg-ios-gray-200'
                      )}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  type="time"
                  label="Hora de Inicio"
                  value={formData.start_time || ''}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
                <Input
                  type="time"
                  label="Hora de Fin"
                  value={formData.end_time || ''}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-ios-gray-200">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingId(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateOrUpdate}>
                  {editingId ? 'Actualizar Descuento' : 'Crear Descuento'}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Discounts List */}
      {discounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-ios-gray-700 mb-2">
              No hay descuentos programados
            </h3>
            <p className="text-ios-gray-500 mb-4">
              Crea tu primer descuento programado para aplicar ofertas automáticas por horario
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              Crear Primer Descuento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {discounts.map(discount => {
            const activation = getNextActivation(discount, timezone, currentTime)

            return (
              <Card key={discount.id} variant="elevated">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-ios-gray-900">{discount.name}</h3>
                        <Badge variant={discount.is_active ? 'success' : 'default'} size="sm">
                          {discount.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Badge variant="info" size="sm">
                          {discount.discount_percentage}% OFF
                        </Badge>

                        {/* Countdown Badge */}
                        {activation.isActiveNow ? (
                          <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                            <span>DESCUENTO ACTIVO</span>
                            {activation.timeUntilNext && activation.timeUntilNext > 0 && (
                              <>
                                <span>·</span>
                                <span>Termina en {formatTimeRemaining(activation.timeUntilNext)}</span>
                              </>
                            )}
                          </div>
                        ) : activation.timeUntilNext !== null ? (
                          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Inicia en {formatTimeRemaining(activation.timeUntilNext)}</span>
                            {activation.nextDay !== 'Hoy' && (
                              <>
                                <span>·</span>
                                <span>{activation.nextDay}</span>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-gray-400 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                            <span>Sin programación</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-ios-gray-600">
                          <span className="font-medium">Categoría:</span>
                          <span>{getCategoryName(discount.category_id)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-ios-gray-600">
                          <span className="font-medium">Días:</span>
                          <span>{getDaysLabel(discount.days_of_week)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-ios-gray-600">
                          <span className="font-medium">Horario:</span>
                          <span>{discount.start_time} - {discount.end_time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleToggleActive(discount.id)}
                        className={cn(
                          'px-4 py-2 rounded-lg font-medium transition-all text-sm',
                          discount.is_active
                            ? 'bg-ios-orange/10 text-ios-orange hover:bg-ios-orange/20'
                            : 'bg-ios-green/10 text-ios-green hover:bg-ios-green/20'
                        )}
                      >
                        {discount.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleEdit(discount)}
                        className="px-4 py-2 rounded-lg font-medium transition-all text-sm bg-ios-blue/10 text-ios-blue hover:bg-ios-blue/20"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(discount.id)}
                        className="px-4 py-2 rounded-lg font-medium transition-all text-sm bg-ios-red/10 text-ios-red hover:bg-ios-red/20"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Help Section */}
      <div className="bg-ios-blue/5 rounded-2xl p-6 border border-ios-blue/20">
        <h4 className="font-semibold text-ios-blue mb-3 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Cómo funcionan los descuentos programados
        </h4>
        <ul className="space-y-2 text-sm text-ios-gray-700">
          <li>• <strong>Contador en tiempo real:</strong> Cada descuento muestra cuánto falta para activarse o cuánto tiempo queda activo</li>
          <li>• <strong>DESCUENTO ACTIVO:</strong> El badge verde pulsante indica que el descuento está activo en este momento y muestra cuánto tiempo queda</li>
          <li>• <strong>Próxima activación:</strong> El badge naranja muestra cuánto falta para que se active el descuento</li>
          <li>• <strong>Automático:</strong> Los descuentos se aplican automáticamente a todos los platos de la categoría en el horario configurado</li>
          <li>• <strong>Actualización en tiempo real:</strong> Los descuentos se activan/desactivan automáticamente cada minuto según el horario</li>
          <li>• <strong>Días recurrentes:</strong> Puedes seleccionar múltiples días de la semana para que el descuento se repita</li>
          <li>• <strong>Zona horaria:</strong> Los horarios se aplican según la zona horaria configurada en Configuraciones</li>
          <li>• <strong>Activar/Desactivar:</strong> Puedes pausar temporalmente un descuento sin eliminarlo</li>
        </ul>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false)
          setDiscountToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="¿Eliminar descuento programado?"
        message={`¿Estás seguro de que deseas eliminar este descuento programado? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        icon="🗑️"
      />
    </div>
  )
}
