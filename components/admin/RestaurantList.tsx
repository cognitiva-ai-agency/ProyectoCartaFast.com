'use client'

import Link from 'next/link'

interface Restaurant {
  id: string
  slug: string
  name: string
  subscription_status: string
  logo_url?: string
  created_at: string
  updated_at: string
}

interface RestaurantListProps {
  restaurants: Restaurant[]
  isLoading: boolean
  onUpdateStatus: (id: string, newStatus: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onRefresh: () => Promise<void>
}

export default function RestaurantList({
  restaurants,
  isLoading,
  onUpdateStatus,
  onDelete,
  onRefresh,
}: RestaurantListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-ios-lg shadow-ios p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue mx-auto mb-4"></div>
          <p className="text-ios-gray-600">Cargando restaurantes...</p>
        </div>
      </div>
    )
  }

  if (restaurants.length === 0) {
    return (
      <div className="bg-white rounded-ios-lg shadow-ios p-12 text-center">
        <svg className="w-16 h-16 text-ios-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 className="text-lg font-medium text-ios-gray-900 mb-2">
          No hay restaurantes registrados
        </h3>
        <p className="text-ios-gray-600">
          Crea tu primer restaurante usando el botón "Nuevo Restaurante"
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-ios-lg shadow-ios overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-ios-gray-200">
          <thead className="bg-ios-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-ios-gray-500 uppercase tracking-wider">
                Restaurante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-ios-gray-500 uppercase tracking-wider">
                URL/Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-ios-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-ios-gray-500 uppercase tracking-wider">
                Creado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-ios-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-ios-gray-200">
            {restaurants.map((restaurant) => (
              <tr key={restaurant.id} className="hover:bg-ios-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {restaurant.logo_url ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={restaurant.logo_url}
                          alt={restaurant.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-ios-blue/10 flex items-center justify-center">
                          <span className="text-ios-blue font-bold text-lg">
                            {restaurant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-ios-gray-900">
                        {restaurant.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-ios-gray-900 font-mono">
                    /{restaurant.slug}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={restaurant.subscription_status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-ios-gray-500">
                  {new Date(restaurant.created_at).toLocaleDateString('es-CL')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {/* Toggle Status */}
                    <button
                      onClick={() => {
                        const newStatus = restaurant.subscription_status === 'active' ? 'suspended' : 'active'
                        onUpdateStatus(restaurant.id, newStatus)
                      }}
                      className={`px-3 py-1 rounded-ios text-xs font-medium transition-colors ${
                        restaurant.subscription_status === 'active'
                          ? 'bg-ios-orange/10 text-ios-orange hover:bg-ios-orange/20'
                          : 'bg-ios-green/10 text-ios-green hover:bg-ios-green/20'
                      }`}
                      title={restaurant.subscription_status === 'active' ? 'Suspender' : 'Activar'}
                    >
                      {restaurant.subscription_status === 'active' ? '⏸️ Suspender' : '▶️ Activar'}
                    </button>

                    {/* View Dashboard */}
                    <Link
                      href={`/dashboard/${restaurant.slug}`}
                      target="_blank"
                      className="p-2 text-ios-blue hover:bg-ios-blue/10 rounded-ios transition-colors"
                      title="Ver Dashboard"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>

                    {/* View Menu */}
                    <Link
                      href={`/${restaurant.slug}`}
                      target="_blank"
                      className="p-2 text-ios-green hover:bg-ios-green/10 rounded-ios transition-colors"
                      title="Ver Menú Público"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(restaurant.id)}
                      className="p-2 text-ios-red hover:bg-ios-red/10 rounded-ios transition-colors"
                      title="Cancelar Restaurante"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    active: 'bg-ios-green/10 text-ios-green border-ios-green/20',
    suspended: 'bg-ios-orange/10 text-ios-orange border-ios-orange/20',
    cancelled: 'bg-ios-red/10 text-ios-red border-ios-red/20',
    trial: 'bg-ios-blue/10 text-ios-blue border-ios-blue/20',
  }

  const labels = {
    active: '✅ Activo',
    suspended: '⏸️ Suspendido',
    cancelled: '❌ Cancelado',
    trial: '🎁 Prueba',
  }

  return (
    <span
      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
        styles[status as keyof typeof styles] || styles.active
      }`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  )
}
