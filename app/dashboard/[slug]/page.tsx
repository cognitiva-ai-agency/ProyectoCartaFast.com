'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui'
import { MenuEditor } from '@/components/editor/MenuEditor'
import { ThemeSelector } from '@/components/menu/ThemeSelector'
import { DemoThemeSelector } from '@/components/menu/DemoThemeSelector'
import { QRCodeGenerator } from '@/components/menu/QRCodeGenerator'
import { PromotionsManager } from '@/components/promotions/PromotionsManager'
import { UnavailableIngredientsManager } from '@/components/inventory/UnavailableIngredientsManager'
import { IngredientsManager } from '@/components/inventory/IngredientsManager'

export default function DashboardPage({ params }: { params: { slug: string } }) {
  const { session, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'menu' | 'inventory' | 'promotions' | 'themes'>('menu')
  const [restaurantName, setRestaurantName] = useState('Restaurante Demo')

  useEffect(() => {
    console.log('🎯 Dashboard useEffect triggered', { isLoading, session, paramsSlug: params.slug })

    if (!isLoading && !session) {
      console.log('⚠️ No session, redirecting to /clientes')
      router.push('/clientes')
      return
    }

    if (!isLoading && session && session.slug !== params.slug) {
      console.log('⚠️ Wrong dashboard, redirecting to:', `/dashboard/${session.slug}`)
      // User trying to access wrong dashboard
      router.push(`/dashboard/${session.slug}`)
      return
    }

    if (!isLoading && session && session.slug === params.slug) {
      console.log('✅ Session validated, user on correct dashboard')
    }
  }, [session, isLoading, params.slug, router])

  // Load restaurant name from theme
  useEffect(() => {
    const loadRestaurantName = async () => {
      if (params.slug) {
        try {
          const res = await fetch(`/api/restaurants/${params.slug}/theme`, { cache: 'no-store' })
          if (res.ok) {
            const themeData = await res.json()
            setRestaurantName(themeData.restaurantName || 'Restaurante Demo')
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
    }

    window.addEventListener('demo-theme-change' as any, handleThemeChange)
    return () => window.removeEventListener('demo-theme-change' as any, handleThemeChange)
  }, [params.slug])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black rounded-2xl p-10 border border-white/10">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-white opacity-5" style={{backgroundSize: '30px 30px'}} />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Bienvenido, {restaurantName}
                </h1>
                <p className="text-gray-400 mt-1">
                  Panel de Control · MenusCarta Professional
                </p>
              </div>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
              Gestiona tu menú digital con control total. Todos los cambios se reflejan
              <span className="text-white font-semibold"> instantáneamente</span> para tus clientes.
            </p>
          </div>

          {/* Decorative glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full filter blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full filter blur-[100px]" />
        </div>

        {/* Tab Content */}
        {activeTab === 'menu' && (
          <MenuEditor
            restaurantId={session.restaurantId}
            restaurantSlug={params.slug}
            isDemo={session.isDemo}
          />
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Ingredients Manager */}
            <IngredientsManager restaurantSlug={params.slug} />

            {/* Unavailable Ingredients Manager */}
            <UnavailableIngredientsManager restaurantSlug={params.slug} />
          </div>
        )}

        {activeTab === 'promotions' && (
          <PromotionsManager restaurantSlug={params.slug} />
        )}

        {activeTab === 'themes' && (
          <div className="space-y-6">
            {/* Theme Configuration Section */}
            <div>
              {session.isDemo ? (
                <DemoThemeSelector />
              ) : (
                <ThemeSelector restaurantId={session.restaurantId} restaurantSlug={params.slug} />
              )}
            </div>

            {/* QR Code Generator Section */}
            <div>
              <QRCodeGenerator
                restaurantSlug={session.slug}
                restaurantName={restaurantName}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function StatCard({
  title,
  value,
  icon,
  color
}: {
  title: string
  value: string
  icon: string
  color: 'blue' | 'green' | 'orange' | 'purple'
}) {
  const colors = {
    blue: 'from-ios-blue to-ios-indigo',
    green: 'from-ios-green to-ios-teal',
    orange: 'from-ios-orange to-ios-yellow',
    purple: 'from-ios-purple to-ios-pink',
  }

  return (
    <div className="bg-white rounded-ios-xl p-6 shadow-ios">
      <div className={`w-12 h-12 rounded-ios bg-gradient-to-br ${colors[color]} flex items-center justify-center text-2xl mb-4`}>
        {icon}
      </div>
      <h3 className="text-ios-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-ios-gray-900">{value}</p>
    </div>
  )
}
