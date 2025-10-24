'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'

export interface DashboardLayoutProps {
  children: ReactNode
  activeTab?: 'menu' | 'inventory' | 'promotions' | 'themes'
  onTabChange?: (tab: 'menu' | 'inventory' | 'promotions' | 'themes') => void
}

export function DashboardLayout({ children, activeTab = 'menu', onTabChange }: DashboardLayoutProps) {
  const { session, logout } = useAuth()
  const router = useRouter()
  const [restaurantName, setRestaurantName] = useState('Restaurante Demo')
  const [timezone, setTimezone] = useState('America/Santiago')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Load restaurant name and timezone from theme
  useEffect(() => {
    const loadRestaurantName = async () => {
      if (session?.slug) {
        try {
          const res = await fetch(`/api/restaurants/${session.slug}/theme`, { cache: 'no-store' })
          if (res.ok) {
            const themeData = await res.json()
            setRestaurantName(themeData.restaurantName || 'Restaurante Demo')
            setTimezone(themeData.timezone || 'America/Santiago')
          }
        } catch (err) {
          console.error('Error loading restaurant name:', err)
        }
      }
    }

    loadRestaurantName()

    // Listen for restaurant name changes
    const handleThemeChange = (e: CustomEvent) => {
      if (e.detail?.restaurantName) {
        setRestaurantName(e.detail.restaurantName)
      }
      if (e.detail?.timezone) {
        setTimezone(e.detail.timezone)
      }
    }

    window.addEventListener('demo-theme-change' as any, handleThemeChange)
    return () => window.removeEventListener('demo-theme-change' as any, handleThemeChange)
  }, [session?.slug])

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [])

  const tabs = [
    { id: 'menu' as const, label: 'Editor de Menú', icon: <MenuIcon /> },
    { id: 'inventory' as const, label: 'Inventario', icon: <InventoryIcon /> },
    { id: 'promotions' as const, label: 'Ofertas', icon: <PromotionsIcon /> },
    { id: 'themes' as const, label: 'Configuraciones', icon: <ThemeIcon /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black">
      {/* Header */}
      <header className="bg-black/50 border-b border-white/10 sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Restaurant Name */}
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-white tracking-tight">MenusCarta</h1>
              {session && (
                <div className="hidden sm:flex items-center gap-3">
                  <span className="w-px h-6 bg-white/20" />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-gray-300 font-medium">
                      {restaurantName}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium"
                size="sm"
                onClick={() => window.open(`/${session?.slug}`, '_blank')}
              >
                <ExternalLinkIcon className="w-4 h-4 mr-2" />
                Ver Menú Público
              </Button>
              <Button
                className="bg-transparent hover:bg-white/5 text-gray-300 hover:text-white font-medium"
                size="sm"
                onClick={logout}
              >
                <LogoutIcon className="w-4 h-4 mr-2" />
                Salir
              </Button>

              {/* Real-time Clock */}
              <div className="hidden md:flex flex-col items-end text-right border-l border-white/10 pl-3">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <ClockIcon className="w-4 h-4 text-emerald-400" />
                  {currentTime.toLocaleTimeString('es-CL', {
                    timeZone: timezone,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  })}
                </div>
                <div className="text-xs text-gray-400">
                  {currentTime.toLocaleDateString('es-CL', {
                    timeZone: timezone,
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-black/30 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`
                  flex items-center gap-3 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-300 whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-white text-white bg-white/5'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <span className="w-5 h-5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

// Professional SVG Icons
function MenuIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )
}

function ThemeIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  )
}

function PromotionsIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  )
}

function QRIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  )
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function InventoryIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}
