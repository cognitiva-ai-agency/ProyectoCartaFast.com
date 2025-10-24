'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { isValidSlug } from '@/lib/utils'

export default function ClientesPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    slug: '',
    password: '',
  })
  const [errors, setErrors] = useState({
    slug: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {
      slug: '',
      password: '',
    }

    if (!formData.slug) {
      newErrors.slug = 'Ingresa el nombre de tu restaurante en la URL'
    } else if (!isValidSlug(formData.slug)) {
      newErrors.slug = 'Formato de URL inválido. Usa solo letras y números'
    }

    if (!formData.password) {
      newErrors.password = 'Ingresa tu contraseña'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    setErrors(newErrors)
    return !newErrors.slug && !newErrors.password
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      console.log('🔐 Attempting login with:', formData)

      // Call API to authenticate
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('📡 Login response status:', response.status)
      const data = await response.json()
      console.log('📦 Login response data:', data)

      if (response.ok) {
        console.log('✅ Login successful, redirecting to dashboard')
        // Redirect to dashboard
        router.push(`/dashboard/${formData.slug}`)
      } else {
        console.log('❌ Login failed:', data.error)
        setErrors({
          ...errors,
          password: data.error || 'Credenciales incorrectas',
        })
        setIsLoading(false)
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      setErrors({
        ...errors,
        password: 'Error al iniciar sesión. Intenta nuevamente.',
      })
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white opacity-[0.02]" style={{backgroundSize: '50px 50px'}} />

      {/* Decorative glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-[150px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">MenusCarta</h1>
          <p className="text-gray-400 text-lg">Portal de Acceso para Clientes</p>
        </div>

        {/* Login Card */}
        <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-8 border border-white/10 shadow-2xl backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Iniciar Sesión</h2>
            <p className="text-gray-400 text-sm">Accede al panel de control de tu restaurante</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* URL/Slug Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL de tu restaurante
              </label>
              <input
                type="text"
                placeholder="restoran1"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                className={`
                  w-full px-4 py-3 rounded-lg
                  bg-white/5 border ${errors.slug ? 'border-red-500' : 'border-white/10'}
                  text-white placeholder-gray-500
                  focus:outline-none focus:border-white/30 focus:bg-white/10
                  transition-all duration-200
                `}
                autoComplete="username"
              />
              {errors.slug && (
                <p className="mt-2 text-sm text-red-400">{errors.slug}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Ejemplo: si tu URL es menuscarta.com/restoran1, ingresa "restoran1"
              </p>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`
                  w-full px-4 py-3 rounded-lg
                  bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/10'}
                  text-white placeholder-gray-500
                  focus:outline-none focus:border-white/30 focus:bg-white/10
                  transition-all duration-200
                `}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-4 rounded-lg font-semibold text-black
                bg-white hover:bg-gray-100
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Ingresando...
                </>
              ) : (
                <>
                  Acceder al Panel
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* Help Text */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-gray-400 text-center">
                ¿Olvidaste tu contraseña?{' '}
                <a href="/contacto" className="text-white hover:underline font-medium">
                  Contáctanos
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </a>
        </div>

        {/* Demo Credentials Info */}
        <div className="mt-8 p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-gray-400 text-center">
            <strong className="text-white">Demo:</strong> restoran1 / 123456
          </p>
        </div>
      </div>
    </main>
  )
}
