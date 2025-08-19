/**
 * Caching Service for Weather Data and API Responses
 * 
 * This module provides a comprehensive caching solution with:
 * - In-memory caching for fast access
 * - Persistent localStorage caching for data retention
 * - Automatic cache expiration and cleanup
 * - LRU (Least Recently Used) eviction policy
 * - Cache statistics and monitoring
 * - Configurable cache sizes and TTL values
 * 
 * @module CacheService
 * @example
 * ```js
 * import { cacheService } from '@/services/cacheService'
 * 
 * // Cache weather data
 * cacheService.set('weather_london', weatherData, {
 *   ttl: 10 * 60 * 1000, // 10 minutes
 *   persistent: true
 * })
 * 
 * // Retrieve cached data
 * const cachedWeather = cacheService.get('weather_london')
 * 
 * // Generate cache keys
 * const key = cacheService.generateWeatherKey(51.5074, -0.1278, 'forecast')
 * ```
 */

import { logger } from './errorHandler.js'

/**
 * Cache configuration constants
 * 
 * Defines cache durations, size limits, and storage keys used throughout
 * the caching system. All durations are in milliseconds.
 * 
 * @constant {Object} CACHE_CONFIG
 * @property {Object} CACHE_CONFIG - Cache duration settings
 * @property {number} CACHE_CONFIG.WEATHER_DATA - Current weather cache duration (10 minutes)
 * @property {number} CACHE_CONFIG.FORECAST_DATA - Forecast data cache duration (30 minutes)
 * @property {number} CACHE_CONFIG.GEOCODING_DATA - Location data cache duration (24 hours)
 * @property {number} CACHE_CONFIG.LOCATION_SEARCH - Search results cache duration (1 hour)
 * @property {number} CACHE_CONFIG.USER_PREFERENCES - User settings cache duration (7 days)
 * @property {number} CACHE_CONFIG.MAX_ENTRIES - Maximum number of cache entries (100)
 * @property {number} CACHE_CONFIG.MAX_MEMORY_SIZE - Maximum memory usage (10MB)
 * @property {string} CACHE_CONFIG.STORAGE_PREFIX - localStorage key prefix
 * @property {string} CACHE_CONFIG.METADATA_KEY - Metadata storage key
 */
const CACHE_CONFIG = {
  // Cache durations in milliseconds
  WEATHER_DATA: 10 * 60 * 1000, // 10 minutes
  FORECAST_DATA: 30 * 60 * 1000, // 30 minutes
  GEOCODING_DATA: 24 * 60 * 60 * 1000, // 24 hours
  LOCATION_SEARCH: 60 * 60 * 1000, // 1 hour
  USER_PREFERENCES: 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // Cache size limits
  MAX_ENTRIES: 100,
  MAX_MEMORY_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Storage keys
  STORAGE_PREFIX: 'weather_cache_',
  METADATA_KEY: 'weather_cache_metadata'
}

/**
 * Cache entry structure
 * @typedef {Object} CacheEntry
 * @property {any} data - Cached data
 * @property {number} timestamp - When the data was cached
 * @property {number} ttl - Time to live in milliseconds
 * @property {number} size - Approximate size in bytes
 * @property {number} hits - Number of times accessed
 * @property {string} key - Cache key
 */

/**
 * In-memory cache implementation with LRU eviction
 * 
 * Provides fast access to cached data with automatic memory management.
 * Uses LRU (Least Recently Used) eviction when cache limits are exceeded.
 * 
 * Features:
 * - Fast Map-based storage
 * - Automatic expiration based on TTL
 * - LRU eviction policy
 * - Memory usage tracking
 * - Hit/miss statistics
 * - Size estimation for entries
 * 
 * @class MemoryCache
 * @example
 * ```js
 * const cache = new MemoryCache()
 * 
 * // Set cache entry
 * cache.set('user_123', userData, 5 * 60 * 1000) // 5 minutes TTL
 * 
 * // Get cache entry
 * const user = cache.get('user_123')
 * 
 * // Check cache statistics
 * const stats = cache.getStats()
 * console.log(`Hit rate: ${stats.hitRate}`)
 * ```
 */
