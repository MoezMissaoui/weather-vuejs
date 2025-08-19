import { computed } from 'vue'
import { useWeatherStore } from '@/stores/weather'

/**
 * Weather Composable - Provides reactive weather data and utility functions
 * 
 * This composable offers:
 * - Reactive access to weather store state
 * - Weather icon and styling utilities
 * - Data formatting functions
 * - Weather-related calculations
 * - Direct access to store actions
 * 
 * @returns {Object} Weather composable interface
 * @returns {ComputedRef<Array>} returns.weatherData - Reactive weather forecast data
 * @returns {ComputedRef<Array|null>} returns.geocodingData - Reactive location data
 * @returns {ComputedRef<boolean>} returns.loading - Reactive loading state
 * @returns {ComputedRef<string|null>} returns.error - Reactive error message
 * @returns {ComputedRef<boolean>} returns.hasWeatherData - Whether weather data exists
 * @returns {ComputedRef<string>} returns.locationTitle - Formatted location title
 * @returns {ComputedRef<Object|null>} returns.currentWeather - Current weather object
 * @returns {ComputedRef<number|null>} returns.currentTemperature - Current temperature
 * @returns {ComputedRef<string|null>} returns.currentDescription - Current weather description
 * @returns {Function} returns.getWeatherIcon - Get FontAwesome icon for weather
 * @returns {Function} returns.getWeatherIconClass - Get CSS class for weather
 * @returns {Function} returns.formatTemperature - Format temperature with unit
 * @returns {Function} returns.formatDate - Format date for display
 * @returns {Function} returns.formatTime - Format time for display
 * @returns {Function} returns.getWindDirection - Convert degrees to direction
 * @returns {Function} returns.getVisibilityDescription - Get visibility description
 * @returns {Function} returns.getUVIndexDescription - Get UV index description
 * @returns {Function} returns.fetchWeatherData - Fetch weather for region
 * @returns {Function} returns.retryFetch - Retry failed weather fetch
 * @returns {Function} returns.clearWeatherData - Clear all weather data
 * @returns {Function} returns.clearError - Clear error state
 * 
 * @example
 * ```js
 * import { useWeather } from '@/composables/useWeather'
 * 
 * export default {
 *   setup() {
 *     const {
 *       weatherData,
 *       loading,
 *       error,
 *       fetchWeatherData,
 *       formatTemperature,
 *       getWeatherIcon
 *     } = useWeather()
 * 
 *     // Fetch weather for London
 *     fetchWeatherData('London')
 * 
 *     return {
 *       weatherData,
 *       loading,
 *       error,
 *       formatTemperature,
 *       getWeatherIcon
 *     }
 *   }
 * }
 * ```
 */
