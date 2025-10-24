/**
 * Currency configuration for MenusCarta
 * Supports multiple currencies with their symbols and formatting
 */

export interface Currency {
  code: string
  name: string
  symbol: string
  position: 'before' | 'after' // Posición del símbolo relativo al precio
  decimals: number
  thousandsSeparator: string
  decimalSeparator: string
}

export const CURRENCIES: Record<string, Currency> = {
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    position: 'before',
    decimals: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
  USD: {
    code: 'USD',
    name: 'Dólar Estadounidense',
    symbol: '$',
    position: 'before',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  MXN: {
    code: 'MXN',
    name: 'Peso Mexicano',
    symbol: '$',
    position: 'before',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  ARS: {
    code: 'ARS',
    name: 'Peso Argentino',
    symbol: '$',
    position: 'before',
    decimals: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
  CLP: {
    code: 'CLP',
    name: 'Peso Chileno',
    symbol: '$',
    position: 'before',
    decimals: 0,
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
  COP: {
    code: 'COP',
    name: 'Peso Colombiano',
    symbol: '$',
    position: 'before',
    decimals: 0,
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
  PEN: {
    code: 'PEN',
    name: 'Sol Peruano',
    symbol: 'S/',
    position: 'before',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  GBP: {
    code: 'GBP',
    name: 'Libra Esterlina',
    symbol: '£',
    position: 'before',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  BRL: {
    code: 'BRL',
    name: 'Real Brasileño',
    symbol: 'R$',
    position: 'before',
    decimals: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
  UYU: {
    code: 'UYU',
    name: 'Peso Uruguayo',
    symbol: '$U',
    position: 'before',
    decimals: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
}

/**
 * Format a price according to currency configuration
 */
export function formatPrice(amount: number, currencyCode: string = 'EUR'): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.EUR

  // Format the number with proper decimals
  let formattedAmount = amount.toFixed(currency.decimals)

  // Split into integer and decimal parts
  const parts = formattedAmount.split('.')
  let integerPart = parts[0]
  const decimalPart = parts[1]

  // Add thousands separator
  if (currency.thousandsSeparator) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator)
  }

  // Combine with decimal separator
  if (currency.decimals > 0 && decimalPart) {
    formattedAmount = `${integerPart}${currency.decimalSeparator}${decimalPart}`
  } else {
    formattedAmount = integerPart
  }

  // Add currency symbol
  if (currency.position === 'before') {
    return `${currency.symbol}${formattedAmount}`
  } else {
    return `${formattedAmount}${currency.symbol}`
  }
}

/**
 * Get currency by code
 */
export function getCurrency(code: string): Currency {
  return CURRENCIES[code] || CURRENCIES.EUR
}

/**
 * Get all available currencies as array
 */
export function getAllCurrencies(): Currency[] {
  return Object.values(CURRENCIES)
}