class MemoryCache {
  constructor() {
    this.cache = new Map()
    this.metadata = {
      totalSize: 0,
      totalEntries: 0,
      hits: 0,
      misses: 0,
      evictions: 0
    }
  }

  /**
   * Set cache entry with automatic eviction management
   * 
   * Stores data in memory cache with specified TTL. Automatically evicts
   * old entries if memory or count limits are exceeded.
   * 
   * @param {string} key - Unique cache key identifier
   * @param {any} data - Data to cache (will be JSON serialized for size estimation)
   * @param {number} [ttl=CACHE_CONFIG.WEATHER_DATA] - Time to live in milliseconds
   * 
   * @example
   * ```js
   * // Cache with default TTL
   * cache.set('weather_data', { temp: 25, humidity: 60 })
   * 
   * // Cache with custom TTL (1 hour)
   * cache.set('user_prefs', preferences, 60 * 60 * 1000)
   * ```
   */
  set(key, data, ttl = CACHE_CONFIG.WEATHER_DATA) {
    try {
      const size = this.estimateSize(data)
      const entry = {
        data,
        timestamp: Date.now(),
        ttl,
        size,
        hits: 0,
        key
      }

      // Check if we need to evict entries
      this.evictIfNeeded(size)

      // Remove existing entry if it exists
      if (this.cache.has(key)) {
        const oldEntry = this.cache.get(key)
        this.metadata.totalSize -= oldEntry.size
        this.metadata.totalEntries--
      }

      this.cache.set(key, entry)
      this.metadata.totalSize += size
      this.metadata.totalEntries++

      logger.debug(`Cache set: ${key}`, { size, ttl })
    } catch (error) {
      logger.error('Failed to set cache entry', error)
    }
  }

