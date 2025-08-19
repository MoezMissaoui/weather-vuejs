import { defineStore } from 'pinia'
import axios from 'axios'
import { API_config } from '@/config.js'

/**
 * Weather Store - Manages weather data, geocoding, and related state
 * 
 * This store handles:
 * - Fetching weather data from OpenWeatherMap API
 * - Geocoding location names to coordinates
 * - Caching weather data to reduce API calls
 * - Managing loading states and error handling
 * 
 * @example
 * ```js
 * import { useWeatherStore } from '@/stores/weather'
 * 
 * const weatherStore = useWeatherStore()
 * await weatherStore.fetchWeatherData('London')
 * console.log(weatherStore.currentTemperature)
 * ```
 */
export const useWeatherStore = defineStore('weather', {
  state: () => ({
    /** @type {Array} Array of weather forecast data from API */
    weatherData: [],
    /** @type {Array|null} Geocoding data containing location coordinates and details */
    geocodingData: null,
    /** @type {boolean} Loading state for API requests */
    loading: false,
    /** @type {string|null} Error message from failed API requests */
    error: null,
    /** @type {number|null} Timestamp of last successful data fetch */
    lastFetchTime: null,
    /** @type {number} Cache timeout duration in milliseconds (10 minutes) */
    cacheTimeout: 10 * 60 * 1000,
    /** @type {string|null} Currently selected region/location */
    currentRegion: null
  }),

  getters: {
    /**
     * Check if weather data is available
     * @param {Object} state - Store state
     * @returns {boolean} True if weather data exists
     */
    hasWeatherData: (state) => state.weatherData.length > 0,
    
    /**
     * Check if cached data is stale and needs refresh
     * @param {Object} state - Store state
     * @returns {boolean} True if data is stale or doesn't exist
     */
    isDataStale: (state) => {
      if (!state.lastFetchTime) return true
      return Date.now() - state.lastFetchTime > state.cacheTimeout
    },

    /**
     * Get formatted location title from geocoding data
     * @param {Object} state - Store state
     * @returns {string} Formatted location string (e.g., "London, GB")
     */
    locationTitle: (state) => {
      if (!state.geocodingData || state.geocodingData.length === 0) return 'Unknown Location'
      const location = state.geocodingData[0]
      return `${location.name}, ${location.country}`
    },

    /**
     * Get current weather data (first item in forecast)
     * @param {Object} state - Store state
     * @returns {Object|null} Current weather object or null
     */
    currentWeather: (state) => {
      if (!state.weatherData.length) return null
      return state.weatherData[0]
    },

    /**
     * Get current temperature rounded to nearest integer
     * @param {Object} state - Store state
     * @returns {number|null} Temperature in Celsius or null
     */
    currentTemperature: (state) => {
      const current = state.weatherData[0]
      return current ? Math.round(current.main.temp) : null
    },

    /**
     * Get current weather description
     * @param {Object} state - Store state
     * @returns {string|null} Weather description or null
     */
    currentDescription: (state) => {
      const current = state.weatherData[0]
      return current ? current.weather[0].description : null
    }
  },

  actions: {
    /**
     * Fetch weather data for a specific region
     * 
     * This method handles:
     * - Checking for cached data to avoid unnecessary API calls
     * - Geocoding the region name to coordinates
     * - Fetching weather forecast data
     * - Error handling and state management
     * 
     * @param {string} region - The region/city name to fetch weather for
     * @returns {Promise<void>} Promise that resolves when data is fetched
     * 
     * @example
     * ```js
     * await weatherStore.fetchWeatherData('London')
     * ```
     */
    async fetchWeatherData(region) {
      // Check if we have cached data for the same region
      if (this.currentRegion === region && !this.isDataStale && this.hasWeatherData) {
        return
      }

      this.loading = true
      this.error = null
      this.currentRegion = region

      try {
        // Fetch geocoding data
        const geocodingResponse = await axios.get(API_config.API_GEOCODING, {
          params: {
            q: region,
            limit: 1,
            appid: API_config.KEY
          }
        })

        if (!geocodingResponse.data || geocodingResponse.data.length === 0) {
          throw new Error('Location not found')
        }

        this.geocodingData = geocodingResponse.data
        const { lat, lon } = geocodingResponse.data[0]

        // Fetch weather data
        const weatherResponse = await axios.get(API_config.API, {
          params: {
            lat,
            lon,
            appid: API_config.KEY,
            units: 'metric'
          }
        })

        if (!weatherResponse.data || !weatherResponse.data.list) {
          throw new Error('Weather data not available')
        }

        this.weatherData = weatherResponse.data.list
        this.lastFetchTime = Date.now()
        this.error = null
      } catch (error) {
        console.error('Error fetching weather data:', error)
        this.error = error.response?.data?.message || error.message || 'Failed to fetch weather data'
        this.weatherData = []
        this.geocodingData = null
      } finally {
        this.loading = false
      }
    },

    /**
     * Retry fetching weather data for the current region
     * 
     * Clears the cache and forces a fresh API call for the currently
     * selected region. Useful for handling failed requests or refreshing data.
     * 
     * @returns {Promise<void>} Promise that resolves when retry is complete
     * 
     * @example
     * ```js
     * await weatherStore.retryFetch()
     * ```
     */
    async retryFetch() {
      if (this.currentRegion) {
        // Clear cache to force fresh fetch
        this.lastFetchTime = null
        await this.fetchWeatherData(this.currentRegion)
      }
    },

    /**
     * Clear all weather data and reset store state
     * 
     * Resets the store to its initial state by clearing:
     * - Weather forecast data
     * - Geocoding data
     * - Error messages
     * - Cache timestamps
     * - Current region
     * 
     * @example
     * ```js
     * weatherStore.clearWeatherData()
     * ```
     */
    clearWeatherData() {
      this.weatherData = []
      this.geocodingData = null
      this.error = null
      this.lastFetchTime = null
      this.currentRegion = null
    },

    /**
     * Clear the current error message
     * 
     * Useful for dismissing error notifications or resetting
     * error state before attempting new operations.
     * 
     * @example
     * ```js
     * weatherStore.clearError()
     * ```
     */
    clearError() {
      this.error = null
    }
  }
})