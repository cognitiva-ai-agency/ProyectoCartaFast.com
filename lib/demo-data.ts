/**
 * Demo data for MenusCarta MVP
 * Used when logging in with demo credentials
 */

import { Restaurant, Menu, Category, MenuItem, Theme } from '@/types'
import { MASTER_INGREDIENTS } from './ingredients'

// Helper para obtener IDs de ingredientes por nombre
const getIngIds = (names: string[]): string[] => {
  return names
    .map(name => MASTER_INGREDIENTS.find(ing => ing.name.toLowerCase() === name.toLowerCase())?.id)
    .filter(Boolean) as string[]
}

export const DEMO_RESTAURANT: Restaurant = {
  id: 'demo-restaurant-id',
  name: 'Restaurante Demo',
  slug: 'restoran1',
  owner_id: 'demo-owner-id',
  theme_id: 'demo-theme-classic',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const DEMO_THEME: Theme = {
  id: 'demo-theme-classic',
  name: 'Classic Elegance',
  description: 'Tema clásico y elegante con tonos oscuros',
  config: {
    colors: {
      primary: '#1C1C1E',
      secondary: '#8E8E93',
      accent: '#FF9500',
      background: '#FFFFFF',
      text: '#1C1C1E',
      textSecondary: '#8E8E93',
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
      headingFont: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
      fontSize: {
        base: '16px',
        heading: '32px',
        small: '14px',
      },
    },
    spacing: {
      cardPadding: '24px',
      sectionGap: '48px',
    },
    borderRadius: '12px',
    currency: 'EUR',
  },
}

export const DEMO_THEMES: Theme[] = [
  DEMO_THEME,
  {
    id: 'demo-theme-fresh',
    name: 'Fresh & Modern',
    description: 'Tema moderno con tonos azules y verdes',
    config: {
      colors: {
        primary: '#007AFF',
        secondary: '#34C759',
        accent: '#5AC8FA',
        background: '#F2F2F7',
        text: '#1C1C1E',
        textSecondary: '#636366',
      },
      typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
        headingFont: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
        fontSize: {
          base: '16px',
          heading: '36px',
          small: '14px',
        },
      },
      spacing: {
        cardPadding: '20px',
        sectionGap: '40px',
      },
      borderRadius: '16px',
      currency: 'EUR',
    },
  },
  {
    id: 'demo-theme-warm',
    name: 'Warm Bistro',
    description: 'Tema cálido y acogedor con tonos tierra',
    config: {
      colors: {
        primary: '#8B4513',
        secondary: '#D2691E',
        accent: '#FFD700',
        background: '#FFF8DC',
        text: '#3A3A3C',
        textSecondary: '#8E8E93',
      },
      typography: {
        fontFamily: 'Georgia, serif',
        headingFont: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
        fontSize: {
          base: '17px',
          heading: '34px',
          small: '15px',
        },
      },
      spacing: {
        cardPadding: '28px',
        sectionGap: '44px',
      },
      borderRadius: '10px',
      currency: 'EUR',
    },
  },
  {
    id: 'demo-theme-dark',
    name: 'Minimalist Dark',
    description: 'Tema minimalista con modo oscuro',
    config: {
      colors: {
        primary: '#FFFFFF',
        secondary: '#C7C7CC',
        accent: '#AF52DE',
        background: '#1C1C1E',
        text: '#FFFFFF',
        textSecondary: '#AEAEB2',
      },
      typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
        headingFont: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
        fontSize: {
          base: '16px',
          heading: '38px',
          small: '14px',
        },
      },
      spacing: {
        cardPadding: '24px',
        sectionGap: '56px',
      },
      borderRadius: '14px',
      currency: 'EUR',
    },
  },
]