  /**
   * Get cache entry with automatic expiration check
   * 
   * Retrieves cached data if it exists and hasn't expired. Updates hit
   * statistics and automatically removes expired entries.
   * 
   * @param {string} key - Cache key to retrieve
   * @returns {any|null} Cached data or null if not found/expired
   * 
   * @example
   * ```js
   * const weatherData = cache.get('weather_london')
   * if (weatherData) {
   *   console.log('Cache hit:', weatherData.temperature)
   * } else {
   *   console.log('Cache miss - need to fetch fresh data')
   * }
   * ```
   */
  get(key) {
    try {
      const entry = this.cache.get(key)
      
      if (!entry) {
        this.metadata.misses++
        logger.debug(`Cache miss: ${key}`)
        return null
      }

      // Check if entry has expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.delete(key)
        this.metadata.misses++
        logger.debug(`Cache expired: ${key}`)
        return null
      }

      // Update hit count and metadata
      entry.hits++
      this.metadata.hits++
      
      logger.debug(`Cache hit: ${key}`, { hits: entry.hits })
      return entry.data
    } catch (error) {
      logger.error('Failed to get cache entry', error)
      return null
    }
  }

  /**
   * Delete cache entry and update metadata
   * 
   * Removes the specified entry from cache and updates size/count metadata.
   * 
   * @param {string} key - Cache key to delete
   * 
   * @example
   * ```js
   * cache.delete('outdated_data')
   * ```
   */
  delete(key) {
    try {
      const entry = this.cache.get(key)
      if (entry) {
        this.cache.delete(key)
        this.metadata.totalSize -= entry.size
        this.metadata.totalEntries--
        logger.debug(`Cache deleted: ${key}`)
      }
    } catch (error) {
      logger.error('Failed to delete cache entry', error)
    }
  }

  /**
   * Clear all cache entries and reset metadata
   * 
   * Removes all cached data and resets statistics to initial state.
   * 
   * @example
   * ```js
   * cache.clear() // Remove all cached data
   * ```
   */
  clear() {
    try {
      this.cache.clear()
      this.metadata = {
        totalSize: 0,
        totalEntries: 0,
        hits: 0,
        misses: 0,
        evictions: 0
      }
      logger.info('Cache cleared')
    } catch (error) {
      logger.error('Failed to clear cache', error)
    }
  }

  /**
   * Check if cache has valid (non-expired) entry
   * 
   * Verifies that a key exists in cache and hasn't expired.
   * Automatically removes expired entries.
   * 
   * @param {string} key - Cache key to check
   * @returns {boolean} True if key exists and is not expired
   * 
   * @example
   * ```js
   * if (cache.has('user_session')) {
   *   // Use cached session data
   * } else {
   *   // Need to authenticate user
   * }
   * ```
   */
  has(key) {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key)
      return false
    }
    
    return true
  }

  /**
   * Get comprehensive cache statistics
   * 
   * Returns detailed metrics about cache performance and usage.
   * 
   * @returns {Object} Cache statistics object
   * @returns {number} returns.totalSize - Total memory usage in bytes
   * @returns {number} returns.totalEntries - Number of cached entries
   * @returns {number} returns.hits - Total cache hits
   * @returns {number} returns.misses - Total cache misses
   * @returns {number} returns.evictions - Number of evicted entries
   * @returns {string} returns.hitRate - Hit rate percentage
   * @returns {number} returns.averageEntrySize - Average entry size in bytes
   * @returns {string} returns.memoryUsage - Formatted memory usage string
   * 
   * @example
   * ```js
   * const stats = cache.getStats()
   * console.log(`Cache efficiency: ${stats.hitRate}`) // "85.5%"
   * console.log(`Memory usage: ${stats.memoryUsage}`) // "2.3 MB"
   * ```
   */
  getStats() {
    const hitRate = this.metadata.hits + this.metadata.misses > 0 
      ? (this.metadata.hits / (this.metadata.hits + this.metadata.misses) * 100).toFixed(2)
      : 0

    return {
      ...this.metadata,
      hitRate: `${hitRate}%`,
      averageEntrySize: this.metadata.totalEntries > 0 
        ? Math.round(this.metadata.totalSize / this.metadata.totalEntries)
        : 0,
      memoryUsage: this.formatBytes(this.metadata.totalSize)
    }
  }

  /**
   * Evict entries if cache limits would be exceeded
   * 
   * Checks memory and entry count limits before adding new entries.
   * Uses LRU eviction to make space for new data.
   * 
   * @param {number} newEntrySize - Size in bytes of entry to be added
   * @private
   */
  evictIfNeeded(newEntrySize) {
    // Check memory limit
    while (this.metadata.totalSize + newEntrySize > CACHE_CONFIG.MAX_MEMORY_SIZE && this.cache.size > 0) {
      this.evictLeastRecentlyUsed()
    }

    // Check entry count limit
    while (this.metadata.totalEntries >= CACHE_CONFIG.MAX_ENTRIES && this.cache.size > 0) {
      this.evictLeastRecentlyUsed()
    }
  }

  /**
   * Evict the least recently used cache entry
   * 
   * Finds and removes the entry with the oldest timestamp.
   * Updates eviction statistics.
   * 
   * @private
   */
  evictLeastRecentlyUsed() {
    let oldestKey = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.delete(oldestKey)
      this.metadata.evictions++
      logger.debug(`Cache evicted LRU: ${oldestKey}`)
    }
  }

  /**
   * Estimate size of data in bytes
   * 
   * Uses Blob API for accurate size estimation, with fallback
   * to string length estimation for compatibility.
   * 
   * @param {any} data - Data to estimate (will be JSON stringified)
   * @returns {number} Estimated size in bytes
   * @private
   */
  estimateSize(data) {
    try {
      return new Blob([JSON.stringify(data)]).size
    } catch {
      // Fallback estimation
      const str = JSON.stringify(data)
      return str.length * 2 // Rough estimate for UTF-16
    }
  }

  /**
   * Format bytes to human-readable format
   * 
   * Converts byte values to appropriate units (Bytes, KB, MB, GB).
   * 
   * @param {number} bytes - Number of bytes to format
   * @returns {string} Formatted size string (e.g., "2.5 MB")
   * @private
   * 
   * @example
   * ```js
   * formatBytes(1024) // "1 KB"
   * formatBytes(1536) // "1.5 KB"
   * formatBytes(1048576) // "1 MB"
   * ```
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

/**
 * Persistent cache using localStorage with automatic cleanup
 * 
 * Provides data persistence across browser sessions using localStorage.
 * Includes automatic cleanup of expired entries and metadata management.
 * 
 * Features:
 * - localStorage-based persistence
 * - Automatic expiration handling
 * - Metadata tracking for cache management
 * - Graceful fallback when localStorage unavailable
 * - Periodic cleanup of expired entries
 * - Storage availability detection
 * 
 * @class PersistentCache
 * @example
 * ```js
 * const persistentCache = new PersistentCache()
 * 
 * // Set persistent cache entry
 * persistentCache.set('user_settings', settings, 7 * 24 * 60 * 60 * 1000) // 7 days
 * 
 * // Get persistent cache entry
 * const settings = persistentCache.get('user_settings')
 * 
 * // Cleanup expired entries
 * persistentCache.cleanup()
 * ```
 */
