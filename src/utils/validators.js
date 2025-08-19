/**
 * Validation utilities for forms and data
 */

/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the validation passed
 * @property {string} message - Error message if validation failed
 * @property {string} field - Field name that was validated
 */

/**
 * Base validator class
 */
class Validator {
  constructor(field = '') {
    this.field = field
    this.rules = []
  }

  /**
   * Add a validation rule
   * @param {Function} rule - Validation function
   * @param {string} message - Error message
   * @returns {Validator} This validator for chaining
   */
  addRule(rule, message) {
    this.rules.push({ rule, message })
    return this
  }

  /**
   * Validate a value against all rules
   * @param {any} value - Value to validate
   * @returns {ValidationResult} Validation result
   */
  validate(value) {
    for (const { rule, message } of this.rules) {
      if (!rule(value)) {
        return {
          isValid: false,
          message,
          field: this.field
        }
      }
    }

    return {
      isValid: true,
      message: '',
      field: this.field
    }
  }
}

/**
 * Create a new validator instance
 * @param {string} field - Field name
 * @returns {Validator} New validator instance
 */
export const createValidator = (field = '') => {
  return new Validator(field)
}

/**
 * Required field validation
 * @param {any} value - Value to validate
 * @returns {boolean} True if value is not empty
 */
export const required = (value) => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim() !== ''
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

/**
 * Minimum length validation
 * @param {number} min - Minimum length
 * @returns {Function} Validation function
 */
export const minLength = (min) => (value) => {
  if (!value) return true // Let required handle empty values
  return value.toString().length >= min
}

/**
 * Maximum length validation
 * @param {number} max - Maximum length
 * @returns {Function} Validation function
 */
export const maxLength = (max) => (value) => {
  if (!value) return true
  return value.toString().length <= max
}

/**
 * Email validation
 * @param {string} value - Email to validate
 * @returns {boolean} True if valid email
 */
