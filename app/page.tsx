import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black py-32 px-4">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-gray-300 font-medium">Plataforma Profesional para Restaurantes</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tight">
            Menús Digitales
            <br />
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">de Alta Gama</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Sistema de gestión de menús digitales diseñado para restaurantes que buscan
            <span className="text-white font-medium"> excelencia</span> y
            <span className="text-white font-medium"> control total</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/clientes">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 font-semibold px-8 py-6 text-lg">
                Portal de Clientes
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" className="bg-transparent border-2 border-white/20 text-white hover:bg-white/10 font-semibold px-8 py-6 text-lg">
                Explorar Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-[128px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-[128px]" />
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Sistema Completo
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Todas las herramientas profesionales que necesitas en una sola plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<EditorIcon />}
              title="Editor Profesional"
              description="Interfaz drag & drop avanzada con control total sobre cada elemento de tu menú"
            />
            <FeatureCard
              icon={<RealtimeIcon />}
              title="Actualización Instantánea"
              description="Cambios reflejados en milisegundos. Sin recargas ni demoras para tus clientes"
            />
            <FeatureCard
              icon={<QRIcon />}
              title="Código QR Permanente"
              description="URL fija y elegante. Tu menú evoluciona, el código permanece"
            />
            <FeatureCard
              icon={<ThemeIcon />}
              title="Diseños Premium"
              description="Temas cuidadosamente diseñados que reflejan la identidad de tu marca"
            />
            <FeatureCard
              icon={<PromotionsIcon />}
              title="Gestión de Ofertas"
              description="Sistema inteligente de promociones con horarios y fechas automáticas"
            />
            <FeatureCard
              icon={<SecurityIcon />}
              title="Máxima Seguridad"
              description="Protección empresarial. Acceso exclusivo para personal autorizado"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-bold text-black mb-2">99.9%</div>
              <div className="text-gray-600 font-medium">Uptime Garantizado</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-black mb-2">&lt;100ms</div>
              <div className="text-gray-600 font-medium">Tiempo de Respuesta</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-black mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Soporte Premium</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 bg-gradient-to-b from-gray-950 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Eleva tu Restaurante
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Únete a los establecimientos gastronómicos que han transformado
            su experiencia digital con MenusCarta
          </p>
          <Link href="/contacto">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 font-semibold px-10 py-7 text-xl">
              Solicitar Información
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-2xl font-bold text-white">
              MenusCarta
            </div>
            <div className="text-gray-500 text-sm">
              © 2025 MenusCarta. Sistema de gestión profesional de menús digitales.
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group relative bg-gradient-to-b from-gray-900 to-black rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="mb-6 text-white">
          {icon}
        </div>
        <h3 className="text-2xl font-semibold mb-3 text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// Professional SVG Icons
function EditorIcon() {
  return (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function RealtimeIcon() {
  return (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

function QRIcon() {
  return (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  )
}

function ThemeIcon() {
  return (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  )
}

function PromotionsIcon() {
  return (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  )
}

function SecurityIcon() {
  return (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}