class PersistentCache {
  constructor() {
    this.storageAvailable = this.checkStorageAvailability()
    this.loadMetadata()
  }

  /**
   * Check if localStorage is available and functional
   * 
   * Tests localStorage availability by attempting to write and read a test value.
   * Handles cases where localStorage exists but is disabled or full.
   * 
   * @returns {boolean} True if localStorage is available and functional
   * @private
   */
  checkStorageAvailability() {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * Load cache metadata from localStorage
   * 
   * Retrieves cache metadata including tracked keys, total size, and last cleanup time.
   * Creates default metadata if none exists or if loading fails.
   * 
   * @private
   */
  loadMetadata() {
    if (!this.storageAvailable) return

    try {
      const metadata = localStorage.getItem(CACHE_CONFIG.METADATA_KEY)
      this.metadata = metadata ? JSON.parse(metadata) : {
        keys: [],
        totalSize: 0,
        lastCleanup: Date.now()
      }
    } catch (error) {
      logger.error('Failed to load cache metadata', error)
      this.metadata = {
        keys: [],
        totalSize: 0,
        lastCleanup: Date.now()
      }
    }
  }

  /**
   * Save cache metadata to localStorage
   * 
   * Persists current cache metadata for tracking purposes.
   * Fails silently if localStorage is unavailable.
   * 
   * @private
   */
  saveMetadata() {
    if (!this.storageAvailable) return

    try {
      localStorage.setItem(CACHE_CONFIG.METADATA_KEY, JSON.stringify(this.metadata))
    } catch (error) {
      logger.error('Failed to save cache metadata', error)
    }
  }

  /**
   * Set cache entry in localStorage with metadata tracking
   * 
   * Stores data in localStorage with timestamp and TTL information.
   * Updates metadata to track cache keys and total size.
   * 
   * @param {string} key - Unique cache key identifier
   * @param {any} data - Data to cache (will be JSON serialized)
   * @param {number} [ttl=CACHE_CONFIG.WEATHER_DATA] - Time to live in milliseconds
   * 
   * @example
   * ```js
   * // Cache user preferences for 7 days
   * persistentCache.set('user_prefs', preferences, 7 * 24 * 60 * 60 * 1000)
   * 
   * // Cache with default TTL
   * persistentCache.set('temp_data', tempData)
   * ```
   */
  set(key, data, ttl = CACHE_CONFIG.WEATHER_DATA) {
    if (!this.storageAvailable) return

    try {
      const entry = {
        data,
        timestamp: Date.now(),
        ttl
      }

      const storageKey = CACHE_CONFIG.STORAGE_PREFIX + key
      const serialized = JSON.stringify(entry)
      
      localStorage.setItem(storageKey, serialized)
      
      // Update metadata
      if (!this.metadata.keys.includes(key)) {
        this.metadata.keys.push(key)
      }
      this.metadata.totalSize += serialized.length
      this.saveMetadata()

      logger.debug(`Persistent cache set: ${key}`)
    } catch (error) {
      logger.error('Failed to set persistent cache entry', error)
    }
  }

  /**
   * Get cache entry from localStorage with expiration check
   * 
   * Retrieves cached data if it exists and hasn't expired.
   * Automatically removes expired entries from storage.
   * 
   * @param {string} key - Cache key to retrieve
   * @returns {any|null} Cached data or null if not found/expired
   * 
   * @example
   * ```js
   * const userData = persistentCache.get('user_123')
   * if (userData) {
   *   console.log('Found cached user data')
   * } else {
   *   console.log('No cached data or expired')
   * }
   * ```
   */
  get(key) {
    if (!this.storageAvailable) return null

    try {
      const storageKey = CACHE_CONFIG.STORAGE_PREFIX + key
      const serialized = localStorage.getItem(storageKey)
      
      if (!serialized) {
        return null
      }

      const entry = JSON.parse(serialized)
      
      // Check if entry has expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.delete(key)
        return null
      }

      logger.debug(`Persistent cache hit: ${key}`)
      return entry.data
    } catch (error) {
      logger.error('Failed to get persistent cache entry', error)
      return null
    }
  }

