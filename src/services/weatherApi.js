import axios from 'axios'
import { API_config } from '@/config.js'

/**
 * Weather API Service - Handles all weather-related API calls
 * 
 * This service provides:
 * - Weather forecast data retrieval
 * - Current weather data retrieval
 * - Weather alerts fetching
 * - Comprehensive error handling
 * - Request/response interceptors
 * - Data formatting and unit conversion
 * 
 * @class WeatherApiService
 * @example
 * ```js
 * import { weatherApi } from '@/services/weatherApi'
 * 
 * // Get weather forecast
 * const forecast = await weatherApi.getWeatherByCoordinates(51.5074, -0.1278)
 * 
 * // Get current weather
 * const current = await weatherApi.getCurrentWeatherByCoordinates(51.5074, -0.1278)
 * 
 * // Get weather alerts
 * const alerts = await weatherApi.getWeatherAlerts(51.5074, -0.1278)
 * ```
 */
class WeatherApiService {
  constructor() {
    this.baseURL = API_config.API
    this.apiKey = API_config.KEY
    this.defaultParams = {
      appid: this.apiKey,
      units: 'metric'
    }
    
    // Create axios instance with default config
    this.client = axios.create({
      timeout: 10000, // 10 seconds
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    this.setupInterceptors()
  }

  /**
   * Setup request and response interceptors for logging and error handling
   * 
   * Configures:
   * - Request logging
   * - Response logging
   * - Automatic error handling and formatting
   * 
   * @private
   */
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Making API request to: ${config.url}`)
        return config
      },
      (error) => {
        console.error('Request error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API response received from: ${response.config.url}`)
        return response
      },
      (error) => {
        const errorMessage = this.handleApiError(error)
        console.error('API Error:', errorMessage)
        return Promise.reject(new Error(errorMessage))
      }
    )
  }

  /**
   * Handle API errors and return user-friendly messages
   * 
   * Converts various error types into human-readable messages:
   * - HTTP status codes (401, 404, 429, 500)
   * - Network errors
   * - Generic errors
   * 
   * @param {Error} error - The error object from axios
   * @returns {string} User-friendly error message
   * @private
   */
  handleApiError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          return 'Invalid API key. Please check your configuration.'
        case 404:
          return 'Weather data not found for this location.'
        case 429:
          return 'Too many requests. Please try again later.'
        case 500:
          return 'Weather service is temporarily unavailable.'
        default:
          return data?.message || `Server error: ${status}`
      }
    } else if (error.request) {
      // Network error
      return 'Network error. Please check your internet connection.'
    } else {
      // Other error
      return error.message || 'An unexpected error occurred.'
    }
  }

  /**
   * Get weather forecast by coordinates
   * 
   * Fetches 5-day weather forecast with 3-hour intervals.
   * Data includes temperature, humidity, pressure, wind, and weather conditions.
   * 
   * @param {number} lat - Latitude (-90 to 90)
   * @param {number} lon - Longitude (-180 to 180)
   * @param {Object} [options={}] - Additional query parameters
   * @param {string} [options.units='metric'] - Temperature units (metric, imperial, kelvin)
   * @param {string} [options.lang] - Language for weather descriptions
   * @returns {Promise<Object>} Formatted weather forecast data
   * @returns {Object} returns.city - City information
   * @returns {string} returns.country - Country code
   * @returns {Array} returns.list - Array of forecast items
   * @returns {number} returns.cnt - Number of forecast items
   * 
   * @throws {Error} When API request fails or data format is invalid
   * 
   * @example
   * ```js
   * // Get forecast for London
   * const forecast = await weatherApi.getWeatherByCoordinates(51.5074, -0.1278)
   * console.log(forecast.list[0].main.temp) // Current temperature
   * 
   * // Get forecast with options
   * const forecast = await weatherApi.getWeatherByCoordinates(
   *   51.5074, -0.1278, 
   *   { units: 'imperial', lang: 'es' }
   * )
   * ```
   */
  async getWeatherByCoordinates(lat, lon, options = {}) {
    try {
      const params = {
        ...this.defaultParams,
        lat,
        lon,
        ...options
      }

      const response = await this.client.get(this.baseURL, { params })
      
      if (!response.data || !response.data.list) {
        throw new Error('Invalid weather data format received')
      }

      return this.formatWeatherData(response.data)
    } catch (error) {
      throw error
    }
  }

  /**
   * Get current weather by coordinates
   * 
   * Fetches current weather conditions including temperature, humidity,
   * pressure, wind speed/direction, visibility, and weather description.
   * 
   * @param {number} lat - Latitude (-90 to 90)
   * @param {number} lon - Longitude (-180 to 180)
   * @returns {Promise<Object>} Formatted current weather data
   * @returns {Object} returns.main - Temperature and atmospheric data
   * @returns {Array} returns.weather - Weather conditions array
   * @returns {Object} returns.wind - Wind information
   * @returns {number} returns.visibility - Visibility in kilometers
   * @returns {Object} returns.sys - System data (sunrise, sunset, country)
   * 
   * @throws {Error} When API request fails
   * 
   * @example
   * ```js
   * // Get current weather for New York
   * const current = await weatherApi.getCurrentWeatherByCoordinates(40.7128, -74.0060)
   * console.log(current.main.temp) // Current temperature in Celsius
   * console.log(current.weather[0].description) // Weather description
   * ```
   */
  async getCurrentWeatherByCoordinates(lat, lon) {
    try {
      const currentWeatherURL = 'https://api.openweathermap.org/data/2.5/weather'
      const params = {
        ...this.defaultParams,
        lat,
        lon
      }

      const response = await this.client.get(currentWeatherURL, { params })
      return this.formatCurrentWeatherData(response.data)
    } catch (error) {
      throw error
    }
  }

  /**
   * Format weather forecast data from API response
   * 
   * Processes raw API data to:
   * - Round temperature values
   * - Convert wind speed from m/s to km/h
   * - Convert visibility from meters to kilometers
   * - Maintain original structure with enhanced data
   * 
   * @param {Object} data - Raw weather forecast data from OpenWeatherMap API
   * @returns {Object} Formatted and processed weather data
   * @private
   */
  formatWeatherData(data) {
    return {
      city: data.city,
      country: data.city?.country,
      list: data.list.map(item => ({
        ...item,
        dt_txt: item.dt_txt,
        main: {
          ...item.main,
          temp: Math.round(item.main.temp),
          feels_like: Math.round(item.main.feels_like),
          temp_min: Math.round(item.main.temp_min),
          temp_max: Math.round(item.main.temp_max)
        },
        wind: {
          ...item.wind,
          speed: Math.round(item.wind.speed * 3.6) // Convert m/s to km/h
        },
        visibility: item.visibility ? Math.round(item.visibility / 1000) : null // Convert to km
      })),
      cnt: data.cnt
    }
  }

  /**
   * Format current weather data from API response
   * 
   * Processes raw API data to:
   * - Round temperature values
   * - Convert wind speed from m/s to km/h
   * - Convert visibility from meters to kilometers
   * - Maintain original structure with enhanced data
   * 
   * @param {Object} data - Raw current weather data from OpenWeatherMap API
   * @returns {Object} Formatted and processed weather data
   * @private
   */
  formatCurrentWeatherData(data) {
    return {
      ...data,
      main: {
        ...data.main,
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        temp_min: Math.round(data.main.temp_min),
        temp_max: Math.round(data.main.temp_max)
      },
      wind: {
        ...data.wind,
        speed: Math.round(data.wind.speed * 3.6) // Convert m/s to km/h
      },
      visibility: data.visibility ? Math.round(data.visibility / 1000) : null // Convert to km
    }
  }

  /**
   * Get weather alerts for coordinates
   * 
   * Fetches active weather alerts and warnings for the specified location.
   * This includes severe weather warnings, watches, and advisories.
   * 
   * Note: This endpoint requires OpenWeatherMap One Call API 3.0 subscription.
   * If not available, returns empty array without throwing error.
   * 
   * @param {number} lat - Latitude (-90 to 90)
   * @param {number} lon - Longitude (-180 to 180)
   * @returns {Promise<Array>} Array of weather alert objects
   * @returns {Array} returns - Empty array if no alerts or API unavailable
   * 
   * @example
   * ```js
   * // Get weather alerts for Miami during hurricane season
   * const alerts = await weatherApi.getWeatherAlerts(25.7617, -80.1918)
   * if (alerts.length > 0) {
   *   console.log('Active alerts:', alerts[0].event)
   * }
   * ```
   */
  async getWeatherAlerts(lat, lon) {
    try {
      const oneCallURL = 'https://api.openweathermap.org/data/3.0/onecall'
      const params = {
        lat,
        lon,
        appid: this.apiKey,
        exclude: 'minutely,hourly,daily'
      }

      const response = await this.client.get(oneCallURL, { params })
      return response.data.alerts || []
    } catch (error) {
      // Alerts are optional, don't throw error if not available
      console.warn('Weather alerts not available:', error.message)
      return []
    }
  }
}

// Export singleton instance
export const weatherApi = new WeatherApiService()
export default weatherApi