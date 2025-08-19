/**
 * Comprehensive error handling and logging system
 * 
 * Provides centralized error handling, logging, and reporting capabilities
 * for the weather application. Includes custom error types, severity levels,
 * global error handlers, and integration points for external error services.
 * 
 * @fileoverview Error handling and logging utilities
 * @module ErrorHandler
 * @version 1.0.0
 */

/**
 * Error types enumeration for categorizing different kinds of errors
 * 
 * Used to classify errors for better handling, filtering, and reporting.
 * Each type represents a specific category of error that may require
 * different handling strategies.
 * 
 * @readonly
 * @enum {string}
 * @example
 * ```js
 * import { ErrorTypes } from '@/services/errorHandler'
 * 
 * // Create a network error
 * const error = new AppError('Connection failed', ErrorTypes.NETWORK)
 * 
 * // Check error type
 * if (error.type === ErrorTypes.API) {
 *   // Handle API-specific error
 * }
 * ```
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  API: 'API_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
}

/**
 * Error severity levels for prioritizing error handling and alerts
 * 
 * Defines the impact level of errors to help with prioritization,
 * alerting, and response strategies. Higher severity errors may
 * trigger immediate notifications or escalation procedures.
 * 
 * @readonly
 * @enum {string}
 * @example
 * ```js
 * import { ErrorSeverity } from '@/services/errorHandler'
 * 
 * // Create a critical error
 * const error = new AppError('Database connection lost', ErrorTypes.NETWORK, ErrorSeverity.CRITICAL)
 * 
 * // Handle based on severity
 * if (error.severity === ErrorSeverity.CRITICAL) {
 *   // Immediate escalation required
 *   notifyAdministrators(error)
 * }
 * ```
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

/**
 * Custom error class with enhanced context and metadata
 * 
 * Extends the native Error class to provide additional context,
 * categorization, and metadata for better error tracking and debugging.
 * Includes automatic timestamp, user agent, and URL capture.
 * 
 * @class AppError
 * @extends Error
 * @example
 * ```js
 * import { AppError, ErrorTypes, ErrorSeverity } from '@/services/errorHandler'
 * 
 * // Create a detailed error
 * const error = new AppError(
 *   'Failed to fetch weather data',
 *   ErrorTypes.API,
 *   ErrorSeverity.HIGH,
 *   { 
 *     endpoint: '/api/weather',
 *     statusCode: 500,
 *     retryCount: 3
 *   }
 * )
 * 
 * // Error includes automatic metadata
 * console.log(error.timestamp) // ISO timestamp
 * console.log(error.url)       // Current page URL
 * console.log(error.context)   // Custom context data
 * ```
 */
export class AppError extends Error {
  /**
   * Create a new AppError instance
   * 
   * @param {string} message - Human-readable error message
   * @param {string} [type=ErrorTypes.UNKNOWN] - Error type from ErrorTypes enum
   * @param {string} [severity=ErrorSeverity.MEDIUM] - Error severity from ErrorSeverity enum
   * @param {Object} [context={}] - Additional context data for debugging
   */
  constructor(message, type = ErrorTypes.UNKNOWN, severity = ErrorSeverity.MEDIUM, context = {}) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.severity = severity
    this.context = context
    this.timestamp = new Date().toISOString()
    this.userAgent = navigator.userAgent
    this.url = window.location.href
  }

  /**
   * Convert error to JSON-serializable object
   * 
   * Creates a plain object representation of the error that can be
   * safely serialized to JSON for logging, reporting, or storage.
   * 
   * @returns {Object} JSON-serializable error object
   * @returns {string} returns.name - Error class name
   * @returns {string} returns.message - Error message
   * @returns {string} returns.type - Error type
   * @returns {string} returns.severity - Error severity
   * @returns {Object} returns.context - Additional context data
   * @returns {string} returns.timestamp - ISO timestamp
   * @returns {string} returns.userAgent - Browser user agent
   * @returns {string} returns.url - Page URL where error occurred
   * @returns {string} returns.stack - Error stack trace
   * 
   * @example
   * ```js
   * const error = new AppError('Test error')
   * const errorData = error.toJSON()
   * 
   * // Send to logging service
   * await fetch('/api/logs', {
   *   method: 'POST',
   *   body: JSON.stringify(errorData)
   * })
   * ```
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp,
      userAgent: this.userAgent,
      url: this.url,
      stack: this.stack
    }
  }
}

/**
 * Logger class for structured logging with multiple levels
 * 
 * Provides comprehensive logging capabilities with different severity levels,
 * automatic metadata capture, and log storage for debugging purposes.
 * Includes development-only debug logging and log export functionality.
 * 
 * @class Logger
 * @private
 * @example
 * ```js
 * const logger = new Logger()
 * 
 * // Different log levels
 * logger.debug('Debug info', { userId: 123 })
 * logger.info('User logged in', { username: 'john' })
 * logger.warn('API rate limit approaching', { remaining: 10 })
 * logger.error('Database connection failed', error)
 * 
 * // Export logs for analysis
 * const logs = logger.exportLogs()
 * ```
 */
