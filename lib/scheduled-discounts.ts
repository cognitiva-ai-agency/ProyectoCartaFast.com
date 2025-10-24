import { ScheduledDiscount, MenuItem } from '@/types'

/**
 * Check if a scheduled discount is currently active based on time and day
 * @param discount The scheduled discount configuration
 * @param timezone The timezone to use for calculations (e.g., 'America/Santiago')
 * @param currentDate Optional date to check (defaults to now)
 * @returns true if the discount should be active at the specified time
 */
export function isDiscountActive(
  discount: ScheduledDiscount,
  timezone: string = 'America/Santiago',
  currentDate: Date = new Date()
): boolean {
  // Check if discount is enabled
  if (!discount.is_active) {
    return false
  }

  try {
    // Get current day of week in the restaurant's timezone
    const dayName = currentDate.toLocaleString('en-US', {
      timeZone: timezone,
      weekday: 'long'
    })

    // Extract day of week (0 = Sunday, 6 = Saturday)
    const dayMapping: { [key: string]: number } = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6
    }
    const currentDay = dayMapping[dayName.trim()]

    // Check if current day is in the configured days
    if (!discount.days_of_week.includes(currentDay)) {
      return false
    }

    // Extract current time (HH:mm format)
    const currentTime = currentDate.toLocaleString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    // Compare times
    const [startHour, startMinute] = discount.start_time.split(':').map(Number)
    const [endHour, endMinute] = discount.end_time.split(':').map(Number)
    const [currentHour, currentMinute] = currentTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute
    const currentMinutes = currentHour * 60 + currentMinute

    // Handle cases where end time is past midnight
    if (endMinutes < startMinutes) {
      // Discount spans midnight (e.g., 22:00 to 02:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes
    } else {
      // Normal case (e.g., 17:00 to 19:00)
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes
    }
  } catch (err) {
    console.error('Error checking discount active status:', err)
    return false
  }
}

/**
 * Get all currently active discounts for a restaurant
 * @param discounts Array of scheduled discounts
 * @param timezone Restaurant's timezone
 * @param currentDate Optional date to check (defaults to now)
 * @returns Array of active discounts
 */
export function getActiveDiscounts(
  discounts: ScheduledDiscount[],
  timezone: string = 'America/Santiago',
  currentDate: Date = new Date()
): ScheduledDiscount[] {
  return discounts.filter(discount => isDiscountActive(discount, timezone, currentDate))
}

/**
 * Get active discount for a specific category
 * @param discounts Array of scheduled discounts
 * @param categoryId The category ID to check
 * @param timezone Restaurant's timezone
 * @param currentDate Optional date to check (defaults to now)
 * @returns The active discount for the category, or null if none
 */
export function getDiscountForCategory(
  discounts: ScheduledDiscount[],
  categoryId: string,
  timezone: string = 'America/Santiago',
  currentDate: Date = new Date()
): ScheduledDiscount | null {
  const activeDiscounts = getActiveDiscounts(discounts, timezone, currentDate)

  // Find discount for this category
  const categoryDiscount = activeDiscounts.find(d => d.category_id === categoryId)

  return categoryDiscount || null
}

/**
 * Calculate discounted price for a menu item
 * @param item The menu item
 * @param discount The scheduled discount to apply
 * @returns The discounted price
 */
export function calculateDiscountedPrice(
  item: MenuItem,
  discount: ScheduledDiscount
): number {
  const originalPrice = item.base_price || item.price || 0
  const discountAmount = originalPrice * (discount.discount_percentage / 100)
  return Math.round((originalPrice - discountAmount) * 100) / 100
}

/**
 * Apply scheduled discounts to menu items
 * @param items Array of menu items
 * @param discounts Array of scheduled discounts
 * @param timezone Restaurant's timezone
 * @param currentDate Optional date to check (defaults to now)
 * @returns Menu items with scheduled discounts applied
 */
export function applyScheduledDiscounts(
  items: MenuItem[],
  discounts: ScheduledDiscount[],
  timezone: string = 'America/Santiago',
  currentDate: Date = new Date()
): MenuItem[] {
  const activeDiscounts = getActiveDiscounts(discounts, timezone, currentDate)

  return items.map(item => {
    // Find discount for this item's category
    const discount = activeDiscounts.find(d => d.category_id === item.category_id)

    if (!discount) {
      return item
    }

    // Apply scheduled discount
    const discountedPrice = calculateDiscountedPrice(item, discount)

    return {
      ...item,
      is_promotion: true,
      promotion_price: discountedPrice,
      // Store discount info for display
      scheduled_discount: {
        name: discount.name,
        percentage: discount.discount_percentage
      }
    }
  })
}

/**
 * Get human-readable time range for a discount
 * @param discount The scheduled discount
 * @returns Formatted time range string (e.g., "17:00 - 19:00")
 */
