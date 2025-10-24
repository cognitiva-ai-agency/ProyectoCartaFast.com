import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'MenusCarta - Menús Digitales para Restaurantes',
  description: 'Crea y gestiona menús digitales para tu restaurante con actualizaciones en tiempo real',
  keywords: 'menú digital, restaurante, QR, carta digital',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="font-sf antialiased bg-ios-gray-50 text-ios-gray-900">
        {children}
      </body>
    </html>
  )
}