class Logger {
  /**
   * Create a new Logger instance
   * 
   * Initializes the logger with environment detection and log storage.
   */
  /**
   * Create a new ErrorHandler instance
   * 
   * Initializes the error handler with logger and sets up global error handlers.
   */
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.logs = []
    this.maxLogs = 1000
  }

  /**
   * Log debug information (development environment only)
   * 
   * Debug logs are only output in development mode to avoid
   * cluttering production logs with verbose debugging information.
   * 
   * @param {string} message - Debug message
   * @param {any} [data=null] - Additional debug data
   * 
   * @example
   * ```js
   * logger.debug('API request started', {
   *   url: '/api/weather',
   *   params: { lat: 40.7128, lng: -74.0060 }
   * })
   * ```
   */
  debug(message, data = null) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data)
      this.addLog('debug', message, data)
    }
  }

  /**
   * Log general information
   * 
   * Info logs are used for general application flow and
   * important events that should be tracked in all environments.
   * 
   * @param {string} message - Information message
   * @param {any} [data=null] - Additional context data
   * 
   * @example
   * ```js
   * logger.info('User authentication successful', {
   *   userId: 123,
   *   loginMethod: 'oauth'
   * })
   * ```
   */
  info(message, data = null) {
    console.info(`[INFO] ${message}`, data)
    this.addLog('info', message, data)
  }

  /**
   * Log warnings for potentially problematic situations
   * 
   * Warning logs indicate issues that don't prevent operation
   * but should be monitored and may require attention.
   * 
   * @param {string} message - Warning message
   * @param {any} [data=null] - Additional context data
   * 
   * @example
   * ```js
   * logger.warn('API response time exceeded threshold', {
   *   responseTime: 5000,
   *   threshold: 3000,
   *   endpoint: '/api/weather'
   * })
   * ```
   */
  warn(message, data = null) {
    console.warn(`[WARN] ${message}`, data)
    this.addLog('warn', message, data)
  }

  /**
   * Log errors that require attention
   * 
   * Error logs indicate failures or exceptions that impact
   * application functionality and require investigation.
   * 
   * @param {string} message - Error message
   * @param {Error|any} [error=null] - Error object or additional data
   * 
   * @example
   * ```js
   * logger.error('Failed to save user preferences', {
   *   userId: 123,
   *   error: error.message,
   *   stack: error.stack
   * })
   * ```
   */
  error(message, error = null) {
    console.error(`[ERROR] ${message}`, error)
    this.addLog('error', message, error)
  }

  /**
   * Add log entry to internal storage with metadata
   * 
   * Stores log entries with timestamp and URL for debugging purposes.
   * Maintains a rolling buffer of recent logs with automatic cleanup.
   * 
   * @param {string} level - Log level (debug, info, warn, error)
   * @param {string} message - Log message
   * @param {any} data - Additional log data
   * @private
   */
  addLog(level, message, data) {
    const logEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      url: window.location.href
    }

    this.logs.unshift(logEntry)
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }
  }

  /**
   * Get recent logs for debugging and analysis
   * 
   * Retrieves the most recent log entries, useful for debugging
   * and displaying recent application activity.
   * 
   * @param {number} [count=50] - Number of recent logs to retrieve
   * @returns {Array<Object>} Array of recent log entries
   * 
   * @example
   * ```js
   * // Get last 10 log entries
   * const recentLogs = logger.getRecentLogs(10)
   * recentLogs.forEach(log => {
   *   console.log(`[${log.level}] ${log.message}`, log.data)
   * })
   * ```
   */
  getRecentLogs(count = 50) {
    return this.logs.slice(0, count)
  }

  /**
   * Clear all stored logs
   * 
   * Removes all log entries from internal storage.
   * Useful for cleanup or privacy purposes.
   * 
   * @example
   * ```js
   * // Clear logs on user logout
   * logger.clearLogs()
   * ```
   */
  clearLogs() {
    this.logs = []
  }

  /**
   * Export all logs as JSON string
   * 
   * Creates a JSON representation of all stored logs for
   * export, analysis, or external logging services.
   * 
   * @returns {string} JSON string of all log entries
   * 
   * @example
   * ```js
   * // Export logs for support ticket
   * const logData = logger.exportLogs()
   * downloadFile('application-logs.json', logData)
   * ```
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2)
  }
}

/**
 * Error handler class for centralized error management
 * 
 * Provides comprehensive error handling including global error capture,
 * error categorization, callback management, and external error reporting.
 * Automatically sets up global error handlers for unhandled errors.
 * 
 * @class ErrorHandler
 * @example
 * ```js
 * import { errorHandler } from '@/services/errorHandler'
 * 
 * // Handle application errors
 * try {
 *   await riskyOperation()
 * } catch (error) {
 *   errorHandler.handleError(error)
 * }
 * 
 * // Add error callback for notifications
 * errorHandler.onError((error) => {
 *   if (error.severity === ErrorSeverity.CRITICAL) {
 *     showNotification('Critical error occurred')
 *   }
 * })
 * 
 * // Get error statistics
 * const stats = errorHandler.getErrorStats()
 * console.log(`Total errors: ${stats.total}`)
 * ```
 */