export function getDiscountTimeRange(discount: ScheduledDiscount): string {
  return `${discount.start_time} - ${discount.end_time}`
}

/**
 * Get human-readable days for a discount
 * @param discount The scheduled discount
 * @returns Formatted days string (e.g., "Lun, Mar, Mié")
 */
export function getDiscountDays(discount: ScheduledDiscount): string {
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  if (discount.days_of_week.length === 7) {
    return 'Todos los días'
  }

  if (discount.days_of_week.length === 0) {
    return 'Ningún día'
  }

  return discount.days_of_week
    .sort((a, b) => a - b)
    .map(day => dayNames[day])
    .join(', ')
}

/**
 * Get the next activation time for a discount
 * @param discount The scheduled discount
 * @param timezone Restaurant's timezone
 * @param currentDate Optional date to check (defaults to now)
 * @returns Object with next activation info
 */
export function getNextActivation(
  discount: ScheduledDiscount,
  timezone: string = 'America/Santiago',
  currentDate: Date = new Date()
): {
  isActiveNow: boolean
  nextActivation: Date | null
  timeUntilNext: number | null // milliseconds
  nextDay: string
} {
  if (!discount.is_active || discount.days_of_week.length === 0) {
    return {
      isActiveNow: false,
      nextActivation: null,
      timeUntilNext: null,
      nextDay: 'N/A'
    }
  }

  try {
    const isActive = isDiscountActive(discount, timezone, currentDate)

    // Get current time in restaurant's timezone
    const currentTimeString = currentDate.toLocaleString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    const currentDayString = currentDate.toLocaleString('en-US', {
      timeZone: timezone,
      weekday: 'long'
    })

    const dayMapping: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    }

    const dayNamesLong = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

    const currentDay = dayMapping[currentDayString.trim()]
    const [currentHour, currentMinute] = currentTimeString.split(':').map(Number)
    const currentMinutes = currentHour * 60 + currentMinute

    const [startHour, startMinute] = discount.start_time.split(':').map(Number)
    const [endHour, endMinute] = discount.end_time.split(':').map(Number)
    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    if (isActive) {
      // Currently active, calculate when it ends
      let endTime: Date

      if (endMinutes < startMinutes) {
        // Ends tomorrow
        endTime = new Date(currentDate)
        endTime.setHours(endHour, endMinute, 0, 0)
        if (currentMinutes > startMinutes) {
          endTime.setDate(endTime.getDate() + 1)
        }
      } else {
        // Ends today
        endTime = new Date(currentDate)
        endTime.setHours(endHour, endMinute, 0, 0)
      }

      return {
        isActiveNow: true,
        nextActivation: endTime,
        timeUntilNext: endTime.getTime() - currentDate.getTime(),
        nextDay: 'Activo ahora'
      }
    }

    // Not active, find next activation
    // Check if it will activate later today
    if (discount.days_of_week.includes(currentDay) && currentMinutes < startMinutes) {
      const nextStart = new Date(currentDate)
      nextStart.setHours(startHour, startMinute, 0, 0)

      return {
        isActiveNow: false,
        nextActivation: nextStart,
        timeUntilNext: nextStart.getTime() - currentDate.getTime(),
        nextDay: 'Hoy'
      }
    }

    // Find next day it will be active
    let daysUntilNext = 1
    let nextDay = (currentDay + 1) % 7

    while (daysUntilNext <= 7) {
      if (discount.days_of_week.includes(nextDay)) {
        const nextStart = new Date(currentDate)
        nextStart.setDate(nextStart.getDate() + daysUntilNext)
        nextStart.setHours(startHour, startMinute, 0, 0)

        return {
          isActiveNow: false,
          nextActivation: nextStart,
          timeUntilNext: nextStart.getTime() - currentDate.getTime(),
          nextDay: dayNamesLong[nextDay]
        }
      }

      daysUntilNext++
      nextDay = (nextDay + 1) % 7
    }

    // Should never reach here if discount has valid days
    return {
      isActiveNow: false,
      nextActivation: null,
      timeUntilNext: null,
      nextDay: 'N/A'
    }
  } catch (err) {
    console.error('Error calculating next activation:', err)
    return {
      isActiveNow: false,
      nextActivation: null,
      timeUntilNext: null,
      nextDay: 'Error'
    }
  }
}

/**
 * Format time remaining in human-readable format
 * @param milliseconds Time in milliseconds
 * @returns Formatted string (e.g., "2h 30m", "45m", "5 días")
 */
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) {
    return 'Ahora'
  }

  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    const remainingHours = hours % 24
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days} día${days > 1 ? 's' : ''}`
  }

  if (hours > 0) {
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  if (minutes > 0) {
    return `${minutes}m`
  }

  return 'Menos de 1m'
}
