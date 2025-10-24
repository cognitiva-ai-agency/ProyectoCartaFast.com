import { Theme } from '@/types'

/**
 * Default themes available for all restaurants
 * These are hardcoded and don't require database configuration
 */
export const DEFAULT_THEMES: Theme[] = [
  {
    id: 'elegant',
    name: 'Elegante',
    description: 'Diseño clásico y sofisticado para restaurantes formales',
    is_active: true,
    config: {
      colors: {
        primary: '#1C1C1E',
        secondary: '#8E8E93',
        accent: '#C9A86A',
        background: '#FFFFFF',
        text: '#1C1C1E',
        textSecondary: '#8E8E93',
      },
      typography: {
        fontFamily: "'Playfair Display', serif",
        fontSize: {
          heading: '2rem',
          body: '1rem',
          small: '0.875rem',
        },
      },
      borderRadius: '8px',
      spacing: {
        small: '0.5rem',
        medium: '1rem',
        large: '2rem',
      },
    },
  },
  {
    id: 'modern',
    name: 'Moderno',
    description: 'Limpio y minimalista, ideal para cafés y restaurantes contemporáneos',
    is_active: true,
    config: {
      colors: {
        primary: '#007AFF',
        secondary: '#5AC8FA',
        accent: '#FF9500',
        background: '#F2F2F7',
        text: '#000000',
        textSecondary: '#8E8E93',
      },
      typography: {
        fontFamily: "'Inter', -apple-system, sans-serif",
        fontSize: {
          heading: '1.75rem',
          body: '1rem',
          small: '0.875rem',
        },
      },
      borderRadius: '16px',
      spacing: {
        small: '0.5rem',
        medium: '1rem',
        large: '1.5rem',
      },
    },
  },
  {
    id: 'vibrant',
    name: 'Vibrante',
    description: 'Colores llamativos y energéticos para restaurantes casuales',
    is_active: true,
    config: {
      colors: {
        primary: '#FF2D55',
        secondary: '#FF9500',
        accent: '#FFCC00',
        background: '#FFFFFF',
        text: '#1C1C1E',
        textSecondary: '#8E8E93',
      },
      typography: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: {
          heading: '2rem',
          body: '1rem',
          small: '0.875rem',
        },
      },
      borderRadius: '20px',
      spacing: {
        small: '0.75rem',
        medium: '1.25rem',
        large: '2rem',
      },
    },
  },
  {
    id: 'dark',
    name: 'Oscuro',
    description: 'Estilo nocturno elegante para bares y restaurantes premium',
    is_active: true,
    config: {
      colors: {
        primary: '#0A84FF',
        secondary: '#5E5CE6',
        accent: '#FFD60A',
        background: '#000000',
        text: '#FFFFFF',
        textSecondary: '#98989D',
      },
      typography: {
        fontFamily: "'Montserrat', sans-serif",
        fontSize: {
          heading: '2rem',
          body: '1rem',
          small: '0.875rem',
        },
      },
      borderRadius: '12px',
      spacing: {
        small: '0.5rem',
        medium: '1rem',
        large: '2rem',
      },
    },
  },
]