class ErrorHandler {
  constructor() {
    this.logger = new Logger()
    this.errorCallbacks = []
    this.setupGlobalErrorHandlers()
  }

  /**
   * Setup global error handlers for unhandled errors
   * 
   * Registers event listeners for unhandled promise rejections
   * and global JavaScript errors to ensure no errors go unnoticed.
   * 
   * @private
   */
  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        new AppError(
          `Unhandled Promise Rejection: ${event.reason}`,
          ErrorTypes.UNKNOWN,
          ErrorSeverity.HIGH,
          { reason: event.reason }
        )
      )
    })

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(
        new AppError(
          `Global Error: ${event.message}`,
          ErrorTypes.UNKNOWN,
          ErrorSeverity.HIGH,
          {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
          }
        )
      )
    })
  }

  /**
   * Handle application errors with comprehensive processing
   * 
   * Processes errors through the complete error handling pipeline:
   * normalization, logging, callback execution, and external reporting.
   * 
   * @param {Error|AppError|any} error - Error to handle
   * @returns {AppError} Normalized AppError instance
   * 
   * @example
   * ```js
   * try {
   *   await fetchWeatherData()
   * } catch (error) {
   *   const appError = errorHandler.handleError(error)
   *   
   *   // Handle based on error type
   *   if (appError.type === ErrorTypes.NETWORK) {
   *     showRetryButton()
   *   }
   * }
   * ```
   */
  handleError(error) {
    let appError

    if (error instanceof AppError) {
      appError = error
    } else {
      appError = this.createAppError(error)
    }

    // Log the error
    this.logger.error(appError.message, appError)

    // Execute error callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(appError)
      } catch (callbackError) {
        this.logger.error('Error in error callback', callbackError)
      }
    })

    // Send to external error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(appError)
    }

    return appError
  }

  /**
   * Create AppError from generic error with intelligent categorization
   * 
   * Converts generic errors into AppError instances with appropriate
   * type and severity classification based on error characteristics.
   * 
   * @param {Error|any} error - Generic error to convert
   * @returns {AppError} Normalized AppError instance
   * @private
   */
  createAppError(error) {
    let type = ErrorTypes.UNKNOWN
    let severity = ErrorSeverity.MEDIUM

    // Determine error type based on error properties
    if (error.name === 'TypeError') {
      type = ErrorTypes.VALIDATION
    } else if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      type = ErrorTypes.NETWORK
      severity = ErrorSeverity.HIGH
    } else if (error.response) {
      type = ErrorTypes.API
      if (error.response.status >= 500) {
        severity = ErrorSeverity.HIGH
      }
    }

    return new AppError(
      error.message || 'An unknown error occurred',
      type,
      severity,
      {
        originalError: error,
        stack: error.stack
      }
    )
  }

  /**
   * Add error callback for custom error handling
   * 
   * Registers a callback function that will be executed whenever
   * an error is handled. Useful for custom notifications, logging,
   * or error recovery strategies.
   * 
   * @param {Function} callback - Function to call on error
   * @param {AppError} callback.error - The handled error
   * 
   * @example
   * ```js
   * // Add notification callback
   * errorHandler.onError((error) => {
   *   if (error.severity === ErrorSeverity.HIGH) {
   *     notificationService.showError(error.message)
   *   }
   * })
   * 
   * // Add analytics callback
   * errorHandler.onError((error) => {
   *   analytics.track('error_occurred', {
   *     type: error.type,
   *     severity: error.severity
   *   })
   * })
   * ```
   */
  onError(callback) {
    if (typeof callback === 'function') {
      this.errorCallbacks.push(callback)
    }
  }

  /**
   * Remove error callback
   * 
   * Unregisters a previously added error callback function.
   * 
   * @param {Function} callback - The callback function to remove
   * 
   * @example
   * ```js
   * const errorCallback = (error) => console.log(error)
   * 
   * // Add callback
   * errorHandler.onError(errorCallback)
   * 
   * // Later, remove callback
   * errorHandler.offError(errorCallback)
   * ```
   */
  offError(callback) {
    const index = this.errorCallbacks.indexOf(callback)
    if (index > -1) {
      this.errorCallbacks.splice(index, 1)
    }
  }

  /**
   * Report error to external service for monitoring and analysis
   * 
   * Sends error data to external error reporting services like Sentry,
   * LogRocket, or custom logging endpoints. Currently includes a placeholder
   * implementation that can be extended with actual service integration.
   * 
   * @param {AppError} error - The error to report
   * @returns {Promise<void>} Promise that resolves when reporting completes
   * 
   * @example
   * ```js
   * // Automatic reporting in production
   * const error = new AppError('Critical system failure')
   * await errorHandler.reportError(error)
   * 
   * // Custom implementation example:
   * // await fetch('https://api.sentry.io/errors', {
   * //   method: 'POST',
   * //   headers: { 'Authorization': 'Bearer token' },
   * //   body: JSON.stringify(error.toJSON())
   * // })
   * ```
   */
  async reportError(error) {
    try {
      // In a real application, you would send this to a service like Sentry, LogRocket, etc.
      // For now, we'll just log it
      this.logger.info('Error reported to external service', error.toJSON())
      
      // Example: Send to external error reporting service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error.toJSON())
      // })
    } catch (reportingError) {
      this.logger.error('Failed to report error to external service', reportingError)
    }
  }

  /**
   * Get comprehensive error statistics for monitoring and analysis
   * 
   * Analyzes logged errors to provide insights into error patterns,
   * frequency, and distribution by type and severity.
   * 
   * @returns {Object} Error statistics object
   * @returns {number} returns.total - Total number of errors
   * @returns {Object} returns.byType - Error count by type
   * @returns {Object} returns.bySeverity - Error count by severity
   * @returns {Array<Object>} returns.recent - Most recent error entries
   * 
   * @example
   * ```js
   * const stats = errorHandler.getErrorStats()
   * 
   * console.log(`Total errors: ${stats.total}`)
   * console.log(`Network errors: ${stats.byType[ErrorTypes.NETWORK] || 0}`)
   * console.log(`Critical errors: ${stats.bySeverity[ErrorSeverity.CRITICAL] || 0}`)
   * 
   * // Display recent errors
   * stats.recent.forEach(error => {
   *   console.log(`${error.timestamp}: ${error.message}`)
   * })
   * ```
   */
  getErrorStats() {
    const errorLogs = this.logger.logs.filter(log => log.level === 'error')
    const stats = {
      total: errorLogs.length,
      byType: {},
      bySeverity: {},
      recent: errorLogs.slice(0, 10)
    }

    errorLogs.forEach(log => {
      if (log.data && log.data.type) {
        stats.byType[log.data.type] = (stats.byType[log.data.type] || 0) + 1
      }
      if (log.data && log.data.severity) {
        stats.bySeverity[log.data.severity] = (stats.bySeverity[log.data.severity] || 0) + 1
      }
    })

    return stats
  }
}

