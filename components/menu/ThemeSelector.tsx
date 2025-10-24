'use client'

import { useState, useEffect } from 'react'
import { useThemes, useRestaurantTheme } from '@/hooks/useThemes'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Spinner, ImageUploader, Input } from '@/components/ui'
import { Theme } from '@/types'
import { cn } from '@/lib/utils'

export interface ThemeSelectorProps {
  restaurantId: string
  restaurantSlug: string
}

/**
 * Theme Selector Component
 * Allows selecting from predefined themes with visual preview
 */
export function ThemeSelector({ restaurantId, restaurantSlug }: ThemeSelectorProps) {
  const { themes, isLoading: themesLoading } = useThemes()
  const { currentThemeId, updateTheme, refreshTheme, isUpdating } = useRestaurantTheme(restaurantId)
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [restaurantName, setRestaurantName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoStyle, setLogoStyle] = useState<'circular' | 'rectangular' | 'none'>('circular')
  const [logoLoadError, setLogoLoadError] = useState(false)
  const [currency, setCurrency] = useState('CLP')
  const [timezone, setTimezone] = useState('America/Santiago')
  const [isSaving, setIsSaving] = useState(false)
  const [savingMessage, setSavingMessage] = useState('')

  // Load restaurant info from theme API
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const res = await fetch(`/api/restaurants/${restaurantSlug}/theme`)
        if (res.ok) {
          const themeData = await res.json()
          setRestaurantName(themeData.restaurantName || '')
          setLogoUrl(themeData.logoUrl || '')
          setLogoStyle(themeData.logoStyle || 'circular')
          setCurrency(themeData.currency || 'CLP')
          setTimezone(themeData.timezone || 'America/Santiago')
          setLogoLoadError(false)
        }
      } catch (err) {
        console.error('Error loading theme:', err)
      }
    }

    loadTheme()
  }, [restaurantSlug])

  const handleSelectTheme = (theme: Theme) => {
    setSelectedTheme(theme)
  }

  const handleRestaurantNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setRestaurantName(newName)
  }

  const handleRestaurantNameBlur = async () => {
    try {
      setIsSaving(true)
      setSavingMessage('Guardando nombre...')

      const response = await fetch(`/api/restaurants/${restaurantSlug}/theme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: currentThemeId,
          restaurantName,
          logoUrl,
          logoStyle,
          currency,
          timezone
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save name')
      }

      setSavingMessage('Nombre guardado ✓')
      setTimeout(() => {
        setSavingMessage('')
      }, 2000)
    } catch (err) {
      console.error('Error saving restaurant name:', err)
      setSavingMessage('Error al guardar nombre ✗')
      setTimeout(() => {
        setSavingMessage('')
      }, 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value
    setCurrency(newCurrency)

    try {
      setIsSaving(true)
      setSavingMessage('Guardando moneda...')

      const response = await fetch(`/api/restaurants/${restaurantSlug}/theme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: currentThemeId,
          restaurantName,
          logoUrl,
          logoStyle,
          currency: newCurrency,
          timezone
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save currency')
      }

      setSavingMessage('Moneda guardada ✓')
      setTimeout(() => {
        setSavingMessage('')
      }, 2000)
    } catch (err) {
      console.error('Error saving currency:', err)
      setSavingMessage('Error al guardar moneda ✗')
      setTimeout(() => {
        setSavingMessage('')
      }, 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTimezoneChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimezone = e.target.value
    setTimezone(newTimezone)

    try {
      setIsSaving(true)
      setSavingMessage('Guardando zona horaria...')

      const response = await fetch(`/api/restaurants/${restaurantSlug}/theme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: currentThemeId,
          restaurantName,
          logoUrl,
          logoStyle,
          currency,
          timezone: newTimezone
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save timezone')
      }

      setSavingMessage('Zona horaria guardada ✓')
      setTimeout(() => {
        setSavingMessage('')
      }, 2000)
    } catch (err) {
      console.error('Error saving timezone:', err)
      setSavingMessage('Error al guardar zona horaria ✗')
      setTimeout(() => {
        setSavingMessage('')
      }, 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoChange = async (newLogoUrl: string) => {
    setLogoUrl(newLogoUrl)
    setLogoLoadError(false)
    setIsSaving(true)
    setSavingMessage('Subiendo logo...')

    try {
      const response = await fetch(`/api/restaurants/${restaurantSlug}/theme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: currentThemeId,
          restaurantName,
          logoUrl: newLogoUrl,
          logoStyle,
          currency,
          timezone
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload logo')
      }

      const savedData = await response.json()
      // Update local state with saved logo URL from Supabase Storage
      setLogoUrl(savedData.logoUrl || newLogoUrl)

      setSavingMessage('Logo guardado ✓')
      setTimeout(() => {
        setSavingMessage('')
      }, 2000)
    } catch (err) {
      console.error('Error saving logo:', err)
      setSavingMessage('Error al guardar logo ✗')
      setTimeout(() => {
        setSavingMessage('')
      }, 3000)
      alert('Error al subir el logo. Por favor, intenta de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoStyleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStyle = e.target.value as 'circular' | 'rectangular' | 'none'
    setLogoStyle(newStyle)

    try {
      await fetch(`/api/restaurants/${restaurantSlug}/theme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: currentThemeId,
          restaurantName,
          logoUrl,
          logoStyle: newStyle,
          currency,
          timezone
        })
      })
    } catch (err) {
      console.error('Error saving logo style:', err)
    }
  }

  const handleApplyTheme = async () => {
    if (!selectedTheme) return

    try {
      setIsSaving(true)
      setSavingMessage('Aplicando tema...')

      // Use API route to update theme (bypasses RLS issues)
      const response = await fetch(`/api/restaurants/${restaurantSlug}/theme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: selectedTheme.id,
          restaurantName,
          logoUrl,
          logoStyle,
          currency,
          timezone
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update theme')
      }

      // Theme updated successfully
      setSelectedTheme(null)

      // Refresh theme from database to update UI immediately
      if (refreshTheme) {
        await refreshTheme()
      }

      setSavingMessage('Tema aplicado ✓')
      setTimeout(() => {
        setSavingMessage('')
      }, 2000)

      console.log('✅ Tema aplicado exitosamente')
    } catch (err) {
      console.error('❌ Error applying theme:', err)
      setSavingMessage('Error al aplicar tema ✗')
      setTimeout(() => {
        setSavingMessage('')
      }, 3000)
      alert('Error al aplicar el tema. Por favor, intenta de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }

  if (themesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  const currentTheme = themes.find(t => t.id === currentThemeId)

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
          <div className="flex items-center justify-between">
            <CardTitle>Información del Restaurante</CardTitle>
            {savingMessage && (
              <div className={cn(
                "text-sm font-medium px-3 py-1 rounded-full",
                savingMessage.includes('✓') && "bg-green-100 text-green-700",
                savingMessage.includes('✗') && "bg-red-100 text-red-700",
                !savingMessage.includes('✓') && !savingMessage.includes('✗') && "bg-blue-100 text-blue-700"
              )}>
                {savingMessage}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-ios-gray-600 mb-4 text-sm">
            Personaliza el nombre, logo, moneda y zona horaria de tu restaurante
          </p>

          <div className="space-y-6">
            {/* Restaurant Name */}
            <div>
              <Input
                label="Nombre del Restaurante"
                value={restaurantName}
                onChange={handleRestaurantNameChange}
                onBlur={handleRestaurantNameBlur}
                placeholder="Ej: La Trattoria"
                disabled={isSaving}
              />
              <p className="text-xs text-ios-gray-500 mt-1">
                Los cambios se guardan automáticamente al salir del campo
              </p>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                Logo del Restaurante
              </label>

              {logoUrl && !logoLoadError ? (
                <div className="space-y-4">
                  {/* Logo Preview and Controls */}
                  <div className="bg-ios-gray-50 rounded-ios-lg p-4">
                    <p className="text-sm font-medium text-ios-gray-700 mb-3">Vista previa del logo:</p>
                    <div className="flex gap-4 items-start">
                      {/* Miniatura del Logo - Clickeable */}
                      <button
                        type="button"
                        onClick={() => {
                          setLogoUrl('')
                          setLogoLoadError(false)
                        }}
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
                            console.error('Error loading logo image')
                            setLogoLoadError(true)
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
                <div>
                  <ImageUploader
                    value=""
                    onChange={handleLogoChange}
                    label=""
                    placeholder={isSaving ? "Subiendo logo..." : "Sube el logo de tu restaurante"}
                  />
                  {isSaving && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-ios-blue">
                      <Spinner size="sm" />
                      <span>Subiendo a Supabase Storage...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Currency Selector */}
            <div>
              <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                Moneda
              </label>
              <select
                value={currency}
                onChange={handleCurrencyChange}
                disabled={isSaving}
                className="w-full px-4 py-2 border border-ios-gray-300 rounded-ios-lg focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent text-ios-gray-900 disabled:bg-ios-gray-100 disabled:cursor-not-allowed"
              >
                <option value="CLP">Peso Chileno (CLP)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">Dólar Estadounidense (USD)</option>
                <option value="MXN">Peso Mexicano (MXN)</option>
                <option value="ARS">Peso Argentino (ARS)</option>
                <option value="COP">Peso Colombiano (COP)</option>
                <option value="PEN">Sol Peruano (PEN)</option>
                <option value="UYU">Peso Uruguayo (UYU)</option>
                <option value="BRL">Real Brasileño (BRL)</option>
              </select>
              <p className="text-xs text-ios-gray-500 mt-1">
                Esta moneda se mostrará en los precios del menú público
              </p>
            </div>

            {/* Timezone Selector */}
            <div>
              <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                Zona Horaria
              </label>
              <select
                value={timezone}
                onChange={handleTimezoneChange}
                disabled={isSaving}
                className="w-full px-4 py-2 border border-ios-gray-300 rounded-ios-lg focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent text-ios-gray-900 disabled:bg-ios-gray-100 disabled:cursor-not-allowed"
              >
                <option value="America/Santiago">Santiago de Chile (GMT-3)</option>
                <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
                <option value="America/Bogota">Bogotá (GMT-5)</option>
                <option value="America/Lima">Lima (GMT-5)</option>
                <option value="America/Montevideo">Montevideo (GMT-3)</option>
                <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                <option value="America/Caracas">Caracas (GMT-4)</option>
                <option value="Europe/Madrid">Madrid (GMT+1)</option>
                <option value="Europe/London">Londres (GMT+0)</option>
                <option value="America/New_York">Nueva York (GMT-5)</option>
                <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
              </select>
              <p className="text-xs text-ios-gray-500 mt-1">
                Utilizada para descuentos programados y horarios de apertura
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Themes Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {themes.map((theme) => (
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
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleApplyTheme}
                  isLoading={isSaving}
                  disabled={isSaving}
                  size="lg"
                >
                  Aplicar Tema
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
              color: '#FFFFFF',
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