  /**
   * Delete cache entry from localStorage and update metadata
   * 
   * Removes the specified entry from localStorage and updates
   * the metadata to reflect the change.
   * 
   * @param {string} key - Cache key to delete
   * 
   * @example
   * ```js
   * persistentCache.delete('outdated_user_data')
   * ```
   */
  delete(key) {
    if (!this.storageAvailable) return

    try {
      const storageKey = CACHE_CONFIG.STORAGE_PREFIX + key
      localStorage.removeItem(storageKey)
      
      // Update metadata
      const index = this.metadata.keys.indexOf(key)
      if (index > -1) {
        this.metadata.keys.splice(index, 1)
        this.saveMetadata()
      }

      logger.debug(`Persistent cache deleted: ${key}`)
    } catch (error) {
      logger.error('Failed to delete persistent cache entry', error)
    }
  }

  /**
   * Clear all cache entries from localStorage
   * 
   * Removes all cached entries and resets metadata.
   * Useful for cache invalidation or user logout scenarios.
   * 
   * @example
   * ```js
   * // Clear all cached data on logout
   * persistentCache.clear()
   * ```
   */
  clear() {
    if (!this.storageAvailable) return

    try {
      // Remove all cache entries
      this.metadata.keys.forEach(key => {
        const storageKey = CACHE_CONFIG.STORAGE_PREFIX + key
        localStorage.removeItem(storageKey)
      })

      // Clear metadata
      localStorage.removeItem(CACHE_CONFIG.METADATA_KEY)
      this.metadata = {
        keys: [],
        totalSize: 0,
        lastCleanup: Date.now()
      }

      logger.info('Persistent cache cleared')
    } catch (error) {
      logger.error('Failed to clear persistent cache', error)
    }
  }

  /**
   * Cleanup expired entries from localStorage
   * 
   * Scans all cached entries and removes those that have expired.
   * Updates metadata and logs cleanup results. Should be called periodically
   * to prevent localStorage from filling with stale data.
   * 
   * @example
   * ```js
   * // Manual cleanup
   * persistentCache.cleanup()
   * 
   * // Automatic cleanup every hour
   * setInterval(() => persistentCache.cleanup(), 60 * 60 * 1000)
   * ```
   */
  cleanup() {
    if (!this.storageAvailable) return

    try {
      const now = Date.now()
      const keysToDelete = []

      this.metadata.keys.forEach(key => {
        const storageKey = CACHE_CONFIG.STORAGE_PREFIX + key
        const serialized = localStorage.getItem(storageKey)
        
        if (serialized) {
          try {
            const entry = JSON.parse(serialized)
            if (now - entry.timestamp > entry.ttl) {
              keysToDelete.push(key)
            }
          } catch {
            keysToDelete.push(key) // Remove corrupted entries
          }
        } else {
          keysToDelete.push(key) // Remove missing entries from metadata
        }
      })

      keysToDelete.forEach(key => this.delete(key))
      this.metadata.lastCleanup = now
      this.saveMetadata()

      logger.info(`Persistent cache cleanup: removed ${keysToDelete.length} expired entries`)
    } catch (error) {
      logger.error('Failed to cleanup persistent cache', error)
    }
  }
}