// Create singleton instances
/**
 * Singleton logger instance for application-wide logging
 * 
 * @type {Logger}
 * @example
 * ```js
 * import { logger } from '@/services/errorHandler'
 * 
 * logger.info('Application started')
 * logger.error('Failed to load data', error)
 * ```
 */
export const logger = new Logger()

/**
 * Singleton error handler instance for application-wide error management
 * 
 * @type {ErrorHandler}
 * @example
 * ```js
 * import { errorHandler } from '@/services/errorHandler'
 * 
 * errorHandler.handleError(new Error('Something went wrong'))
 * ```
 */
export const errorHandler = new ErrorHandler()

/**
 * Create a network error with appropriate categorization
 * 
 * Utility function for creating network-related errors with
 * consistent type and severity classification.
 * 
 * @param {string} message - Error message describing the network issue
 * @param {Object} [context={}] - Additional context about the network error
 * @returns {AppError} Network error instance
 * 
 * @example
 * ```js
 * // Create network timeout error
 * const timeoutError = createNetworkError('Request timeout', {
 *   url: '/api/weather',
 *   timeout: 5000
 * })
 * 
 * // Create connection error
 * const connectionError = createNetworkError('Connection refused', {
 *   host: 'api.weather.com',
 *   port: 443
 * })
 * ```
 */