export const email = (value) => {
  if (!value) return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

/**
 * URL validation
 * @param {string} value - URL to validate
 * @returns {boolean} True if valid URL
 */
export const url = (value) => {
  if (!value) return true
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

/**
 * Numeric validation
 * @param {any} value - Value to validate
 * @returns {boolean} True if numeric
 */
export const numeric = (value) => {
  if (!value && value !== 0) return true
  return !isNaN(Number(value))
}

/**
 * Integer validation
 * @param {any} value - Value to validate
 * @returns {boolean} True if integer
 */
export const integer = (value) => {
  if (!value && value !== 0) return true
  return Number.isInteger(Number(value))
}

/**
 * Minimum value validation
 * @param {number} min - Minimum value
 * @returns {Function} Validation function
 */
export const minValue = (min) => (value) => {
  if (!value && value !== 0) return true
  return Number(value) >= min
}

/**
 * Maximum value validation
 * @param {number} max - Maximum value
 * @returns {Function} Validation function
 */
export const maxValue = (max) => (value) => {
  if (!value && value !== 0) return true
  return Number(value) <= max
}

/**
 * Pattern validation
 * @param {RegExp} pattern - Regular expression pattern
 * @returns {Function} Validation function
 */
export const pattern = (pattern) => (value) => {
  if (!value) return true
  return pattern.test(value)
}

/**
 * Phone number validation (basic)
 * @param {string} value - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
export const phone = (value) => {
  if (!value) return true
  const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/
  return phoneRegex.test(value.replace(/\s/g, ''))
}

/**
 * Date validation
 * @param {any} value - Date to validate
 * @returns {boolean} True if valid date
 */
export const date = (value) => {
  if (!value) return true
  const dateObj = new Date(value)
  return !isNaN(dateObj.getTime())
}

/**
 * Future date validation
 * @param {any} value - Date to validate
 * @returns {boolean} True if date is in the future
 */
export const futureDate = (value) => {
  if (!value) return true
  const dateObj = new Date(value)
  return dateObj > new Date()
}

/**
 * Past date validation
 * @param {any} value - Date to validate
 * @returns {boolean} True if date is in the past
 */
export const pastDate = (value) => {
  if (!value) return true
  const dateObj = new Date(value)
  return dateObj < new Date()
}

/**
 * Coordinate validation (latitude)
 * @param {any} value - Latitude to validate
 * @returns {boolean} True if valid latitude
 */
export const latitude = (value) => {
  if (!value && value !== 0) return true
  const num = Number(value)
  return !isNaN(num) && num >= -90 && num <= 90
}

/**
 * Coordinate validation (longitude)
 * @param {any} value - Longitude to validate
 * @returns {boolean} True if valid longitude
 */
export const longitude = (value) => {
  if (!value && value !== 0) return true
  const num = Number(value)
  return !isNaN(num) && num >= -180 && num <= 180
}

/**
 * Password strength validation
 * @param {string} value - Password to validate
 * @returns {boolean} True if strong password
 */
export const strongPassword = (value) => {
  if (!value) return true
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return strongRegex.test(value)
}

/**
 * Confirm password validation
 * @param {string} originalPassword - Original password
 * @returns {Function} Validation function
 */
export const confirmPassword = (originalPassword) => (value) => {
  return value === originalPassword
}

/**
 * File size validation
 * @param {number} maxSizeInMB - Maximum file size in MB
 * @returns {Function} Validation function
 */
export const fileSize = (maxSizeInMB) => (file) => {
  if (!file) return true
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}

/**
 * File type validation
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {Function} Validation function
 */
export const fileType = (allowedTypes) => (file) => {
  if (!file) return true
  return allowedTypes.includes(file.type)
}

/**
 * Custom validation messages
 */
export const messages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  url: 'Please enter a valid URL',
  numeric: 'Please enter a valid number',
  integer: 'Please enter a valid integer',
  phone: 'Please enter a valid phone number',
  date: 'Please enter a valid date',
  futureDate: 'Date must be in the future',
  pastDate: 'Date must be in the past',
  latitude: 'Please enter a valid latitude (-90 to 90)',
  longitude: 'Please enter a valid longitude (-180 to 180)',
  strongPassword: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
  confirmPassword: 'Passwords do not match',
  minLength: (min) => `Minimum length is ${min} characters`,
  maxLength: (max) => `Maximum length is ${max} characters`,
  minValue: (min) => `Minimum value is ${min}`,
  maxValue: (max) => `Maximum value is ${max}`,
  fileSize: (maxMB) => `File size must be less than ${maxMB}MB`,
  fileType: (types) => `Allowed file types: ${types.join(', ')}`
}

/**
 * Validate multiple fields
 * @param {Object} data - Data object to validate
 * @param {Object} rules - Validation rules object
 * @returns {Object} Validation results
 */
export const validateForm = (data, rules) => {
  const results = {}
  const errors = []
  let isValid = true

  for (const [field, validators] of Object.entries(rules)) {
    const value = data[field]
    
    for (const validator of validators) {
      const result = validator.validate(value)
      
      if (!result.isValid) {
        results[field] = result
        errors.push(result)
        isValid = false
        break // Stop at first error for this field
      }
    }
    
    if (!results[field]) {
      results[field] = { isValid: true, message: '', field }
    }
  }

  return {
    isValid,
    results,
    errors,
    firstError: errors[0] || null
  }
}

/**
 * Common validation rule sets
 */
export const commonRules = {
  // Location search validation
  locationSearch: [
    createValidator('location')
      .addRule(required, messages.required)
      .addRule(minLength(2), messages.minLength(2))
      .addRule(maxLength(100), messages.maxLength(100))
  ],
  
  // Coordinates validation
  coordinates: {
    lat: [
      createValidator('latitude')
        .addRule(required, messages.required)
        .addRule(latitude, messages.latitude)
    ],
    lng: [
      createValidator('longitude')
        .addRule(required, messages.required)
        .addRule(longitude, messages.longitude)
    ]
  },
  
  // User preferences validation
  userPreferences: {
    units: [
      createValidator('units')
        .addRule(required, messages.required)
        .addRule((value) => ['metric', 'imperial'].includes(value), 'Units must be metric or imperial')
    ],
    language: [
      createValidator('language')
        .addRule(required, messages.required)
        .addRule(pattern(/^[a-z]{2}(-[A-Z]{2})?$/), 'Invalid language code format')
    ]
  }
}

export default {
  createValidator,
  required,
  minLength,
  maxLength,
  email,
  url,
  numeric,
  integer,
  minValue,
  maxValue,
  pattern,
  phone,
  date,
  futureDate,
  pastDate,
  latitude,
  longitude,
  strongPassword,
  confirmPassword,
  fileSize,
  fileType,
  messages,
  validateForm,
  commonRules
}