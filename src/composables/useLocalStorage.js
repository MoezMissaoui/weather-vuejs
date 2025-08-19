import { ref, watch, Ref } from 'vue'

/**
 * Composable for localStorage management with reactive updates
 * 
 * Provides a reactive interface to localStorage with automatic serialization,
 * cross-tab synchronization, and error handling. Changes to the returned
 * reactive reference automatically persist to localStorage.
 * 
 * @param {string} key - The localStorage key to use for storage
 * @param {any} defaultValue - Default value if key doesn't exist in localStorage
 * @param {Object} [options={}] - Configuration options
 * @param {Object} [options.serializer] - Custom serializer for data conversion
 * @param {Function} [options.serializer.read=JSON.parse] - Function to deserialize stored data
 * @param {Function} [options.serializer.write=JSON.stringify] - Function to serialize data for storage
 * @param {boolean} [options.syncAcrossTabs=true] - Whether to sync changes across browser tabs
 * @param {Function} [options.onError] - Error handler function
 * 
 * @returns {Object} localStorage composable interface
 * @returns {Ref} returns.value - Reactive reference to the stored value
 * @returns {Function} returns.remove - Function to remove the value (sets to null)
 * @returns {Function} returns.clear - Function to reset to default value
 * 
 * @example
 * ```js
 * import { useLocalStorage } from '@/composables/useLocalStorage'
 * 
 * // Basic usage
 * const { value: username } = useLocalStorage('username', '')
 * username.value = 'john_doe' // Automatically saved to localStorage
 * 
 * // With custom serializer
 * const { value: settings } = useLocalStorage('settings', {}, {
 *   serializer: {
 *     read: (v) => JSON.parse(v),
 *     write: (v) => JSON.stringify(v)
 *   }
 * })
 * 
 * // With error handling
 * const { value: data } = useLocalStorage('data', null, {
 *   onError: (error) => console.warn('Storage error:', error)
 * })
 * ```
 */
export function useLocalStorage(key, defaultValue, options = {}) {
  const {
    serializer = {
      read: JSON.parse,
      write: JSON.stringify
    },
    syncAcrossTabs = true,
    onError = (error) => console.error('localStorage error:', error)
  } = options

  // Read initial value from localStorage
  const read = () => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return defaultValue
      }
      return serializer.read(item)
    } catch (error) {
      onError(error)
      return defaultValue
    }
  }

  // Write value to localStorage
  const write = (value) => {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, serializer.write(value))
      }
    } catch (error) {
      onError(error)
    }
  }

  // Create reactive reference
  const storedValue = ref(read())

  // Watch for changes and update localStorage
  watch(
    storedValue,
    (newValue) => {
      write(newValue)
    },
    { deep: true }
  )

  // Listen for storage events (changes from other tabs)
  if (syncAcrossTabs) {
    window.addEventListener('storage', (e) => {
      if (e.key === key && e.newValue !== serializer.write(storedValue.value)) {
        try {
          storedValue.value = e.newValue ? serializer.read(e.newValue) : defaultValue
        } catch (error) {
          onError(error)
        }
      }
    })
  }

  // Utility functions
  const remove = () => {
    storedValue.value = null
  }

  const clear = () => {
    storedValue.value = defaultValue
  }

  return {
    value: storedValue,
    remove,
    clear
  }
}

/**
 * Specialized composable for storing user preferences
 * 
 * Provides a structured interface for managing user preferences
 * with nested object support and utility functions for getting
 * and setting individual preference values.
 * 
 * @returns {Object} User preferences composable interface
 * @returns {Object} returns.preferences - Reactive preferences object
 * @returns {Function} returns.updatePreference - Update a specific preference by key path
 * @returns {Function} returns.getPreference - Get a preference value by key path
 * @returns {Function} returns.resetPreferences - Reset all preferences to defaults
 * 
 * @example
 * ```js
 * import { useUserPreferences } from '@/composables/useLocalStorage'
 * 
 * const {
 *   preferences,
 *   updatePreference,
 *   getPreference,
 *   resetPreferences
 * } = useUserPreferences()
 * 
 * // Update nested preference
 * updatePreference('notifications.enabled', true)
 * updatePreference('location.useGeolocation', false)
 * 
 * // Get preference value
 * const theme = getPreference('theme', 'system')
 * const refreshInterval = getPreference('refreshInterval')
 * 
 * // Reset all preferences
 * resetPreferences()
 * ```
 */
export function useUserPreferences() {
  const preferences = useLocalStorage('userPreferences', {
    theme: 'system',
    language: 'en',
    temperatureUnit: 'celsius',
    windSpeedUnit: 'kmh',
    timeFormat: '24h',
    autoRefresh: true,
    refreshInterval: 10, // minutes
    notifications: {
      enabled: false,
      weatherAlerts: false,
      dailyForecast: false
    },
    location: {
      useGeolocation: false,
      defaultRegion: null
    }
  })

  const updatePreference = (key, value) => {
    const keys = key.split('.')
    let current = preferences.value
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
  }

  const getPreference = (key, defaultVal = null) => {
    const keys = key.split('.')
    let current = preferences.value
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        return defaultVal
      }
    }
    
    return current
  }

  const resetPreferences = () => {
    preferences.clear()
  }

  return {
    preferences: preferences.value,
    updatePreference,
    getPreference,
    resetPreferences
  }
}

/**
 * Composable for managing search history
 * 
 * Provides functionality to store, retrieve, and manage user search history
 * with automatic deduplication and size limiting.
 * 
 * @param {number} [maxItems=10] - Maximum number of search items to store
 * 
 * @returns {Object} Search history composable interface
 * @returns {Array<string>} returns.searchHistory - Reactive array of search history
 * @returns {Function} returns.addSearch - Add a new search query to history
 * @returns {Function} returns.removeSearch - Remove a specific search from history
 * @returns {Function} returns.clearHistory - Clear all search history
 * @returns {Function} returns.getRecentSearches - Get recent searches with limit
 * 
 * @example
 * ```js
 * import { useSearchHistory } from '@/composables/useLocalStorage'
 * 
 * const {
 *   searchHistory,
 *   addSearch,
 *   removeSearch,
 *   clearHistory,
 *   getRecentSearches
 * } = useSearchHistory(5) // Limit to 5 items
 * 
 * // Add search queries
 * addSearch('London')
 * addSearch('New York')
 * addSearch('Tokyo')
 * 
 * // Get recent searches
 * const recent = getRecentSearches(3) // Get last 3 searches
 * 
 * // Remove specific search
 * removeSearch('London')
 * 
 * // Clear all history
 * clearHistory()
 * ```
 */
export function useSearchHistory(maxItems = 10) {
  const searchHistory = useLocalStorage('searchHistory', [])

  const addSearch = (query) => {
    if (!query || typeof query !== 'string') return
    
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return

    // Remove existing entry if it exists
    const filtered = searchHistory.value.filter(item => 
      item.toLowerCase() !== trimmedQuery.toLowerCase()
    )
    
    // Add to beginning and limit size
    searchHistory.value = [trimmedQuery, ...filtered].slice(0, maxItems)
  }

  const removeSearch = (query) => {
    searchHistory.value = searchHistory.value.filter(item => 
      item.toLowerCase() !== query.toLowerCase()
    )
  }

  const clearHistory = () => {
    searchHistory.value = []
  }

  const getRecentSearches = (limit = 5) => {
    return searchHistory.value.slice(0, limit)
  }

  return {
    searchHistory: searchHistory.value,
    addSearch,
    removeSearch,
    clearHistory,
    getRecentSearches
  }
}