export const createNetworkError = (message, context = {}) => {
  return new AppError(message, ErrorTypes.NETWORK, ErrorSeverity.HIGH, context)
}

/**
 * Create an API error with status code and appropriate severity
 * 
 * Utility function for creating API-related errors with automatic
 * severity classification based on HTTP status codes.
 * 
 * @param {string} message - Error message describing the API issue
 * @param {number} statusCode - HTTP status code from the API response
 * @param {Object} [context={}] - Additional context about the API error
 * @returns {AppError} API error instance
 * 
 * @example
 * ```js
 * // Create server error (high severity)
 * const serverError = createApiError('Internal server error', 500, {
 *   endpoint: '/api/weather',
 *   method: 'GET'
 * })
 * 
 * // Create client error (medium severity)
 * const notFoundError = createApiError('Resource not found', 404, {
 *   resource: 'weather data',
 *   location: 'London'
 * })
 * 
 * // Create authentication error
 * const authError = createApiError('Unauthorized access', 401, {
 *   token: 'expired',
 *   user: 'john@example.com'
 * })
 * ```
 */
export const createApiError = (message, statusCode, context = {}) => {
  const severity = statusCode >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM
  return new AppError(message, ErrorTypes.API, severity, { statusCode, ...context })
}

/**
 * Create a validation error for form or data validation failures
 * 
 * Utility function for creating validation-related errors with
 * field-specific context for better error handling and user feedback.
 * 
 * @param {string} message - Error message describing the validation failure
 * @param {string} field - The field name that failed validation
 * @param {Object} [context={}] - Additional context about the validation error
 * @returns {AppError} Validation error instance
 * 
 * @example
 * ```js
 * // Create field validation error
 * const emailError = createValidationError(
 *   'Invalid email format',
 *   'email',
 *   { value: 'invalid-email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
 * )
 * 
 * // Create range validation error
 * const rangeError = createValidationError(
 *   'Temperature must be between -100 and 100',
 *   'temperature',
 *   { value: 150, min: -100, max: 100 }
 * )
 * 
 * // Create required field error
 * const requiredError = createValidationError(
 *   'Location is required',
 *   'location',
 *   { required: true }
 * )
 * ```
 */
export const createValidationError = (message, field, context = {}) => {
  return new AppError(message, ErrorTypes.VALIDATION, ErrorSeverity.LOW, { field, ...context })
}

/**
 * Default export of the error handler singleton
 * 
 * @type {ErrorHandler}
 * @default
 */
export default errorHandler