/**
 * Main cache service that combines memory and persistent caching
 * 
 * Provides a unified interface for both in-memory and persistent caching.
 * Automatically promotes frequently accessed data to memory cache for
 * optimal performance while maintaining persistence across sessions.
 * 
 * Features:
 * - Dual-layer caching (memory + persistent)
 * - Automatic cache promotion
 * - Configurable TTL and persistence options
 * - Built-in cache key generation
 * - Comprehensive statistics
 * - Automatic cleanup scheduling
 * 
 * @class CacheService
 * @example
 * ```js
 * import { cacheService } from '@/services/cacheService'
 * 
 * // Cache with both memory and persistence
 * cacheService.set('important_data', data, {
 *   ttl: 30 * 60 * 1000, // 30 minutes
 *   persistent: true,
 *   memory: true
 * })
 * 
 * // Retrieve data (checks memory first, then persistent)
 * const data = cacheService.get('important_data')
 * 
 * // Generate standardized cache keys
 * const weatherKey = cacheService.generateWeatherKey(lat, lng, 'forecast')
 * const geoKey = cacheService.generateGeocodingKey('London')
 * ```
 */
class CacheService {
  constructor() {
    this.memoryCache = new MemoryCache()
    this.persistentCache = new PersistentCache()
    
    // Cleanup persistent cache on startup
    this.persistentCache.cleanup()
    
    // Setup periodic cleanup
    this.setupPeriodicCleanup()
  }

  /**
   * Set cache entry with configurable storage options
   * 
   * Stores data in memory and/or persistent cache based on options.
   * Allows fine-grained control over caching behavior.
   * 
   * @param {string} key - Unique cache key identifier
   * @param {any} data - Data to cache
   * @param {Object} [options={}] - Cache configuration options
   * @param {number} [options.ttl=CACHE_CONFIG.WEATHER_DATA] - Time to live in milliseconds
   * @param {boolean} [options.persistent=false] - Store in localStorage
   * @param {boolean} [options.memory=true] - Store in memory cache
   * 
   * @example
   * ```js
   * // Memory only (fast access, session-based)
   * cacheService.set('temp_data', data, { memory: true, persistent: false })
   * 
   * // Persistent only (survives browser restart)
   * cacheService.set('user_prefs', prefs, { memory: false, persistent: true })
   * 
   * // Both (optimal performance + persistence)
   * cacheService.set('weather_data', weather, {
   *   ttl: 10 * 60 * 1000,
   *   memory: true,
   *   persistent: true
   * })
   * ```
   */
  set(key, data, options = {}) {
    const {
      ttl = CACHE_CONFIG.WEATHER_DATA,
      persistent = false,
      memory = true
    } = options

    if (memory) {
      this.memoryCache.set(key, data, ttl)
    }

    if (persistent) {
      this.persistentCache.set(key, data, ttl)
    }
  }

  /**
   * Get cache entry with automatic promotion
   * 
   * Retrieves data from memory cache first for optimal performance.
   * If not found in memory, checks persistent cache and promotes
   * the data to memory cache for future fast access.
   * 
   * @param {string} key - Cache key to retrieve
   * @returns {any|null} Cached data or null if not found in either cache
   * 
   * @example
   * ```js
   * const weatherData = cacheService.get('weather_london')
   * if (weatherData) {
   *   // Data found in cache (memory or persistent)
   *   displayWeather(weatherData)
   * } else {
   *   // Cache miss - fetch fresh data
   *   const freshData = await fetchWeatherData()
   *   cacheService.set('weather_london', freshData)
   * }
   * ```
   */
  get(key) {
    // Try memory cache first
    let data = this.memoryCache.get(key)
    if (data !== null) {
      return data
    }

    // Try persistent cache
    data = this.persistentCache.get(key)
    if (data !== null) {
      // Promote to memory cache
      this.memoryCache.set(key, data)
      return data
    }

    return null
  }

  /**
   * Delete cache entry from both memory and persistent storage
   * 
   * Removes the specified entry from both cache layers.
   * 
   * @param {string} key - Cache key to delete
   * 
   * @example
   * ```js
   * // Remove outdated data
   * cacheService.delete('old_weather_data')
   * ```
   */
  delete(key) {
    this.memoryCache.delete(key)
    this.persistentCache.delete(key)
  }

  /**
   * Clear all cache entries from both memory and persistent storage
   * 
   * Removes all cached data from both cache layers.
   * Useful for cache invalidation or user logout scenarios.
   * 
   * @example
   * ```js
   * // Clear all cached data
   * cacheService.clear()
   * ```
   */
  clear() {
    this.memoryCache.clear()
    this.persistentCache.clear()
  }