export function useWeather() {
  const weatherStore = useWeatherStore()

  // Reactive computed properties
  const weatherData = computed(() => weatherStore.weatherData)
  const geocodingData = computed(() => weatherStore.geocodingData)
  const loading = computed(() => weatherStore.loading)
  const error = computed(() => weatherStore.error)
  const hasWeatherData = computed(() => weatherStore.hasWeatherData)
  const locationTitle = computed(() => weatherStore.locationTitle)
  const currentWeather = computed(() => weatherStore.currentWeather)
  const currentTemperature = computed(() => weatherStore.currentTemperature)
  const currentDescription = computed(() => weatherStore.currentDescription)

  // Weather utility functions
  /**
   * Get FontAwesome icon class for weather condition
   * @param {string} weatherMain - Main weather condition (e.g., 'Clear', 'Rain')
   * @returns {string} FontAwesome icon class
   * @example
   * ```js
   * const icon = getWeatherIcon('Rain') // 'fas fa-cloud-rain'
   * ```
   */
  const getWeatherIcon = (weatherMain) => {
    const iconMap = {
      'Clear': 'fas fa-sun',
      'Clouds': 'fas fa-cloud',
      'Rain': 'fas fa-cloud-rain',
      'Drizzle': 'fas fa-cloud-drizzle',
      'Thunderstorm': 'fas fa-bolt',
      'Snow': 'fas fa-snowflake',
      'Mist': 'fas fa-smog',
      'Smoke': 'fas fa-smog',
      'Haze': 'fas fa-smog',
      'Dust': 'fas fa-smog',
      'Fog': 'fas fa-smog',
      'Sand': 'fas fa-smog',
      'Ash': 'fas fa-smog',
      'Squall': 'fas fa-wind',
      'Tornado': 'fas fa-tornado'
    }
    return iconMap[weatherMain] || 'fas fa-question'
  }

  /**
   * Get CSS class for weather condition styling
   * @param {string} weatherMain - Main weather condition
   * @returns {string} CSS class name for weather styling
   * @example
   * ```js
   * const cssClass = getWeatherIconClass('Clear') // 'weather-sunny'
   * ```
   */
  const getWeatherIconClass = (weatherMain) => {
    const classMap = {
      'Clear': 'weather-sunny',
      'Clouds': 'weather-cloudy',
      'Rain': 'weather-rainy',
      'Drizzle': 'weather-drizzle',
      'Thunderstorm': 'weather-stormy',
      'Snow': 'weather-snowy',
      'Mist': 'weather-misty',
      'Smoke': 'weather-misty',
      'Haze': 'weather-misty',
      'Dust': 'weather-misty',
      'Fog': 'weather-misty',
      'Sand': 'weather-misty',
      'Ash': 'weather-misty',
      'Squall': 'weather-windy',
      'Tornado': 'weather-stormy'
    }
    return classMap[weatherMain] || 'weather-default'
  }

  /**
   * Format temperature value with unit
   * @param {number|null} temp - Temperature in Celsius
   * @returns {string} Formatted temperature string
   * @example
   * ```js
   * const formatted = formatTemperature(23.7) // '24°C'
   * const invalid = formatTemperature(null) // 'N/A'
   * ```
   */
  const formatTemperature = (temp) => {
    return temp ? `${Math.round(temp)}°C` : 'N/A'
  }

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date (e.g., 'Mon, Dec 25')
   * @example
   * ```js
   * const formatted = formatDate('2023-12-25T12:00:00Z') // 'Mon, Dec 25'
   * ```
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  /**
   * Format time for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted time (e.g., '02:30 PM')
   * @example
   * ```js
   * const formatted = formatTime('2023-12-25T14:30:00Z') // '02:30 PM'
   * ```
   */
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Convert wind direction from degrees to compass direction
   * @param {number} degrees - Wind direction in degrees (0-360)
   * @returns {string} Compass direction (e.g., 'N', 'NE', 'SW')
   * @example
   * ```js
   * const direction = getWindDirection(45) // 'NE'
   * const direction = getWindDirection(180) // 'S'
   * ```
   */
  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  }

  /**
   * Get human-readable visibility description
   * @param {number} visibility - Visibility in meters
   * @returns {string} Visibility description
   * @example
   * ```js
   * const desc = getVisibilityDescription(10000) // 'Excellent'
   * const desc = getVisibilityDescription(1500) // 'Moderate'
   * ```
   */
  const getVisibilityDescription = (visibility) => {
    if (visibility >= 10000) return 'Excellent'
    if (visibility >= 5000) return 'Good'
    if (visibility >= 2000) return 'Moderate'
    if (visibility >= 1000) return 'Poor'
    return 'Very Poor'
  }

  /**
   * Get UV index risk description
   * @param {number} uvIndex - UV index value
   * @returns {string} UV risk description
   * @example
   * ```js
   * const risk = getUVIndexDescription(3) // 'Moderate'
   * const risk = getUVIndexDescription(9) // 'Very High'
   * ```
   */
  const getUVIndexDescription = (uvIndex) => {
    if (uvIndex <= 2) return 'Low'
    if (uvIndex <= 5) return 'Moderate'
    if (uvIndex <= 7) return 'High'
    if (uvIndex <= 10) return 'Very High'
    return 'Extreme'
  }

  // Store actions
  const fetchWeatherData = weatherStore.fetchWeatherData
  const retryFetch = weatherStore.retryFetch
  const clearWeatherData = weatherStore.clearWeatherData
  const clearError = weatherStore.clearError

  return {
    // Reactive data
    weatherData,
    geocodingData,
    loading,
    error,
    hasWeatherData,
    locationTitle,
    currentWeather,
    currentTemperature,
    currentDescription,
    
    // Utility functions
    getWeatherIcon,
    getWeatherIconClass,
    formatTemperature,
    formatDate,
    formatTime,
    getWindDirection,
    getVisibilityDescription,
    getUVIndexDescription,
    
    // Store actions
    fetchWeatherData,
    retryFetch,
    clearWeatherData,
    clearError
  }
}