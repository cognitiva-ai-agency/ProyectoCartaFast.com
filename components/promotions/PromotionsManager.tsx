'use client'

import { useState, useEffect, useCallback } from 'react'
import { MenuItem } from '@/types'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Spinner, ContentEditable } from '@/components/ui'
import { getCurrency } from '@/lib/currencies'
import { ScheduledDiscountsManager } from './ScheduledDiscountsManager'

interface BannerConfig {
  enabled: boolean
  message: string
  backgroundColor: string
  textColor: string
}

export interface PromotionsManagerProps {
  restaurantSlug: string
}

/**
 * Promotions Manager Component
 * Manages promotional items and banner configuration with auto-save
 */
export function PromotionsManager({ restaurantSlug }: PromotionsManagerProps) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>({
    enabled: false,
    message: 'Ofertas especiales disponibles',
    backgroundColor: '#FF9500',
    textColor: '#FFFFFF'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingBanner, setIsSavingBanner] = useState(false)
  const [currency, setCurrency] = useState('CLP')
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadData()
  }, [restaurantSlug])

  // Auto-save banner configuration when it changes
  useEffect(() => {
    if (isLoading) return // Don't save on initial load

    // Clear previous timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    // Set new timeout for debounced save
    const timeout = setTimeout(() => {
      saveBannerConfig()
    }, 500) // Save after 500ms of no changes

    setSaveTimeout(timeout)

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [bannerConfig, isLoading])

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Load items
      const itemsRes = await fetch(`/api/restaurants/${restaurantSlug}/items`, { cache: 'no-store' })
      const itemsData = await itemsRes.json()
      setItems(itemsData)

      // Load banner config
      const bannerRes = await fetch(`/api/restaurants/${restaurantSlug}/banner`, { cache: 'no-store' })
      const bannerData = await bannerRes.json()
      setBannerConfig(bannerData)

      // Load currency
      const themeRes = await fetch(`/api/restaurants/${restaurantSlug}/theme`, { cache: 'no-store' })
      const themeData = await themeRes.json()
      setCurrency(themeData.currency || 'CLP')
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const saveBannerConfig = async () => {
    try {
      setIsSavingBanner(true)
      await fetch(`/api/restaurants/${restaurantSlug}/banner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerConfig)
      })
    } catch (err) {
      console.error('Error saving banner:', err)
    } finally {
      setIsSavingBanner(false)
    }
  }

  const handleUpdateItem = async (itemId: string, updates: Partial<MenuItem>) => {
    try {
      // Update local state first for instant feedback
      const updatedItems = items.map(item =>
        item.id === itemId ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
      )
      setItems(updatedItems)

      // Send all items to API (endpoint expects full array)
      const res = await fetch(`/api/restaurants/${restaurantSlug}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItems)
      })

      if (!res.ok) {
        console.error('Failed to save item update')
        // Revert on error
        loadData()
      }
    } catch (err) {
      console.error('Error updating item:', err)
      // Revert on error
      loadData()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  const promotionItems = items.filter(item => item.is_promotion)
  const currencyData = getCurrency(currency)

  const formatPrice = (price: number): string => {
    const fixed = price.toFixed(currencyData.decimals)
    const [intPart, decPart] = fixed.split('.')
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return currencyData.decimals > 0 ? `${formattedInt},${decPart}` : formattedInt
  }

  return (
    <div className="space-y-6">
      {/* Banner Configuration */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Configuración del Banner de Ofertas</CardTitle>
            {isSavingBanner && (
              <div className="flex items-center gap-2 text-sm text-ios-gray-600">
                <Spinner size="sm" />
                <span>Guardando...</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Toggle Banner */}
            <div className="flex items-center justify-between p-4 bg-ios-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-lg">Mostrar Banner en Menú Público</h3>
                <p className="text-sm text-ios-gray-600 mt-1">
                  Activa el banner para destacar tus ofertas en la parte superior del menú
                </p>
              </div>
              <button
                onClick={() => setBannerConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  bannerConfig.enabled ? 'bg-ios-green' : 'bg-ios-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    bannerConfig.enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Banner Message */}
            <div>
              <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                Mensaje del Banner (puedes usar saltos de línea)
              </label>
              <textarea
                value={bannerConfig.message}
                onChange={(e) => setBannerConfig(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-3 border border-ios-gray-300 rounded-lg focus:ring-2 focus:ring-ios-blue focus:border-transparent resize-y min-h-[80px]"
                placeholder="Ej: ¡Ofertas especiales disponibles!&#10;Happy Hour de 18:00 a 20:00"
                rows={3}
              />
            </div>

            {/* Color Configuration */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                  Color de Fondo
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bannerConfig.backgroundColor}
                    onChange={(e) => setBannerConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-16 h-12 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={bannerConfig.backgroundColor}
                    onChange={(e) => setBannerConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-ios-gray-300 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                  Color de Texto
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bannerConfig.textColor}
                    onChange={(e) => setBannerConfig(prev => ({ ...prev, textColor: e.target.value }))}
                    className="w-16 h-12 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={bannerConfig.textColor}
                    onChange={(e) => setBannerConfig(prev => ({ ...prev, textColor: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-ios-gray-300 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Banner Preview */}
            <div>
              <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                Vista Previa
              </label>
              <div
                className="p-4 rounded-lg text-center font-semibold transition-all whitespace-pre-wrap"
                style={{
                  backgroundColor: bannerConfig.backgroundColor,
                  color: bannerConfig.textColor
                }}
              >
                {bannerConfig.message}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promotions Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-ios-blue mb-2">
                {promotionItems.length}
              </div>
              <div className="text-sm text-ios-gray-600">
                Platos en Promoción Manual
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-ios-green mb-2">
                {items.length}
              </div>
              <div className="text-sm text-ios-gray-600">
                Total de Platos
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-ios-orange mb-2">
                {items.length > 0 ? Math.round((promotionItems.length / items.length) * 100) : 0}%
              </div>
              <div className="text-sm text-ios-gray-600">
                En Promoción
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Discounts Manager */}
      <ScheduledDiscountsManager restaurantSlug={restaurantSlug} />

      {/* Promotional Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Platos en Promoción - Edición Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          {promotionItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏷️</div>
              <h3 className="text-xl font-semibold text-ios-gray-700 mb-2">
                No hay platos en promoción
              </h3>
              <p className="text-ios-gray-500">
                Marca platos como promoción desde el Editor de Menú para verlos aquí
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {promotionItems.map((item) => (
                <EditablePromotionItem
                  key={item.id}
                  item={item}
                  currency={currency}
                  currencyData={currencyData}
                  formatPrice={formatPrice}
                  onUpdate={handleUpdateItem}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <div className="bg-ios-blue/5 rounded-2xl p-6 border border-ios-blue/20">
        <h4 className="font-semibold text-ios-blue mb-3 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Cómo gestionar tus ofertas
        </h4>
        <ul className="space-y-2 text-sm text-ios-gray-700">
          <li>• <strong>Descuentos Programados:</strong> Usa la nueva sección de "Descuentos Programados" para crear ofertas automáticas por horario (ej: Happy Hour)</li>
          <li>• <strong>Promociones Manuales:</strong> Ve al Editor de Menú y usa el ícono 💵/🏷️ para marcar platos individuales como promoción</li>
          <li>• <strong>Edición rápida:</strong> Haz clic en el nombre, descripción o precios de los platos para editarlos directamente aquí</li>
          <li>• <strong>Banner:</strong> El banner se actualiza automáticamente sin necesidad de guardar manualmente</li>
          <li>• <strong>Zona horaria:</strong> Los descuentos programados usan la zona horaria configurada en Configuraciones</li>
        </ul>
      </div>
    </div>
  )
}

/**
 * Editable Promotion Item Component
 */
function EditablePromotionItem({
  item,
  currency,
  currencyData,
  formatPrice,
  onUpdate
}: {
  item: MenuItem
  currency: string
  currencyData: any
  formatPrice: (price: number) => string
  onUpdate: (itemId: string, updates: Partial<MenuItem>) => void
}) {
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [isEditingPromoPrice, setIsEditingPromoPrice] = useState(false)

  const handlePriceChange = (newValue: string) => {
    const numValue = parseFloat(newValue.replace(/\./g, '').replace(',', '.'))
    if (!isNaN(numValue)) {
      onUpdate(item.id, { price: numValue })
    }
  }

  const handlePromoPriceChange = (newValue: string) => {
    const numValue = parseFloat(newValue.replace(/\./g, '').replace(',', '.'))
    if (!isNaN(numValue)) {
      onUpdate(item.id, { promotion_price: numValue })
    }
  }

  const handleStopPromotion = () => {
    onUpdate(item.id, { is_promotion: false, promotion_price: undefined })
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-ios-gray-50 rounded-lg hover:shadow-md transition-shadow border-2 border-transparent hover:border-ios-blue/20">
      {item.image_url && (
        <div className="w-20 h-20 rounded-lg overflow-hidden border border-ios-gray-200 flex-shrink-0">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <ContentEditable
            value={item.name}
            onChange={(newName) => onUpdate(item.id, { name: newName })}
            className="font-semibold text-lg text-ios-gray-900 hover:bg-white hover:px-2 hover:py-1 rounded transition-all"
            placeholder="Nombre del plato"
          />
          <Badge variant="danger" size="sm">Promo</Badge>
          <button
            onClick={handleStopPromotion}
            className="text-xs text-ios-gray-500 hover:text-ios-red hover:bg-ios-red/10 px-2 py-1 rounded transition-all"
            title="Detener promoción"
          >
            ✕ Detener
          </button>
        </div>
        <ContentEditable
          value={item.description || ''}
          onChange={(newDesc) => onUpdate(item.id, { description: newDesc })}
          className="text-sm text-ios-gray-600 hover:bg-white hover:px-2 hover:py-1 rounded transition-all"
          placeholder="Descripción (haz clic para editar)"
          multiline
        />
      </div>

      <div className="flex flex-col items-end gap-2">
        {/* Promotion Price */}
        <div className="flex items-center gap-1 bg-ios-red/10 px-3 py-2 rounded-lg border-2 border-ios-red/20 hover:border-ios-red/40 transition-all">
          <span className="text-xs font-medium text-ios-red">{currencyData.symbol}</span>
          <ContentEditable
            value={isEditingPromoPrice ? String(item.promotion_price || 0) : formatPrice(item.promotion_price || 0)}
            onChange={handlePromoPriceChange}
            onFocus={() => setIsEditingPromoPrice(true)}
            onBlur={() => setIsEditingPromoPrice(false)}
            placeholder="0"
            className="text-xl font-bold text-ios-red min-w-[60px] hover:bg-white hover:px-2 hover:py-1 rounded"
          />
        </div>

        {/* Original Price */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-ios-gray-500">{currencyData.symbol}</span>
          <ContentEditable
            value={isEditingPrice ? String(item.price) : formatPrice(item.price)}
            onChange={handlePriceChange}
            onFocus={() => setIsEditingPrice(true)}
            onBlur={() => setIsEditingPrice(false)}
            placeholder="0"
            className="text-sm text-ios-gray-500 line-through min-w-[50px] hover:bg-white hover:px-2 hover:py-1 rounded"
          />
        </div>

        {/* Savings Badge */}
        {item.promotion_price && (
          <Badge variant="success" size="sm">
            Ahorro: {currencyData.symbol} {formatPrice(item.price - item.promotion_price)}
          </Badge>
        )}
      </div>
    </div>
  )
}
