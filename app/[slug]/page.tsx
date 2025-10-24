'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Category, MenuItem, Theme, ScheduledDiscount } from '@/types'
import { Spinner } from '@/components/ui'
import { getCurrency } from '@/lib/currencies'
import { DEMO_THEMES } from '@/lib/demo-data'
import { getIngredientById, Ingredient, getDishDietType, MASTER_INGREDIENTS } from '@/lib/ingredients'
import { applyScheduledDiscounts } from '@/lib/scheduled-discounts'
import { cn } from '@/lib/utils'

interface BannerConfig {
  enabled: boolean
  message: string
  backgroundColor: string
  textColor: string
}

interface MenuData {
  categories: Category[]
  items: MenuItem[]
  restaurantName: string
  logoUrl?: string
  logoStyle?: 'circular' | 'rectangular' | 'none'
  currency: string
  theme: Theme | null
  banner: BannerConfig | null
  customIngredients: Ingredient[]
}

export default function PublicMenuPage() {
  const params = useParams()
  const slug = params.slug as string
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [baseItems, setBaseItems] = useState<MenuItem[]>([]) // Store original items without discounts
  const [scheduledDiscounts, setScheduledDiscounts] = useState<ScheduledDiscount[]>([])
  const [timezone, setTimezone] = useState('America/Santiago')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setIsLoading(true)
        const categoriesRes = await fetch(`/api/restaurants/${slug}/categories`)
        const categories = await categoriesRes.json()
        const itemsRes = await fetch(`/api/restaurants/${slug}/items`)
        const items = await itemsRes.json()
        const themeRes = await fetch(`/api/restaurants/${slug}/theme`)
        const themeData = await themeRes.json()
        const bannerRes = await fetch(`/api/restaurants/${slug}/banner`)
        const bannerData = await bannerRes.json()

        // Load scheduled discounts
        const discountsRes = await fetch(`/api/restaurants/${slug}/scheduled-discounts`)
        const discountsData = await discountsRes.json()
        const discounts: ScheduledDiscount[] = discountsData.discounts || []

        // Load custom ingredients
        const ingredientsRes = await fetch(`/api/restaurants/${slug}/ingredients`)
        const ingredientsData = await ingredientsRes.json()
        const customIngredients: Ingredient[] = ingredientsData.ingredients || []

        // Store base data
        setBaseItems(items)
        setScheduledDiscounts(discounts)
        setTimezone(themeData.timezone || 'America/Santiago')

        // Apply scheduled discounts to items
        const itemsWithDiscounts = applyScheduledDiscounts(items, discounts, themeData.timezone || 'America/Santiago')

        // Find theme configuration
        const currentTheme = DEMO_THEMES.find(t => t.id === themeData.themeId) || DEMO_THEMES[0]

        setMenuData({
          categories: categories.filter((cat: Category) => cat.is_visible),
          items: itemsWithDiscounts.filter((item: MenuItem) => item.is_available),
          restaurantName: themeData.restaurantName || 'Restaurante Demo',
          logoUrl: themeData.logoUrl,
          logoStyle: themeData.logoStyle || 'circular',
          currency: themeData.currency || 'CLP',
          theme: currentTheme,
          banner: bannerData,
          customIngredients
        })
      } catch (err) {
        console.error('Error loading menu:', err)
        setError('No se pudo cargar el menú')
      } finally {
        setIsLoading(false)
      }
    }
    loadMenuData()
  }, [slug])

  // Update current time every minute to re-evaluate discounts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Re-apply discounts when time changes
  useEffect(() => {
    if (!menuData || baseItems.length === 0) return

    const itemsWithDiscounts = applyScheduledDiscounts(baseItems, scheduledDiscounts, timezone, currentTime)

    setMenuData(prev => prev ? {
      ...prev,
      items: itemsWithDiscounts.filter((item: MenuItem) => item.is_available)
    } : null)
  }, [currentTime, baseItems, scheduledDiscounts, timezone])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ios-gray-50">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ios-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold text-ios-gray-700 mb-2">Menú No Disponible</h2>
          <p className="text-ios-gray-500">{error || 'No se encontró el menú'}</p>
        </div>
      </div>
    )
  }

  const theme = menuData.theme
  const themeColors = theme?.config?.colors || {}
  const themeTypography = theme?.config?.typography || {}
  const themeSpacing = theme?.config?.spacing || {}
  const themeBorderRadius = theme?.config?.borderRadius || '12px'

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: themeColors.background || '#F2F2F7',
        fontFamily: themeTypography.fontFamily || '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
        fontSize: themeTypography.fontSize?.base || '16px'
      }}
    >
      <header
        className="sticky top-0 z-30 backdrop-blur-lg border-b shadow-sm"
        style={{
          backgroundColor: `${themeColors.background || '#FFFFFF'}E6`,
          borderColor: `${themeColors.secondary || '#8E8E93'}33`,
          color: themeColors.text || '#1C1C1E'
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center gap-4">
            {/* Logo */}
            {menuData.logoUrl && (
              <div className="flex items-center justify-center">
                <img
                  src={`${menuData.logoUrl}?t=${Date.now()}`}
                  alt={`Logo de ${menuData.restaurantName}`}
                  className={cn(
                    "max-w-[120px] max-h-[120px] object-contain bg-white p-2",
                    menuData.logoStyle === 'circular' && 'rounded-full border-2 shadow-md',
                    menuData.logoStyle === 'rectangular' && 'rounded-2xl border-2 shadow-md',
                    menuData.logoStyle === 'none' && 'rounded-none'
                  )}
                  style={{
                    borderColor: (menuData.logoStyle === 'circular' || menuData.logoStyle === 'rectangular')
                      ? (themeColors.primary || '#007AFF')
                      : undefined
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}

            {/* Restaurant Name */}
            <div className="text-center">
              <h1
                className="text-3xl font-bold"
                style={{
                  fontFamily: themeTypography.headingFont || themeTypography.fontFamily,
                  fontSize: themeTypography.fontSize?.heading || '32px',
                  color: themeColors.primary || themeColors.text || '#1C1C1E'
                }}
              >
                {menuData.restaurantName}
              </h1>
              <p
                className="mt-2"
                style={{ color: themeColors.textSecondary || '#8E8E93' }}
              >
                Menú Digital
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Banner de Ofertas */}
      {menuData.banner && menuData.banner.enabled && (
        <div
          className="py-4 px-4 text-center font-semibold shadow-sm animate-fade-in"
          style={{
            backgroundColor: menuData.banner.backgroundColor,
            color: menuData.banner.textColor
          }}
        >
          <div className="max-w-5xl mx-auto">
            <span className="whitespace-pre-wrap">{menuData.banner.message}</span>
          </div>
        </div>
      )}

      <main
        className="max-w-5xl mx-auto px-4"
        style={{ paddingTop: themeSpacing.sectionGap || '48px', paddingBottom: themeSpacing.sectionGap || '48px' }}
      >
        {menuData.categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.text }}>Menú en Construcción</h2>
            <p style={{ color: themeColors.textSecondary }}>Estamos preparando nuestro menú. Vuelve pronto.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {menuData.categories.sort((a, b) => a.position - b.position).map((category, index) => (
              <CategorySection
                key={category.id}
                category={category}
                items={menuData.items.filter(item => item.category_id === category.id)}
                currency={menuData.currency}
                defaultExpanded={index === 0}
                theme={theme}
                customIngredients={menuData.customIngredients}
              />
            ))}
          </div>
        )}
      </main>

      <footer
        className="mt-16 py-8 border-t"
        style={{ borderColor: `${themeColors.secondary || '#8E8E93'}33` }}
      >
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm" style={{ color: themeColors.textSecondary }}>
            Powered by <span className="font-semibold" style={{ color: themeColors.text }}>MenusCarta</span>
          </p>
        </div>
      </footer>
    </div>
  )
}