  /**
   * Get comprehensive cache statistics from both layers
   * 
   * Returns detailed statistics for both memory and persistent caches.
   * 
   * @returns {Object} Combined cache statistics
   * @returns {Object} returns.memory - Memory cache statistics
   * @returns {Object} returns.persistent - Persistent cache statistics
   * @returns {boolean} returns.persistent.available - localStorage availability
   * @returns {number} returns.persistent.entries - Number of persistent entries
   * @returns {number} returns.persistent.totalSize - Total persistent storage size
   * @returns {string} returns.persistent.lastCleanup - Last cleanup timestamp
   * 
   * @example
   * ```js
   * const stats = cacheService.getStats()
   * console.log(`Memory hit rate: ${stats.memory.hitRate}`)
   * console.log(`Persistent entries: ${stats.persistent.entries}`)
   * console.log(`Total memory usage: ${stats.memory.memoryUsage}`)
   * ```
   */
  getStats() {
    return {
      memory: this.memoryCache.getStats(),
      persistent: {
        available: this.persistentCache.storageAvailable,
        entries: this.persistentCache.metadata.keys.length,
        totalSize: this.persistentCache.metadata.totalSize,
        lastCleanup: new Date(this.persistentCache.metadata.lastCleanup).toISOString()
      }
    }
  }

  /**
   * Setup periodic cleanup of expired entries
   * 
   * Schedules automatic cleanup of expired persistent cache entries
   * every hour to prevent localStorage from accumulating stale data.
   * 
   * @private
   */
  setupPeriodicCleanup() {
    // Cleanup every hour
    setInterval(() => {
      this.persistentCache.cleanup()
    }, 60 * 60 * 1000)
  }

  /**
   * Generate standardized cache key for weather data
   * 
   * Creates consistent cache keys for weather data based on coordinates
   * and data type. Coordinates are rounded to 4 decimal places for
   * reasonable cache granularity.
   * 
   * @param {number} lat - Latitude (-90 to 90)
   * @param {number} lng - Longitude (-180 to 180)
   * @param {string} [type='current'] - Data type ('current', 'forecast', 'alerts')
   * @returns {string} Standardized cache key
   * 
   * @example
   * ```js
   * // Generate keys for different weather data types
   * const currentKey = cacheService.generateWeatherKey(51.5074, -0.1278, 'current')
   * // Returns: "weather_current_51.5074_-0.1278"
   * 
   * const forecastKey = cacheService.generateWeatherKey(40.7128, -74.0060, 'forecast')
   * // Returns: "weather_forecast_40.7128_-74.0060"
   * 
   * const alertsKey = cacheService.generateWeatherKey(25.7617, -80.1918, 'alerts')
   * // Returns: "weather_alerts_25.7617_-80.1918"
   * ```
   */
  generateWeatherKey(lat, lng, type = 'current') {
    return `weather_${type}_${lat.toFixed(4)}_${lng.toFixed(4)}`
  }

  /**
   * Generate standardized cache key for geocoding data
   * 
   * Creates consistent cache keys for location search results.
   * Query is normalized to lowercase and URL-encoded for consistency.
   * 
   * @param {string} query - Location search query
   * @returns {string} Standardized cache key
   * 
   * @example
   * ```js
   * // Generate keys for location searches
   * const londonKey = cacheService.generateGeocodingKey('London')
   * // Returns: "geocoding_london"
   * 
   * const addressKey = cacheService.generateGeocodingKey('123 Main St, New York')
   * // Returns: "geocoding_123%20main%20st%2C%20new%20york"
   * 
   * const unicodeKey = cacheService.generateGeocodingKey('東京')
   * // Returns: "geocoding_%E6%9D%B1%E4%BA%AC"
   * ```
   */
  generateGeocodingKey(query) {
    return `geocoding_${encodeURIComponent(query.toLowerCase())}`
  }
}

// Create singleton instance
const cacheService = new CacheService()

// Export cache service and configuration
export { cacheService, CACHE_CONFIG }
export default cacheService