/**
 * Utility functions for the weather application
 */

/**
 * Format temperature with unit
 * @param {number} temp - Temperature value
 * @param {string} unit - Temperature unit ('C' or 'F')
 * @param {boolean} showUnit - Whether to show the unit symbol
 * @returns {string} Formatted temperature
 */
export const formatTemperature = (temp, unit = 'C', showUnit = true) => {
  if (temp === null || temp === undefined) return '--'
  
  const rounded = Math.round(temp)
  const unitSymbol = unit === 'F' ? '°F' : '°C'
  
  return showUnit ? `${rounded}${unitSymbol}` : rounded.toString()
}

/**
 * Convert temperature between Celsius and Fahrenheit
 * @param {number} temp - Temperature value
 * @param {string} from - Source unit ('C' or 'F')
 * @param {string} to - Target unit ('C' or 'F')
 * @returns {number} Converted temperature
 */
export const convertTemperature = (temp, from, to) => {
  if (from === to) return temp
  
  if (from === 'C' && to === 'F') {
    return (temp * 9/5) + 32
  }
  
  if (from === 'F' && to === 'C') {
    return (temp - 32) * 5/9
  }
  
  return temp
}

/**
 * Format date and time
 * @param {Date|string|number} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'time', 'date')
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted date/time
 */
export const formatDateTime = (date, format = 'short', locale = 'en-US') => {
  if (!date) return '--'
  
  const dateObj = new Date(date)
  
  if (isNaN(dateObj.getTime())) return '--'
  
  const options = {
    short: { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    },
    long: { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    },
    time: { 
      hour: '2-digit', 
      minute: '2-digit' 
    },
    date: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }
  }
  
  return dateObj.toLocaleDateString(locale, options[format] || options.short)
}

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {Date|string|number} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '--'
  
  const dateObj = new Date(date)
  const now = new Date()
  const diffMs = now - dateObj
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  
  return formatDateTime(date, 'date')
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Generate a random ID
 * @param {number} length - Length of the ID
 * @returns {string} Random ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.split(' ').map(word => capitalize(word)).join(' ')
}

/**
 * Format file size in human readable format
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Get browser information
 * @returns {object} Browser info
 */
export const getBrowserInfo = () => {
  const ua = navigator.userAgent
  const browsers = {
    chrome: /chrome/i.test(ua) && !/edge/i.test(ua),
    firefox: /firefox/i.test(ua),
    safari: /safari/i.test(ua) && !/chrome/i.test(ua),
    edge: /edge/i.test(ua),
    ie: /msie|trident/i.test(ua)
  }
  
  const browserName = Object.keys(browsers).find(key => browsers[key]) || 'unknown'
  
  return {
    name: browserName,
    userAgent: ua,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine
  }
}

/**
 * Get device information
 * @returns {object} Device info
 */
export const getDeviceInfo = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent)
  const isDesktop = !isMobile && !isTablet
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1
  }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      textArea.remove()
      return result
    }
  } catch (error) {
    console.error('Failed to copy text to clipboard:', error)
    return false
  }
}

/**
 * Download data as file
 * @param {string} data - Data to download
 * @param {string} filename - Name of the file
 * @param {string} type - MIME type
 */
export const downloadFile = (data, filename, type = 'text/plain') => {
  const blob = new Blob([data], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Promise that resolves with function result
 */
export const retry = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (i === maxRetries) {
        throw lastError
      }
      
      const delay = baseDelay * Math.pow(2, i)
      await sleep(delay)
    }
  }
}

export default {
  formatTemperature,
  convertTemperature,
  formatDateTime,
  getRelativeTime,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  generateId,
  capitalize,
  toTitleCase,
  formatFileSize,
  isValidEmail,
  isValidUrl,
  getBrowserInfo,
  getDeviceInfo,
  copyToClipboard,
  downloadFile,
  sleep,
  retry
}