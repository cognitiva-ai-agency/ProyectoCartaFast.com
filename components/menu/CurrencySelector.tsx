'use client'

import { useState } from 'react'
import { getAllCurrencies, getCurrency, formatPrice } from '@/lib/currencies'
import { Card, CardHeader, CardTitle, CardContent, Button, Select } from '@/components/ui'

interface CurrencySelectorProps {
  currentCurrency: string
  onCurrencyChange: (currencyCode: string) => void
}

/**
 * CurrencySelector - Permite seleccionar la moneda del menú
 */
export function CurrencySelector({ currentCurrency, onCurrencyChange }: CurrencySelectorProps) {
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency)
  const currencies = getAllCurrencies()
  const currentCurrencyData = getCurrency(selectedCurrency)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value
    setSelectedCurrency(newCurrency)
    onCurrencyChange(newCurrency)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moneda del Menú</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-ios-gray-600 mb-4 text-sm">
          Selecciona la moneda que se mostrará en tu menú
        </p>

        {/* Currency Selector */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ios-gray-900 mb-2">
              Moneda
            </label>
            <Select
              value={selectedCurrency}
              onChange={handleChange}
              className="w-full"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.symbol})
                </option>
              ))}
            </Select>
          </div>

          {/* Preview */}
          <div className="bg-ios-gray-50 rounded-ios-lg p-4">
            <p className="text-xs font-medium text-ios-gray-700 mb-2">
              Vista previa de precios:
            </p>
            <div className="space-y-1">
              <p className="text-sm text-ios-gray-900">
                <span className="text-ios-gray-600">Plato normal:</span>{' '}
                <span className="font-semibold">{formatPrice(12.50, selectedCurrency)}</span>
              </p>
              <p className="text-sm text-ios-gray-900">
                <span className="text-ios-gray-600">Plato premium:</span>{' '}
                <span className="font-semibold">{formatPrice(24.99, selectedCurrency)}</span>
              </p>
              <p className="text-sm text-ios-gray-900">
                <span className="text-ios-gray-600">Bebida:</span>{' '}
                <span className="font-semibold">{formatPrice(3.50, selectedCurrency)}</span>
              </p>
            </div>
          </div>

          {/* Currency Info */}
          <div className="bg-ios-blue/5 rounded-ios-lg p-3 border border-ios-blue/20">
            <p className="text-xs text-ios-gray-700">
              <strong>💡 Info:</strong> {currentCurrencyData.name} utiliza{' '}
              {currentCurrencyData.decimals === 0 ? 'sin decimales' : `${currentCurrencyData.decimals} decimales`}
              {' '}y el símbolo "{currentCurrencyData.symbol}" se muestra{' '}
              {currentCurrencyData.position === 'before' ? 'antes' : 'después'} del precio.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
