/**
 * Data formatting utilities for consistent presentation
 */

/**
 * Weather-specific formatters
 */
export const weatherFormatters = {
  /**
   * Format temperature with proper unit and rounding
   * @param {number} temp - Temperature value
   * @param {string} unit - Unit ('C', 'F', 'K')
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted temperature
   */
  temperature(temp, unit = 'C', decimals = 0) {
    if (temp === null || temp === undefined || isNaN(temp)) return '--'
    
    const rounded = Number(temp.toFixed(decimals))
    const symbols = { C: '°C', F: '°F', K: 'K' }
    
    return `${rounded}${symbols[unit] || '°C'}`
  },

  /**
   * Format humidity percentage
   * @param {number} humidity - Humidity value (0-100)
   * @returns {string} Formatted humidity
   */
  humidity(humidity) {
    if (humidity === null || humidity === undefined || isNaN(humidity)) return '--'
    return `${Math.round(humidity)}%`
  },

  /**
   * Format pressure with unit
   * @param {number} pressure - Pressure value
   * @param {string} unit - Unit ('hPa', 'inHg', 'mmHg')
   * @returns {string} Formatted pressure
   */
  pressure(pressure, unit = 'hPa') {
    if (pressure === null || pressure === undefined || isNaN(pressure)) return '--'
    
    let value = pressure
    let displayUnit = unit
    
    // Convert if needed
    if (unit === 'inHg' && pressure > 100) {
      value = pressure * 0.02953 // hPa to inHg
    } else if (unit === 'mmHg' && pressure > 100) {
      value = pressure * 0.75006 // hPa to mmHg
    }
    
    const decimals = unit === 'hPa' ? 0 : 2
    return `${value.toFixed(decimals)} ${displayUnit}`
  },

  /**
   * Format wind speed with direction
   * @param {number} speed - Wind speed
   * @param {number} direction - Wind direction in degrees
   * @param {string} unit - Speed unit ('m/s', 'km/h', 'mph', 'knots')
   * @returns {string} Formatted wind
   */
  wind(speed, direction, unit = 'm/s') {
    if (speed === null || speed === undefined || isNaN(speed)) return '--'
    
    let convertedSpeed = speed
    
    // Convert from m/s to other units
    switch (unit) {
      case 'km/h':
        convertedSpeed = speed * 3.6
        break
      case 'mph':
        convertedSpeed = speed * 2.237
        break
      case 'knots':
        convertedSpeed = speed * 1.944
        break
    }
    
    const formattedSpeed = `${convertedSpeed.toFixed(1)} ${unit}`
    
    if (direction !== null && direction !== undefined && !isNaN(direction)) {
      const windDirection = this.windDirection(direction)
      return `${formattedSpeed} ${windDirection}`
    }
    
    return formattedSpeed
  },

  /**
   * Convert wind direction degrees to compass direction
   * @param {number} degrees - Wind direction in degrees
   * @returns {string} Compass direction
   */
  windDirection(degrees) {
    if (degrees === null || degrees === undefined || isNaN(degrees)) return '--'
    
    const directions = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ]
    
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  },

  /**
   * Format visibility distance
   * @param {number} visibility - Visibility in meters
   * @param {string} unit - Unit ('km', 'mi')
   * @returns {string} Formatted visibility
   */
  visibility(visibility, unit = 'km') {
    if (visibility === null || visibility === undefined || isNaN(visibility)) return '--'
    
    let value = visibility / 1000 // Convert meters to kilometers
    
    if (unit === 'mi') {
      value = value * 0.621371 // Convert km to miles
    }
    
    if (value >= 10) {
      return `${Math.round(value)} ${unit}`
    } else {
      return `${value.toFixed(1)} ${unit}`
    }
  },

  /**
   * Format UV index with description
   * @param {number} uvIndex - UV index value
   * @returns {string} Formatted UV index with description
   */
  uvIndex(uvIndex) {
    if (uvIndex === null || uvIndex === undefined || isNaN(uvIndex)) return '--'
    
    const rounded = Math.round(uvIndex)
    let description = ''
    
    if (rounded <= 2) description = 'Low'
    else if (rounded <= 5) description = 'Moderate'
    else if (rounded <= 7) description = 'High'
    else if (rounded <= 10) description = 'Very High'
    else description = 'Extreme'
    
    return `${rounded} (${description})`
  },

  /**
   * Format precipitation amount
   * @param {number} amount - Precipitation amount in mm
   * @param {string} unit - Unit ('mm', 'in')
   * @returns {string} Formatted precipitation
   */
  precipitation(amount, unit = 'mm') {
    if (amount === null || amount === undefined || isNaN(amount)) return '--'
    
    let value = amount
    
    if (unit === 'in') {
      value = amount * 0.0393701 // Convert mm to inches
    }
    
    const decimals = unit === 'mm' ? 1 : 2
    return `${value.toFixed(decimals)} ${unit}`
  }
}

