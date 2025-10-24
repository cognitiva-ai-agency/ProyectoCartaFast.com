'use client'

import { useState, useEffect } from 'react'
import { DEMO_THEMES } from '@/lib/demo-data'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Select, Toast, ImageUploader, Input } from '@/components/ui'
import { Theme } from '@/types'
import { cn } from '@/lib/utils'
import { getAllCurrencies, getCurrency, formatPrice } from '@/lib/currencies'

const DEMO_THEME_KEY = 'menuscarta_demo_theme_id'
const DEMO_THEME_CONFIG_KEY = 'menuscarta_demo_theme_config'

/**
 * Demo Theme Selector - Works without Supabase
 * Persists theme selection in localStorage and syncs across tabs
 */
export function DemoThemeSelector() {
  const [currentThemeId, setCurrentThemeId] = useState(DEMO_THEMES[0].id)
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [currentCurrency, setCurrentCurrency] = useState('EUR')
  const [restaurantName, setRestaurantName] = useState('Restaurante Demo')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoStyle, setLogoStyle] = useState<'circular' | 'rectangular' | 'none'>('circular')
  const [timezone, setTimezone] = useState('America/Santiago')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Load theme from filesystem on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const res = await fetch('/api/restaurants/restoran1/theme')
        if (res.ok) {
          const themeData = await res.json()
          setCurrentThemeId(themeData.themeId)
          setCurrentCurrency(themeData.currency)
          setRestaurantName(themeData.restaurantName || 'Restaurante Demo')
          setLogoUrl(themeData.logoUrl || '')
          setLogoStyle(themeData.logoStyle || 'circular')
          setTimezone(themeData.timezone || 'America/Santiago')
        }
      } catch (err) {
        console.error('Error loading theme:', err)
      }
    }

    loadTheme()
  }, [])

  // Listen for theme changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === DEMO_THEME_KEY && e.newValue) {
        setCurrentThemeId(e.newValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleSelectTheme = (theme: Theme) => {
    setSelectedTheme(theme)
  }

  const handleApplyTheme = async () => {
    if (selectedTheme) {
      try {
        // Save to filesystem via API
        await fetch('/api/restaurants/restoran1/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            themeId: selectedTheme.id,
            currency: currentCurrency,
            restaurantName,
            logoUrl,
            logoStyle,
            timezone
          })
        })

        // Update state
        setCurrentThemeId(selectedTheme.id)
        setSelectedTheme(null)

        // Dispatch custom event for same-tab sync
        window.dispatchEvent(new CustomEvent('demo-theme-change', {
          detail: { themeId: selectedTheme.id, currency: currentCurrency, restaurantName, logoUrl, logoStyle }
        }))

        setToast({
          message: `Tema "${selectedTheme.name}" aplicado correctamente.\n\nAbre el menú público para ver el cambio inmediatamente.`,
          type: 'success'
        })
      } catch (err) {
        console.error('Error aplicando tema:', err)
        setToast({
          message: 'Error al guardar el tema. Por favor intenta nuevamente.',
          type: 'error'
        })
      }
    }
  }

  const handleRestaurantNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setRestaurantName(newName)

    try {
      await fetch('/api/restaurants/restoran1/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: currentThemeId,
          currency: currentCurrency,
          restaurantName: newName,
          logoUrl,
          logoStyle,
          timezone
        })
      })

      window.dispatchEvent(new CustomEvent('demo-theme-change', {
        detail: { themeId: currentThemeId, currency: currentCurrency, restaurantName: newName, logoUrl, logoStyle }
      }))
    } catch (err) {
      console.error('Error guardando nombre:', err)
    }
  }

  const handleLogoChange = async (newLogoUrl: string) => {
    setLogoUrl(newLogoUrl)

    try {
      await fetch('/api/restaurants/restoran1/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: currentThemeId,
          currency: currentCurrency,
          restaurantName,
          logoUrl: newLogoUrl,
          logoStyle,
          timezone
        })
      })

      window.dispatchEvent(new CustomEvent('demo-theme-change', {
        detail: { themeId: currentThemeId, currency: currentCurrency, restaurantName, logoUrl: newLogoUrl, logoStyle }
      }))

      setToast({
        message: 'Logo actualizado correctamente',
        type: 'success'
      })
    } catch (err) {
      console.error('Error guardando logo:', err)
      setToast({
        message: 'Error al guardar el logo',
        type: 'error'
      })
    }
  }

  const handleLogoStyleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStyle = e.target.value as 'circular' | 'rectangular' | 'none'
    setLogoStyle(newStyle)

    try {
      await fetch('/api/restaurants/restoran1/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: currentThemeId,
          currency: currentCurrency,
          restaurantName,
          logoUrl,
          logoStyle: newStyle,
          timezone
        })
      })

      window.dispatchEvent(new CustomEvent('demo-theme-change', {
        detail: { themeId: currentThemeId, currency: currentCurrency, restaurantName, logoUrl, logoStyle: newStyle }
      }))
    } catch (err) {
      console.error('Error guardando estilo de logo:', err)
    }
  }

  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value
    setCurrentCurrency(newCurrency)

    try {
      // Save to filesystem via API
      await fetch('/api/restaurants/restoran1/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: currentThemeId,
          currency: newCurrency,
          restaurantName,
          logoUrl,
          logoStyle,
          timezone
        })
      })

      // Update theme in DEMO_THEMES (in-memory modification for demo)
      const currentTheme = DEMO_THEMES.find(t => t.id === currentThemeId)
      if (currentTheme) {
        currentTheme.config.currency = newCurrency
      }

      // Dispatch event to update public menu
      window.dispatchEvent(new CustomEvent('demo-theme-change', {
        detail: { themeId: currentThemeId, currency: newCurrency, restaurantName, logoUrl, logoStyle }
      }))
    } catch (err) {
      console.error('Error guardando moneda:', err)
    }
  }

  const handleTimezoneChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimezone = e.target.value
    setTimezone(newTimezone)

    try {
      await fetch('/api/restaurants/restoran1/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: currentThemeId,
          currency: currentCurrency,
          restaurantName,
          logoUrl,
          logoStyle,
          timezone: newTimezone
        })
      })

      window.dispatchEvent(new CustomEvent('demo-theme-change', {
        detail: { themeId: currentThemeId, currency: currentCurrency, restaurantName, logoUrl, logoStyle, timezone: newTimezone }
      }))
    } catch (err) {
      console.error('Error guardando zona horaria:', err)
    }
  }

  const currentTheme = DEMO_THEMES.find(t => t.id === currentThemeId)
  const currencies = getAllCurrencies()
  const currentCurrencyData = getCurrency(currentCurrency)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Temas de Diseño</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-ios-gray-600 mb-4">
            Elige un tema prediseñado para tu menú. Los cambios se aplicarán inmediatamente.
          </p>

          {currentTheme && (
            <div className="bg-ios-blue/5 rounded-ios-lg p-4 border border-ios-blue/20">
              <p className="text-sm text-ios-gray-700">
                <strong>Tema actual:</strong> {currentTheme.name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restaurant Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Restaurante</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-ios-gray-600 mb-4 text-sm">
            Personaliza el nombre y logo de tu restaurante
          </p>

          <div className="space-y-6">
            {/* Restaurant Name */}
            <div>
              <Input
                label="Nombre del Restaurante"
                value={restaurantName}
                onChange={handleRestaurantNameChange}
                placeholder="Ej: La Trattoria"
              />
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                Logo del Restaurante
              </label>

              {logoUrl ? (
                <div className="space-y-4">
                  {/* Logo Preview and Controls */}
                  <div className="bg-ios-gray-50 rounded-ios-lg p-4">
                    <p className="text-sm font-medium text-ios-gray-700 mb-3">Vista previa del logo:</p>
                    <div className="flex gap-4 items-start">
                      {/* Miniatura del Logo - Clickeable */}
                      <button
                        onClick={() => setLogoUrl('')}
                        className="relative flex items-center justify-center flex-shrink-0 group cursor-pointer transition-transform hover:scale-105"
                        title="Editar logo"
                      >
                        <img
                          src={logoUrl.startsWith('data:') ? logoUrl : `${logoUrl}?t=${Date.now()}`}
                          alt="Logo del restaurante"
                          className={cn(
                            "max-w-[120px] max-h-[120px] object-contain bg-white p-2",
                            logoStyle === 'circular' && 'rounded-full border-2 border-ios-gray-300',
                            logoStyle === 'rectangular' && 'rounded-ios-lg border-2 border-ios-gray-300',
                            logoStyle === 'none' && 'rounded-none'
                          )}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        {/* Hover Overlay */}
                        <div className={cn(
                          "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center",
                          logoStyle === 'circular' && 'rounded-full',
                          logoStyle === 'rectangular' && 'rounded-ios-lg',
                          logoStyle === 'none' && 'rounded-none'
                        )}>
                          <span className="text-white text-xs font-semibold">✏️ Editar</span>
                        </div>
                      </button>

                      {/* Style Selector */}
                      <div className="flex-1">
                        <p className="text-xs font-medium text-ios-gray-700 mb-2">Estilo del logo:</p>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="logoStyle"
                              value="circular"
                              checked={logoStyle === 'circular'}
                              onChange={handleLogoStyleChange}
                              className="w-4 h-4 text-ios-blue focus:ring-ios-blue"
                            />
                            <span className="text-sm text-ios-gray-900">Circular (redondo)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="logoStyle"
                              value="rectangular"
                              checked={logoStyle === 'rectangular'}
                              onChange={handleLogoStyleChange}
                              className="w-4 h-4 text-ios-blue focus:ring-ios-blue"
                            />
                            <span className="text-sm text-ios-gray-900">Rectangular (con bordes redondeados)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="logoStyle"
                              value="none"
                              checked={logoStyle === 'none'}
                              onChange={handleLogoStyleChange}
                              className="w-4 h-4 text-ios-blue focus:ring-ios-blue"
                            />
                            <span className="text-sm text-ios-gray-900">Sin bordes (cuadrado)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <ImageUploader
                  value=""
                  onChange={handleLogoChange}
                  label=""
                  placeholder="Sube el logo de tu restaurante"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Moneda</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-ios-gray-600 mb-4 text-sm">
            Selecciona la moneda que se mostrará en tu menú
          </p>

          <div className="space-y-4">
            <div>
              <Select
                label="Moneda"
                value={currentCurrency}
                onChange={handleCurrencyChange}
                options={currencies.map((currency) => ({
                  value: currency.code,
                  label: `${currency.name} (${currency.symbol})`
                }))}
              />
            </div>

            {/* Preview */}
            <div className="bg-ios-gray-50 rounded-ios-lg p-4">
              <p className="text-xs font-medium text-ios-gray-700 mb-2">
                Vista previa de precios:
              </p>
              <div className="space-y-1">
                <p className="text-sm text-ios-gray-900">
                  <span className="text-ios-gray-600">Plato normal:</span>{' '}
                  <span className="font-semibold">{formatPrice(12.50, currentCurrency)}</span>
                </p>
                <p className="text-sm text-ios-gray-900">
                  <span className="text-ios-gray-600">Plato premium:</span>{' '}
                  <span className="font-semibold">{formatPrice(24.99, currentCurrency)}</span>
                </p>
                <p className="text-sm text-ios-gray-900">
                  <span className="text-ios-gray-600">Bebida:</span>{' '}
                  <span className="font-semibold">{formatPrice(3.50, currentCurrency)}</span>
                </p>
              </div>
            </div>

            {/* Currency Info */}
            <div className="bg-ios-blue/5 rounded-ios-lg p-3 border border-ios-blue/20">
              <p className="text-xs text-ios-gray-700">
                <strong>💡 Info:</strong> {currentCurrencyData.name} utiliza{' '}
                {currentCurrencyData.decimals === 0 ? 'sin decimales' : `${currentCurrencyData.decimals} decimales`}
                {' '}y el símbolo "{currentCurrencyData.symbol}" se muestra{' '}
                {currentCurrencyData.position === 'before' ? 'antes' : 'después'} del precio.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timezone Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Zona Horaria</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-ios-gray-600 mb-4 text-sm">
            Configura la zona horaria para programar ofertas y descuentos
          </p>

          <div className="space-y-4">
            <div>
              <Select
                label="Zona Horaria"
                value={timezone}
                onChange={handleTimezoneChange}
                options={[
                  { value: 'America/Santiago', label: 'Santiago (Chile) - CLT (UTC-3/UTC-4)' },
                  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (Argentina) - ART (UTC-3)' },
                  { value: 'America/Sao_Paulo', label: 'São Paulo (Brasil) - BRT (UTC-3)' },
                  { value: 'America/Lima', label: 'Lima (Perú) - PET (UTC-5)' },
                  { value: 'America/Bogota', label: 'Bogotá (Colombia) - COT (UTC-5)' },
                  { value: 'America/Mexico_City', label: 'Ciudad de México (México) - CST (UTC-6)' },
                  { value: 'America/Caracas', label: 'Caracas (Venezuela) - VET (UTC-4)' },
                  { value: 'America/Guayaquil', label: 'Guayaquil (Ecuador) - ECT (UTC-5)' },
                  { value: 'America/La_Paz', label: 'La Paz (Bolivia) - BOT (UTC-4)' },
                  { value: 'America/Asuncion', label: 'Asunción (Paraguay) - PYT (UTC-4/UTC-3)' },
                  { value: 'America/Montevideo', label: 'Montevideo (Uruguay) - UYT (UTC-3)' },
                  { value: 'Europe/Madrid', label: 'Madrid (España) - CET (UTC+1/UTC+2)' },
                  { value: 'Europe/London', label: 'Londres (Reino Unido) - GMT (UTC+0/UTC+1)' },
                  { value: 'America/New_York', label: 'Nueva York (EE.UU.) - EST (UTC-5/UTC-4)' },
                  { value: 'America/Los_Angeles', label: 'Los Ángeles (EE.UU.) - PST (UTC-8/UTC-7)' },
                ]}
              />
            </div>

            {/* Timezone Info */}
            <div className="bg-ios-blue/5 rounded-ios-lg p-3 border border-ios-blue/20">
              <p className="text-xs text-ios-gray-700">
                <strong>💡 Info:</strong> La zona horaria se utiliza para programar ofertas y descuentos por horario.
                Los cambios se aplicarán según el horario local seleccionado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Themes Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {DEMO_THEMES.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isActive={theme.id === currentThemeId}
            isSelected={selectedTheme?.id === theme.id}
            onSelect={handleSelectTheme}
          />
        ))}
      </div>

      {/* Apply Button */}
      {selectedTheme && selectedTheme.id !== currentThemeId && (
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  ¿Aplicar tema "{selectedTheme.name}"?
                </h3>
                <p className="text-sm text-ios-gray-600 mt-1">
                  El cambio se verá reflejado inmediatamente en tu menú público
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedTheme(null)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleApplyTheme}
                  size="lg"
                >
                  Aplicar Tema
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Notice */}
      <div className="bg-ios-yellow/10 border border-ios-yellow/30 rounded-ios-lg p-6 text-center">
        <p className="text-sm text-ios-gray-700 flex items-center justify-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
          </svg>
          <span>
            <strong>Modo Demo:</strong> Estás usando la versión demo. Los cambios de tema solo se guardan en esta sesión.
          </span>
        </p>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

function ThemeCard({
  theme,
  isActive,
  isSelected,
  onSelect,
}: {
  theme: Theme
  isActive: boolean
  isSelected: boolean
  onSelect: (theme: Theme) => void
}) {
  const config = theme.config

  return (
    <div
      className={cn(
        'relative cursor-pointer transition-all rounded-ios-xl overflow-hidden border-2',
        isActive && 'border-ios-green shadow-ios-lg',
        isSelected && !isActive && 'border-ios-blue shadow-ios-lg',
        !isActive && !isSelected && 'border-ios-gray-200 hover:border-ios-gray-300 shadow-ios'
      )}
      onClick={() => onSelect(theme)}
    >
      {/* Preview */}
      <div
        className="h-48 p-6 flex flex-col justify-between"
        style={{
          backgroundColor: config.colors?.background || '#FFFFFF',
          fontFamily: config.typography?.fontFamily || 'inherit',
        }}
      >
        <div>
          <h3
            className="text-2xl font-bold mb-2"
            style={{
              color: config.colors?.primary || '#1C1C1E',
              fontSize: config.typography?.fontSize?.heading || '2rem',
            }}
          >
            Restaurante
          </h3>
          <p
            className="text-sm"
            style={{ color: config.colors?.textSecondary || '#8E8E93' }}
          >
            Vista previa del tema
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="px-4 py-2 rounded-lg font-medium"
            style={{
              backgroundColor: config.colors?.primary || '#007AFF',
              color: config.colors?.background || '#FFFFFF',
              borderRadius: config.borderRadius || '12px',
            }}
          >
            Plato Ejemplo
          </div>
          <span
            className="font-bold text-xl"
            style={{ color: config.colors?.accent || config.colors?.primary }}
          >
            €12.50
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white p-4 border-t border-ios-gray-200">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-ios-gray-900">{theme.name}</h4>
            <p className="text-sm text-ios-gray-600">{theme.description}</p>
          </div>

          {isActive && (
            <Badge variant="success" size="sm">
              Activo
            </Badge>
          )}
        </div>

        {/* Color Palette */}
        <div className="flex gap-2 mt-3">
          <ColorSwatch color={config.colors?.primary} label="Principal" />
          <ColorSwatch color={config.colors?.secondary} label="Secundario" />
          <ColorSwatch color={config.colors?.accent} label="Acento" />
          <ColorSwatch color={config.colors?.background} label="Fondo" />
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && !isActive && (
        <div className="absolute top-4 right-4 bg-ios-blue text-white w-8 h-8 rounded-full flex items-center justify-center">
          ✓
        </div>
      )}
    </div>
  )
}

function ColorSwatch({ color, label }: { color?: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1" title={label}>
      <div
        className="w-8 h-8 rounded-ios border border-ios-gray-300"
        style={{ backgroundColor: color || '#CCCCCC' }}
      />
      <span className="text-xs text-ios-gray-500">{label}</span>
    </div>
  )
}