function CategorySection({ category, items, currency, defaultExpanded, theme, customIngredients }: {
  category: Category;
  items: MenuItem[];
  currency: string;
  defaultExpanded: boolean;
  theme: Theme | null;
  customIngredients: Ingredient[];
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const sortedItems = items.sort((a, b) => a.position - b.position)
  if (sortedItems.length === 0) return null

  const themeColors = theme?.config?.colors || {}
  const themeSpacing = theme?.config?.spacing || {}
  const themeBorderRadius = theme?.config?.borderRadius || '12px'

  return (
    <div
      className="shadow-lg overflow-hidden"
      style={{
        backgroundColor: themeColors.background === '#1C1C1E' ? '#2C2C2E' : '#FFFFFF',
        borderRadius: themeBorderRadius,
        border: `1px solid ${themeColors.secondary || '#8E8E93'}22`
      }}
    >
      <div
        className="p-4 border-b cursor-pointer transition-all hover:opacity-90 active:scale-[0.99]"
        style={{
          borderColor: `${themeColors.secondary || '#8E8E93'}33`,
          backgroundColor: themeColors.background === '#1C1C1E' ? '#1C1C1E' : `${themeColors.primary || '#1C1C1E'}05`
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h2
                className="text-xl font-semibold"
                style={{ color: themeColors.primary || themeColors.text }}
              >
                {category.name}
              </h2>
              <span
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: `${themeColors.accent || '#FF9500'}20`,
                  color: themeColors.accent || '#FF9500'
                }}
              >
                {sortedItems.length} {sortedItems.length === 1 ? 'plato' : 'platos'}
              </span>
            </div>
            {category.description && (
              <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                {category.description}
              </p>
            )}
          </div>
          <div
            className="transition-transform p-2 rounded-lg"
            style={{
              color: themeColors.textSecondary,
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            <span className="text-lg">▼</span>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div style={{ padding: themeSpacing.cardPadding || '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sortedItems.map((item) => (<MenuItemCard key={item.id} item={item} currency={currency} theme={theme} customIngredients={customIngredients} />))}
        </div>
      )}
    </div>
  )
}

function MenuItemCard({ item, currency, theme, customIngredients }: { item: MenuItem; currency: string; theme: Theme | null; customIngredients: Ingredient[] }) {
  const currencyData = getCurrency(currency)
  const formatPrice = (price: number): string => {
    const fixed = price.toFixed(currencyData.decimals)
    const [intPart, decPart] = fixed.split('.')
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return currencyData.decimals > 0 ? `${formattedInt},${decPart}` : formattedInt
  }

  const themeColors = theme?.config?.colors || {}
  const themeBorderRadius = theme?.config?.borderRadius || '12px'

  // Calculate savings and discount percentage
  const savings = item.is_promotion && item.promotion_price
    ? item.price - item.promotion_price
    : 0
  const discountPercentage = item.is_promotion && item.promotion_price
    ? Math.round((savings / item.price) * 100)
    : 0

  // Calculate diet type for the dish
  // Combine standard ingredients with custom ingredients for complete classification
  const allIngredients = [...MASTER_INGREDIENTS, ...customIngredients]
  const dietType = item.ingredients && item.ingredients.length > 0
    ? getDishDietType(item.ingredients, allIngredients)
    : null

  return (
    <div
      className="shadow-md hover:shadow-lg transition-all p-4"
      style={{
        backgroundColor: themeColors.background === '#1C1C1E' ? '#3A3A3C' : '#FFFFFF',
        borderRadius: `calc(${themeBorderRadius} * 0.8)`,
        border: `1px solid ${themeColors.secondary || '#8E8E93'}22`
      }}
    >
      <div className="flex items-start gap-3">
        {item.image_url && (
          <div
            className="w-20 h-20 overflow-hidden border flex-shrink-0"
            style={{
              borderRadius: `calc(${themeBorderRadius} * 0.6)`,
              borderColor: `${themeColors.secondary || '#8E8E93'}33`
            }}
          >
            <img
              src={`${item.image_url}?t=${item.updated_at || Date.now()}`}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <h3 className="text-lg font-semibold flex-1" style={{ color: themeColors.text }}>
              {item.name}
            </h3>
            <div className="flex gap-1 flex-shrink-0">
              {item.is_promotion && (
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: '#FF453A20',
                    color: '#FF453A'
                  }}
                >
                  Promoción
                </span>
              )}
              {dietType === 'vegan' && (
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: '#34C75920',
                    color: '#34C759'
                  }}
                  title="Este plato es 100% vegano"
                >
                  🌱 Vegano
                </span>
              )}
              {dietType === 'vegetarian' && (
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: '#FF950020',
                    color: '#FF9500'
                  }}
                  title="Este plato es vegetariano"
                >
                  🥚 Vegetariano
                </span>
              )}
            </div>
          </div>
          {item.description && (
            <p className="text-sm mb-2" style={{ color: themeColors.textSecondary }}>
              {item.description}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Promotional Price */}
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: themeColors.textSecondary }}>{currencyData.symbol}</span>
              <span
                className="text-lg font-bold"
                style={{ color: item.is_promotion ? '#FF453A' : (themeColors.accent || themeColors.primary) }}
              >
                {formatPrice(item.is_promotion && item.promotion_price ? item.promotion_price : item.price)}
              </span>
            </div>

            {/* Original Price (strikethrough) */}
            {item.is_promotion && item.promotion_price && (
              <div className="flex items-center gap-1">
                <span className="text-xs line-through" style={{ color: themeColors.textSecondary }}>
                  {currencyData.symbol} {formatPrice(item.price)}
                </span>
              </div>
            )}

            {/* Discount Percentage Badge */}
            {item.is_promotion && item.promotion_price && discountPercentage > 0 && (
              <span
                className="text-xs font-bold px-2 py-1 rounded-full"
                style={{
                  backgroundColor: '#34C759',
                  color: '#FFFFFF'
                }}
              >
                -{discountPercentage}%
              </span>
            )}
          </div>

          {/* Savings Amount */}
          {item.is_promotion && item.promotion_price && savings > 0 && (
            <div
              className="text-xs font-semibold mt-1"
              style={{ color: '#34C759' }}
            >
              ¡Ahorras {currencyData.symbol} {formatPrice(savings)}!
            </div>
          )}
        </div>
      </div>

      {/* Ingredientes */}
      {item.ingredients && item.ingredients.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${themeColors.secondary || '#8E8E93'}22` }}>
          <span className="text-xs font-medium" style={{ color: themeColors.text }}>Ingredientes: </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {item.ingredients.map((ingredientId: string) => {
              const ingredient = getIngredientById(ingredientId, allIngredients)
              return ingredient ? (
                <span
                  key={ingredientId}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${themeColors.accent || '#FF9500'}15`,
                    color: themeColors.text
                  }}
                >
                  {ingredient.name}
                </span>
              ) : null
            })}
          </div>
        </div>
      )}

      {/* Alérgenos */}
      {item.allergens && item.allergens.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${themeColors.secondary || '#8E8E93'}22` }}>
          <span className="text-xs font-medium" style={{ color: themeColors.text }}>Alérgenos: </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {item.allergens.map((allergen: string) => (
              <span
                key={allergen}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${themeColors.secondary || '#8E8E93'}20`,
                  color: themeColors.textSecondary
                }}
              >
                {allergen}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
