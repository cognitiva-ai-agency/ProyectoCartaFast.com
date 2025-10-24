'use client'

import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

export interface QRCodeGeneratorProps {
  restaurantSlug: string
  restaurantName: string
}

/**
 * QR Code Generator Component
 * Generates and allows download of QR code for restaurant menu
 */
export function QRCodeGenerator({ restaurantSlug, restaurantName }: QRCodeGeneratorProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://menuscarta.com'}/${restaurantSlug}`

  const downloadQR = () => {
    if (!qrRef.current) return

    const svg = qrRef.current.querySelector('svg')
    if (!svg) return

    // Convert SVG to PNG for download
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    canvas.width = 1000
    canvas.height = 1000

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 1000, 1000)
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${restaurantSlug}-qr-code.png`
        link.click()
        URL.revokeObjectURL(url)
      })
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const downloadSVG = () => {
    if (!qrRef.current) return

    const svg = qrRef.current.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${restaurantSlug}-qr-code.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  const printQR = () => {
    if (!qrRef.current) return

    const printWindow = window.open('', '', 'width=600,height=600')
    if (!printWindow) return

    const svg = qrRef.current.querySelector('svg')
    if (!svg) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${restaurantName} - Código QR</title>
          <style>
            body {
              margin: 0;
              padding: 40px;
              text-align: center;
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 20px;
            }
            .qr-container {
              margin: 30px 0;
            }
            .url {
              font-size: 18px;
              color: #666;
              margin-top: 20px;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${restaurantName}</h1>
            <div class="qr-container">
              ${svg.outerHTML}
            </div>
            <p class="url">${menuUrl}</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Código QR de tu Menú</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="flex flex-col items-center">
            <div
              ref={qrRef}
              className="bg-white p-8 rounded-ios-xl shadow-ios-lg inline-block"
            >
              <QRCodeSVG
                value={menuUrl}
                size={300}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: '/images/logo.png',
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-ios-gray-600 mb-1">Tu URL única:</p>
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ios-blue hover:underline font-medium"
              >
                {menuUrl}
              </a>
            </div>
          </div>

          {/* Info */}
          <div className="bg-ios-blue/5 rounded-ios-lg p-4">
            <p className="text-sm text-ios-gray-700">
              <strong>✨ Importante:</strong> Este código QR es permanente. Aunque actualices tu menú,
              el QR siempre apuntará a la versión más reciente. No necesitas regenerarlo.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={downloadQR}
              variant="primary"
              className="flex-1"
            >
              📥 Descargar PNG
            </Button>
            <Button
              onClick={downloadSVG}
              variant="outline"
              className="flex-1"
            >
              📄 Descargar SVG
            </Button>
            <Button
              onClick={printQR}
              variant="outline"
              className="flex-1"
            >
              🖨️ Imprimir
            </Button>
          </div>

          {/* Usage Tips */}
          <div className="space-y-2">
            <h4 className="font-semibold text-ios-gray-900">Consejos de uso:</h4>
            <ul className="text-sm text-ios-gray-600 space-y-1 list-disc list-inside">
              <li>Imprime el QR en alta calidad para mesas, mostradores o ventanas</li>
              <li>Incluye el código en tus redes sociales y material promocional</li>
              <li>Asegúrate de que haya buena iluminación al escanear</li>
              <li>El formato SVG es ideal para impresiones de gran tamaño</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