/**
 * Date and time formatters
 */
export const dateTimeFormatters = {
  /**
   * Format date in various styles
   * @param {Date|string|number} date - Date to format
   * @param {string} style - Format style
   * @param {string} locale - Locale for formatting
   * @returns {string} Formatted date
   */
  date(date, style = 'medium', locale = 'en-US') {
    if (!date) return '--'
    
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return '--'
    
    const options = {
      short: { month: 'short', day: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
      weekday: { weekday: 'long' },
      monthDay: { month: 'long', day: 'numeric' }
    }
    
    return dateObj.toLocaleDateString(locale, options[style] || options.medium)
  },

  /**
   * Format time in various styles
   * @param {Date|string|number} date - Date to format
   * @param {string} style - Format style
   * @param {string} locale - Locale for formatting
   * @returns {string} Formatted time
   */
  time(date, style = 'short', locale = 'en-US') {
    if (!date) return '--'
    
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return '--'
    
    const options = {
      short: { hour: '2-digit', minute: '2-digit' },
      medium: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
      long: { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }
    }
    
    return dateObj.toLocaleTimeString(locale, options[style] || options.short)
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   * @param {Date|string|number} date - Date to compare
   * @param {Date} now - Reference date (defaults to current time)
   * @returns {string} Relative time string
   */
  relative(date, now = new Date()) {
    if (!date) return '--'
    
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return '--'
    
    const diffMs = now - dateObj
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)
    const diffWeek = Math.floor(diffDay / 7)
    const diffMonth = Math.floor(diffDay / 30)
    const diffYear = Math.floor(diffDay / 365)
    
    if (diffSec < 60) return 'Just now'
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`
    if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`
    if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`
    if (diffWeek < 4) return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`
    if (diffMonth < 12) return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`
    return `${diffYear} year${diffYear !== 1 ? 's' : ''} ago`
  },

  /**
   * Format duration in human readable format
   * @param {number} milliseconds - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  duration(milliseconds) {
    if (!milliseconds || isNaN(milliseconds)) return '--'
    
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }
}

/**
 * Number formatters
 */
export const numberFormatters = {
  /**
   * Format number with locale-specific formatting
   * @param {number} number - Number to format
   * @param {string} locale - Locale for formatting
   * @param {Object} options - Intl.NumberFormat options
   * @returns {string} Formatted number
   */
  number(number, locale = 'en-US', options = {}) {
    if (number === null || number === undefined || isNaN(number)) return '--'
    
    return new Intl.NumberFormat(locale, options).format(number)
  },

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (e.g., 'USD', 'EUR')
   * @param {string} locale - Locale for formatting
   * @returns {string} Formatted currency
   */
  currency(amount, currency = 'USD', locale = 'en-US') {
    if (amount === null || amount === undefined || isNaN(amount)) return '--'
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount)
  },

  /**
   * Format percentage
   * @param {number} value - Value to format as percentage
   * @param {number} decimals - Number of decimal places
   * @param {string} locale - Locale for formatting
   * @returns {string} Formatted percentage
   */
  percentage(value, decimals = 1, locale = 'en-US') {
    if (value === null || value === undefined || isNaN(value)) return '--'
    
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100)
  },

  /**
   * Format file size in human readable format
   * @param {number} bytes - Size in bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted file size
   */
  fileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes'
    if (bytes === null || bytes === undefined || isNaN(bytes)) return '--'
    
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
    
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  },

  /**
   * Format large numbers with abbreviations (K, M, B)
   * @param {number} number - Number to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted number with abbreviation
   */
  abbreviate(number, decimals = 1) {
    if (number === null || number === undefined || isNaN(number)) return '--'
    
    const abbrev = ['', 'K', 'M', 'B', 'T']
    const tier = Math.log10(Math.abs(number)) / 3 | 0
    
    if (tier === 0) return number.toString()
    
    const suffix = abbrev[tier]
    const scale = Math.pow(10, tier * 3)
    const scaled = number / scale
    
    return scaled.toFixed(decimals) + suffix
  }
}

/**
 * Text formatters
 */
export const textFormatters = {
  /**
   * Capitalize first letter of each word
   * @param {string} text - Text to format
   * @returns {string} Title case text
   */
  titleCase(text) {
    if (!text || typeof text !== 'string') return ''
    
    return text.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  },

  /**
   * Capitalize first letter of first word
   * @param {string} text - Text to format
   * @returns {string} Sentence case text
   */
  sentenceCase(text) {
    if (!text || typeof text !== 'string') return ''
    
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  },

  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @param {string} suffix - Suffix to add (default: '...')
   * @returns {string} Truncated text
   */
  truncate(text, maxLength, suffix = '...') {
    if (!text || typeof text !== 'string') return ''
    if (text.length <= maxLength) return text
    
    return text.slice(0, maxLength - suffix.length) + suffix
  },

  /**
   * Convert text to slug format
   * @param {string} text - Text to convert
   * @returns {string} Slug format text
   */
  slug(text) {
    if (!text || typeof text !== 'string') return ''
    
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  },

  /**
   * Format phone number
   * @param {string} phone - Phone number to format
   * @param {string} format - Format pattern
   * @returns {string} Formatted phone number
   */
  phone(phone, format = '(###) ###-####') {
    if (!phone) return ''
    
    const cleaned = phone.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    
    if (match) {
      return format
        .replace(/###/g, () => match.shift())
    }
    
    return phone
  }
}

/**
 * Location formatters
 */
export const locationFormatters = {
  /**
   * Format coordinates
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted coordinates
   */
  coordinates(lat, lng, decimals = 4) {
    if (lat === null || lat === undefined || lng === null || lng === undefined) return '--'
    if (isNaN(lat) || isNaN(lng)) return '--'
    
    return `${lat.toFixed(decimals)}, ${lng.toFixed(decimals)}`
  },

  /**
   * Format address components
   * @param {Object} address - Address object
   * @returns {string} Formatted address
   */
  address(address) {
    if (!address || typeof address !== 'object') return '--'
    
    const parts = []
    
    if (address.street) parts.push(address.street)
    if (address.city) parts.push(address.city)
    if (address.state) parts.push(address.state)
    if (address.country) parts.push(address.country)
    
    return parts.join(', ') || '--'
  },

  /**
   * Format distance
   * @param {number} distance - Distance in meters
   * @param {string} unit - Unit ('km', 'mi')
   * @returns {string} Formatted distance
   */
  distance(distance, unit = 'km') {
    if (distance === null || distance === undefined || isNaN(distance)) return '--'
    
    let value = distance / 1000 // Convert to kilometers
    
    if (unit === 'mi') {
      value = value * 0.621371 // Convert to miles
    }
    
    if (value < 1) {
      const meters = Math.round(distance)
      return `${meters} m`
    }
    
    return `${value.toFixed(1)} ${unit}`
  }
}

// Export all formatters as a single object
export default {
  weather: weatherFormatters,
  dateTime: dateTimeFormatters,
  number: numberFormatters,
  text: textFormatters,
  location: locationFormatters
}