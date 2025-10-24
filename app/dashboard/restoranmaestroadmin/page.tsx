'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import RestaurantList from '@/components/admin/RestaurantList'
import RestaurantFormModal from '@/components/admin/RestaurantFormModal'
import { Button } from '@/components/ui/Button'

interface Restaurant {
  id: string
  slug: string
  name: string
  subscription_status: string
  logo_url?: string
  created_at: string
  updated_at: string
}

export default function AdminMasterPanel() {
  const router = useRouter()
  const { session, isLoading: authLoading } = useAuth()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verificar que sea admin
  useEffect(() => {
    if (!authLoading && (!session || !session.isAdmin)) {
      router.push('/clientes')
    }
  }, [session, authLoading, router])

  // Cargar restaurantes
  useEffect(() => {
    if (session?.isAdmin) {
      loadRestaurants()
    }
  }, [session])

  const loadRestaurants = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/admin/restaurants')

      if (!response.ok) {
        throw new Error('Error al cargar restaurantes')
      }

      const data = await response.json()
      setRestaurants(data.restaurants || [])
    } catch (err) {
      console.error('Error loading restaurants:', err)
      setError('Error al cargar los restaurantes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRestaurant = async (data: {
    name: string
    slug: string
    password: string
  }) => {
    try {
      const response = await fetch('/api/admin/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear restaurante')
      }

      // Recargar lista
      await loadRestaurants()
      setShowCreateModal(false)
    } catch (err: any) {
      throw err
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/restaurants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar estado')
      }

      // Recargar lista
      await loadRestaurants()
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Error al actualizar el estado del restaurante')
    }
  }

  const handleDeleteRestaurant = async (id: string) => {
    if (!confirm('¿Estás seguro de cancelar este restaurante?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/restaurants/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar restaurante')
      }

      // Recargar lista
      await loadRestaurants()
    } catch (err) {
      console.error('Error deleting restaurant:', err)
      alert('Error al eliminar el restaurante')
    }
  }

  if (authLoading || !session?.isAdmin) {
    return (
      <div className="min-h-screen bg-ios-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue mx-auto mb-4"></div>
          <p className="text-ios-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 to-ios-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-ios-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ios-gray-900">
                🎛️ Panel de Control Maestro
              </h1>
              <p className="mt-1 text-sm text-ios-gray-600">
                Gestiona todos los restaurantes de la plataforma
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-ios-blue text-white hover:bg-ios-blue/90"
            >
              <span className="mr-2">+</span>
              Nuevo Restaurante
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-ios-lg shadow-ios p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-ios-blue/10 rounded-full p-3">
                <svg className="w-6 h-6 text-ios-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ios-gray-600">Total Restaurantes</p>
                <p className="text-2xl font-bold text-ios-gray-900">{restaurants.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-ios-lg shadow-ios p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-ios-green/10 rounded-full p-3">
                <svg className="w-6 h-6 text-ios-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ios-gray-600">Activos</p>
                <p className="text-2xl font-bold text-ios-green">
                  {restaurants.filter(r => r.subscription_status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-ios-lg shadow-ios p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-ios-orange/10 rounded-full p-3">
                <svg className="w-6 h-6 text-ios-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ios-gray-600">Suspendidos</p>
                <p className="text-2xl font-bold text-ios-orange">
                  {restaurants.filter(r => r.subscription_status === 'suspended').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant List */}
        {error ? (
          <div className="bg-ios-red/10 border border-ios-red/20 rounded-ios-lg p-4 text-ios-red">
            {error}
          </div>
        ) : (
          <RestaurantList
            restaurants={restaurants}
            isLoading={isLoading}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteRestaurant}
            onRefresh={loadRestaurants}
          />
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <RestaurantFormModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRestaurant}
        />
      )}
    </div>
  )
}
