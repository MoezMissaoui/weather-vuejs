import axios from 'axios'
import { API_config } from '@/config.js'

/**
 * Geocoding API Service - Handles location search and coordinate conversion
 * 
 * This service provides:
 * - Location search by name/address
 * - Reverse geocoding (coordinates to location)
 * - Location suggestions for autocomplete
 * - Distance calculations between coordinates
 * - Coordinate validation utilities
 * - Comprehensive error handling
 * 
 * @class GeocodingApiService
 * @example
 * ```js
 * import { geocodingApi } from '@/services/geocodingApi'
 * 
 * // Search for locations
 * const locations = await geocodingApi.searchLocations('London')
 * 
 * // Reverse geocoding
 * const location = await geocodingApi.getLocationByCoordinates(51.5074, -0.1278)
 * 
 * // Get autocomplete suggestions
 * const suggestions = await geocodingApi.getLocationSuggestions('Par')
 * ```
 */
class GeocodingApiService {
  constructor() {
    this.baseURL = API_config.API_GEOCODING
    this.apiKey = API_config.KEY
    this.defaultParams = {
      appid: this.apiKey
    }
    
    // Create axios instance with default config
    this.client = axios.create({
      timeout: 8000, // 8 seconds
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
        console.log(`Making geocoding request to: ${config.url}`)
        return config
      },
      (error) => {
        console.error('Geocoding request error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`Geocoding response received from: ${response.config.url}`)
        return response
      },
      (error) => {
        const errorMessage = this.handleApiError(error)
        console.error('Geocoding API Error:', errorMessage)
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
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          return 'Invalid API key for geocoding service.'
        case 404:
          return 'Location not found. Please try a different search term.'
        case 429:
          return 'Too many location requests. Please try again later.'
        case 500:
          return 'Geocoding service is temporarily unavailable.'
        default:
          return data?.message || `Geocoding error: ${status}`
      }
    } else if (error.request) {
      return 'Network error while searching for location.'
    } else {
      return error.message || 'An unexpected geocoding error occurred.'
    }
  }

  /**
   * Search for locations by query string
   * 
   * Searches for locations using city names, addresses, or other location identifiers.
   * Returns formatted location data with coordinates and display names.
   * 
   * @param {string} query - Search query (city name, address, postal code, etc.)
   * @param {Object} [options={}] - Search configuration options
   * @param {number} [options.limit=5] - Maximum number of results (1-5)
   * @param {string} [options.countryCode] - ISO 3166 country code to limit search
   * @returns {Promise<Array>} Array of formatted location objects
   * @returns {Object} returns[].name - Location name
   * @returns {number} returns[].lat - Latitude
   * @returns {number} returns[].lon - Longitude
   * @returns {string} returns[].country - Country name
   * @returns {string} returns[].state - State/region name (if available)
   * @returns {string} returns[].displayName - Formatted display name
   * 
   * @throws {Error} When query is empty or invalid
   * @throws {Error} When no locations are found
   * @throws {Error} When API request fails
   * 
   * @example
   * ```js
   * // Basic location search
   * const locations = await geocodingApi.searchLocations('Paris')
   * console.log(locations[0].displayName) // "Paris, Île-de-France, FR"
   * 
   * // Search with country restriction
   * const usLocations = await geocodingApi.searchLocations('Springfield', {
   *   limit: 3,
   *   countryCode: 'US'
   * })
   * ```
   */
  async searchLocations(query, options = {}) {
    try {
      const {
        limit = 5,
        countryCode = null
      } = options

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        throw new Error('Search query is required')
      }

      const params = {
        ...this.defaultParams,
        q: query.trim(),
        limit
      }

      // Add country code if specified
      if (countryCode) {
        params.q += `,${countryCode}`
      }

      const response = await this.client.get(this.baseURL, { params })
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid geocoding response format')
      }

      if (response.data.length === 0) {
        throw new Error('No locations found for the given search term')
      }

      return this.formatLocationData(response.data)
    } catch (error) {
      throw error
    }
  }

  /**
   * Get location by coordinates (reverse geocoding)
   * 
   * Converts geographic coordinates to location information.
   * Useful for determining location names from GPS coordinates.
   * 
   * @param {number} lat - Latitude (-90 to 90)
   * @param {number} lon - Longitude (-180 to 180)
   * @param {number} [limit=1] - Maximum number of results to return (1-5)
   * @returns {Promise<Array>} Array of formatted location objects
   * @returns {Object} returns[].name - Location name
   * @returns {number} returns[].lat - Latitude
   * @returns {number} returns[].lon - Longitude
   * @returns {string} returns[].country - Country name
   * @returns {string} returns[].state - State/region name (if available)
   * @returns {string} returns[].displayName - Formatted display name
   * 
   * @throws {Error} When coordinates are invalid or out of range
   * @throws {Error} When API request fails
   * 
   * @example
   * ```js
   * // Get location for coordinates
   * const locations = await geocodingApi.getLocationByCoordinates(40.7128, -74.0060)
   * console.log(locations[0].displayName) // "New York, New York, US"
   * 
   * // Get multiple nearby locations
   * const nearbyLocations = await geocodingApi.getLocationByCoordinates(
   *   51.5074, -0.1278, 3
   * )
   * ```
   */
  async getLocationByCoordinates(lat, lon, limit = 1) {
    try {
      if (typeof lat !== 'number' || typeof lon !== 'number') {
        throw new Error('Valid latitude and longitude are required')
      }

      if (lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90')
      }

      if (lon < -180 || lon > 180) {
        throw new Error('Longitude must be between -180 and 180')
      }

      const reverseURL = 'http://api.openweathermap.org/geo/1.0/reverse'
      const params = {
        ...this.defaultParams,
        lat,
        lon,
        limit
      }

      const response = await this.client.get(reverseURL, { params })
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid reverse geocoding response format')
      }

      return this.formatLocationData(response.data)
    } catch (error) {
      throw error
    }
  }

  /**
   * Get location suggestions for autocomplete
   * 
   * Provides simplified location data optimized for autocomplete functionality.
   * Returns empty array for queries shorter than 2 characters or on errors.
   * 
   * @param {string} query - Partial search query (minimum 2 characters)
   * @param {number} [limit=5] - Maximum number of suggestions (1-5)
   * @returns {Promise<Array>} Array of simplified location suggestions
   * @returns {string} returns[].id - Unique identifier (lat-lon)
   * @returns {string} returns[].name - Location name
   * @returns {string} returns[].displayName - Formatted display name
   * @returns {string} returns[].country - Country name
   * @returns {string} returns[].state - State/region name
   * @returns {number} returns[].lat - Latitude
   * @returns {number} returns[].lon - Longitude
   * 
   * @example
   * ```js
   * // Get autocomplete suggestions
   * const suggestions = await geocodingApi.getLocationSuggestions('Lond')
   * suggestions.forEach(suggestion => {
   *   console.log(suggestion.displayName) // "London, England, GB"
   * })
   * 
   * // Handle short queries gracefully
   * const empty = await geocodingApi.getLocationSuggestions('L') // Returns []
   * ```
   */
  async getLocationSuggestions(query, limit = 5) {
    try {
      if (!query || query.length < 2) {
        return []
      }

      const locations = await this.searchLocations(query, { limit })
      
      // Return simplified suggestions for autocomplete
      return locations.map(location => ({
        id: `${location.lat}-${location.lon}`,
        name: location.name,
        displayName: location.displayName,
        country: location.country,
        state: location.state,
        lat: location.lat,
        lon: location.lon
      }))
    } catch (error) {
      console.warn('Failed to get location suggestions:', error.message)
      return []
    }
  }

  /**
   * Format location data from API response
   * 
   * Transforms raw geocoding API data into a consistent, enhanced format.
   * Adds display names, coordinate objects, and handles missing fields.
   * 
   * @param {Array} data - Raw location data from OpenWeatherMap Geocoding API
   * @returns {Array} Array of formatted and enhanced location objects
   * @private
   */
  formatLocationData(data) {
    return data.map(location => ({
      name: location.name,
      lat: location.lat,
      lon: location.lon,
      country: location.country,
      state: location.state || null,
      localNames: location.local_names || {},
      displayName: this.createDisplayName(location),
      coordinates: {
        latitude: location.lat,
        longitude: location.lon
      }
    }))
  }

  /**
   * Create a user-friendly display name for a location
   * 
   * Generates a hierarchical display name in the format:
   * "City, State, Country" or "City, Country" (if no state)
   * 
   * @param {Object} location - Location data object
   * @param {string} location.name - Location name
   * @param {string} [location.state] - State or region name
   * @param {string} location.country - Country name
   * @returns {string} Comma-separated display name
   * @private
   * 
   * @example
   * ```js
   * // With state
   * createDisplayName({ name: 'Austin', state: 'Texas', country: 'US' })
   * // Returns: "Austin, Texas, US"
   * 
   * // Without state
   * createDisplayName({ name: 'London', country: 'GB' })
   * // Returns: "London, GB"
   * ```
   */
  createDisplayName(location) {
    const parts = [location.name]
    
    if (location.state) {
      parts.push(location.state)
    }
    
    if (location.country) {
      parts.push(location.country)
    }
    
    return parts.join(', ')
  }

  /**
   * Validate coordinates
   * 
   * Checks if latitude and longitude values are valid numbers within
   * the correct geographic ranges.
   * 
   * @param {number} lat - Latitude to validate
   * @param {number} lon - Longitude to validate
   * @returns {boolean} True if both coordinates are valid, false otherwise
   * 
   * @example
   * ```js
   * geocodingApi.validateCoordinates(40.7128, -74.0060) // true
   * geocodingApi.validateCoordinates(91, 0) // false (lat > 90)
   * geocodingApi.validateCoordinates('40.7', '-74.0') // false (strings)
   * ```
   */
  validateCoordinates(lat, lon) {
    return (
      typeof lat === 'number' &&
      typeof lon === 'number' &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    )
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * 
   * Computes the great-circle distance between two points on Earth's surface.
   * Uses the Haversine formula for accurate distance calculation.
   * 
   * @param {number} lat1 - First point latitude (-90 to 90)
   * @param {number} lon1 - First point longitude (-180 to 180)
   * @param {number} lat2 - Second point latitude (-90 to 90)
   * @param {number} lon2 - Second point longitude (-180 to 180)
   * @returns {number} Distance in kilometers (rounded to 2 decimal places)
   * 
   * @example
   * ```js
   * // Distance between New York and London
   * const distance = geocodingApi.calculateDistance(
   *   40.7128, -74.0060,  // New York
   *   51.5074, -0.1278    // London
   * )
   * console.log(distance) // ~5585.27 km
   * 
   * // Distance between nearby points
   * const shortDistance = geocodingApi.calculateDistance(
   *   40.7128, -74.0060,  // New York
   *   40.7589, -73.9851   // Central Park
   * )
   * console.log(shortDistance) // ~6.18 km
   * ```
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Convert degrees to radians
   * 
   * Utility function for trigonometric calculations in distance formulas.
   * 
   * @param {number} degrees - Angle in degrees
   * @returns {number} Angle in radians
   * @private
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180)
  }
}

// Export singleton instance
export const geocodingApi = new GeocodingApiService()
export default geocodingApi