export const DEMO_MENU: Menu = {
  id: 'demo-menu-id',
  restaurant_id: 'demo-restaurant-id',
  name: 'Menú Principal',
  description: 'Carta completa de nuestro restaurante',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const DEMO_CATEGORIES: Category[] = [
  {
    id: 'demo-cat-1',
    menu_id: 'demo-menu-id',
    name: 'Entrantes',
    description: 'Para abrir el apetito',
    position: 0,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-cat-2',
    menu_id: 'demo-menu-id',
    name: 'Platos Principales',
    description: 'Nuestras especialidades',
    position: 1,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-cat-3',
    menu_id: 'demo-menu-id',
    name: 'Postres',
    description: 'Un dulce final',
    position: 2,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-cat-4',
    menu_id: 'demo-menu-id',
    name: 'Bebidas',
    description: 'Refrescos, vinos y más',
    position: 3,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const DEMO_ITEMS: MenuItem[] = [
  // Entrantes
  {
    id: 'demo-item-1',
    category_id: 'demo-cat-1',
    name: 'Ensalada César',
    description: 'Lechuga romana, pollo a la parrilla, parmesano, crutones y aderezo César',
    price: 8.50,
    position: 0,
    is_available: true,
    is_promotion: false,
    allergens: ['gluten', 'lácteos', 'huevo'],
    ingredients: getIngIds(['Lechuga', 'Pollo', 'Queso Parmesano', 'Pan']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-item-2',
    category_id: 'demo-cat-1',
    name: 'Croquetas de Jamón',
    description: '6 unidades de croquetas caseras de jamón ibérico',
    price: 7.00,
    position: 1,
    is_available: true,
    is_promotion: true,
    promotion_price: 5.50,
    allergens: ['gluten', 'lácteos'],
    ingredients: getIngIds(['Jamón Ibérico', 'Leche', 'Harina', 'Huevo']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-item-3',
    category_id: 'demo-cat-1',
    name: 'Tabla de Quesos',
    description: 'Selección de quesos artesanales con mermelada de higos',
    price: 12.00,
    position: 2,
    is_available: true,
    is_promotion: false,
    allergens: ['lácteos'],
    ingredients: getIngIds(['Queso Manchego', 'Queso Azul', 'Queso de Cabra', 'Higos']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Platos Principales
  {
    id: 'demo-item-4',
    category_id: 'demo-cat-2',
    name: 'Solomillo a la Parrilla',
    description: 'Solomillo de ternera con patatas al horno y verduras de temporada',
    price: 22.00,
    position: 0,
    is_available: true,
    is_promotion: false,
    ingredients: getIngIds(['Carne de Vacuno', 'Patata', 'Zanahoria', 'Pimiento']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-item-5',
    category_id: 'demo-cat-2',
    name: 'Paella Valenciana',
    description: 'Arroz bomba, pollo, conejo, judías verdes y garrofón (mínimo 2 personas)',
    price: 16.00,
    position: 1,
    is_available: true,
    is_promotion: false,
    allergens: ['mariscos'],
    ingredients: getIngIds(['Arroz', 'Pollo', 'Conejo', 'Judías Verdes', 'Pimiento', 'Ají']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-item-6',
    category_id: 'demo-cat-2',
    name: 'Lubina al Horno',
    description: 'Lubina fresca al horno con limón y hierbas aromáticas',
    price: 18.50,
    position: 2,
    is_available: true,
    is_promotion: false,
    allergens: ['pescado'],
    ingredients: getIngIds(['Lubina', 'Limón', 'Romero', 'Tomillo', 'Aceite de Oliva']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-item-7',
    category_id: 'demo-cat-2',
    name: 'Risotto de Setas',
    description: 'Arroz arborio con setas de temporada, parmesano y trufa',
    price: 14.00,
    position: 3,
    is_available: false,
    is_promotion: false,
    allergens: ['lácteos'],
    ingredients: getIngIds(['Arroz Arborio', 'Setas', 'Queso Parmesano', 'Trufa', 'Mantequilla']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Postres
  {
    id: 'demo-item-8',
    category_id: 'demo-cat-3',
    name: 'Tarta de Queso',
    description: 'Cheesecake casera con coulis de frutos rojos',
    price: 5.50,
    position: 0,
    is_available: true,
    is_promotion: false,
    allergens: ['lácteos', 'huevo', 'gluten'],
    ingredients: getIngIds(['Queso Crema', 'Galletas', 'Frutos Rojos', 'Azúcar', 'Huevo']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-item-9',
    category_id: 'demo-cat-3',
    name: 'Tiramisú',
    description: 'El clásico postre italiano con café y mascarpone',
    price: 6.00,
    position: 1,
    is_available: true,
    is_promotion: true,
    promotion_price: 4.50,
    allergens: ['lácteos', 'huevo', 'gluten'],
    ingredients: getIngIds(['Mascarpone', 'Café', 'Bizcochos', 'Cacao', 'Huevo']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-item-10',
    category_id: 'demo-cat-3',
    name: 'Helado Artesanal',
    description: '3 bolas de helado (vainilla, chocolate, fresa)',
    price: 4.50,
    position: 2,
    is_available: true,
    is_promotion: false,
    allergens: ['lácteos'],
    ingredients: getIngIds(['Leche', 'Nata', 'Vainilla', 'Chocolate', 'Fresa']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Bebidas
  {
    id: 'demo-item-11',
    category_id: 'demo-cat-4',
    name: 'Vino Tinto Reserva',
    description: 'Copa de vino tinto D.O. Rioja',
    price: 4.00,
    position: 0,
    is_available: true,
    is_promotion: false,
    allergens: ['sulfitos'],
    ingredients: getIngIds(['Vino Tinto']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-item-12',
    category_id: 'demo-cat-4',
    name: 'Agua Mineral',
    description: 'Botella de agua mineral (500ml)',
    price: 2.00,
    position: 1,
    is_available: true,
    is_promotion: false,
    ingredients: getIngIds(['Agua']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-item-13',
    category_id: 'demo-cat-4',
    name: 'Café Expreso',
    description: 'Café expreso recién hecho',
    price: 1.50,
    position: 2,
    is_available: true,
    is_promotion: false,
    ingredients: getIngIds(['Café']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const isDemoMode = (slug: string) => {
  return slug === 'restoran1'
}
