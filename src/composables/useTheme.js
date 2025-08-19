import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

/**
 * Theme Composable - Provides reactive theme management and utility functions
 * 
 * This composable offers:
 * - Reactive access to theme store state
 * - Theme color and styling utilities
 * - System preference detection
 * - Theme transition helpers
 * - Direct access to store actions
 * 
 * @returns {Object} Theme composable interface
 * @returns {ComputedRef<boolean>} returns.isDarkTheme - Whether dark theme is active
 * @returns {ComputedRef<string>} returns.currentTheme - Current theme ('dark' or 'light')
 * @returns {ComputedRef<string>} returns.themeIcon - FontAwesome icon for theme toggle
 * @returns {ComputedRef<string>} returns.themeLabel - Label for theme toggle button
 * @returns {ComputedRef<string>} returns.systemPreference - System's preferred theme
 * @returns {Function} returns.getThemeColors - Get theme-specific color palette
 * @returns {Function} returns.getThemeClass - Get CSS class with theme suffix
 * @returns {Function} returns.getContrastColor - Calculate contrast color
 * @returns {Function} returns.isSystemDarkMode - Check system dark mode preference
 * @returns {Function} returns.getThemeTransition - Get CSS transition for theme changes
 * @returns {Function} returns.initializeTheme - Initialize theme on app startup
 * @returns {Function} returns.toggleTheme - Toggle between themes
 * @returns {Function} returns.setTheme - Set specific theme
 * @returns {Function} returns.resetToSystemPreference - Reset to system preference
 * 
 * @example
 * ```js
 * import { useTheme } from '@/composables/useTheme'
 * 
 * export default {
 *   setup() {
 *     const {
 *       isDarkTheme,
 *       currentTheme,
 *       toggleTheme,
 *       getThemeColors,
 *       initializeTheme
 *     } = useTheme()
 * 
 *     // Initialize theme on component mount
 *     onMounted(() => {
 *       initializeTheme()
 *     })
 * 
 *     // Get current theme colors
 *     const colors = getThemeColors()
 * 
 *     return {
 *       isDarkTheme,
 *       currentTheme,
 *       toggleTheme,
 *       colors
 *     }
 *   }
 * }
 * ```
 */
export function useTheme() {
  const themeStore = useThemeStore()

  // Reactive computed properties
  const isDarkTheme = computed(() => themeStore.isDarkTheme)
  const currentTheme = computed(() => themeStore.currentTheme)
  const themeIcon = computed(() => themeStore.themeIcon)
  const themeLabel = computed(() => themeStore.themeLabel)
  const systemPreference = computed(() => themeStore.systemPreference)

  // Theme utility functions
  /**
   * Get theme-specific color palette
   * @returns {Object} Color palette object with theme-appropriate colors
   * @returns {string} returns.primary - Primary color
   * @returns {string} returns.secondary - Secondary color
   * @returns {string} returns.background - Background color
   * @returns {string} returns.surface - Surface color
   * @returns {string} returns.text - Primary text color
   * @returns {string} returns.textSecondary - Secondary text color
   * @example
   * ```js
   * const colors = getThemeColors()
   * console.log(colors.primary) // '#3b82f6' (dark) or '#2563eb' (light)
   * ```
   */
  const getThemeColors = () => {
    return {
      primary: isDarkTheme.value ? '#3b82f6' : '#2563eb',
      secondary: isDarkTheme.value ? '#64748b' : '#475569',
      background: isDarkTheme.value ? '#0f172a' : '#ffffff',
      surface: isDarkTheme.value ? '#1e293b' : '#f8fafc',
      text: isDarkTheme.value ? '#f1f5f9' : '#0f172a',
      textSecondary: isDarkTheme.value ? '#cbd5e1' : '#64748b'
    }
  }

  /**
   * Get CSS class with theme suffix
   * @param {string} baseClass - Base CSS class name
   * @returns {string} Class name with theme suffix
   * @example
   * ```js
   * const className = getThemeClass('card') // 'card dark' or 'card light'
   * ```
   */
  const getThemeClass = (baseClass) => {
    return `${baseClass} ${isDarkTheme.value ? 'dark' : 'light'}`
  }

  /**
   * Calculate appropriate contrast color for given background
   * @param {string} backgroundColor - Hex color code (e.g., '#ffffff')
   * @returns {string} Contrast color ('#000000' or '#ffffff')
   * @example
   * ```js
   * const contrast = getContrastColor('#ffffff') // '#000000'
   * const contrast = getContrastColor('#000000') // '#ffffff'
   * ```
   */
  const getContrastColor = (backgroundColor) => {
    // Simple contrast calculation
    const hex = backgroundColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  }

  /**
   * Check if system prefers dark mode
   * @returns {boolean} True if system prefers dark mode
   * @example
   * ```js
   * const systemDark = isSystemDarkMode() // true or false
   * ```
   */
  const isSystemDarkMode = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  /**
   * Get CSS transition string for smooth theme changes
   * @returns {string} CSS transition property value
   * @example
   * ```js
   * const transition = getThemeTransition() // 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
   * // Use in CSS: transition: ${getThemeTransition()}
   * ```
   */
  const getThemeTransition = () => {
    return 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }

  // Store actions
  const initializeTheme = themeStore.initializeTheme
  const toggleTheme = themeStore.toggleTheme
  const setTheme = themeStore.setTheme
  const resetToSystemPreference = themeStore.resetToSystemPreference

  return {
    // Reactive data
    isDarkTheme,
    currentTheme,
    themeIcon,
    themeLabel,
    systemPreference,
    
    // Utility functions
    getThemeColors,
    getThemeClass,
    getContrastColor,
    isSystemDarkMode,
    getThemeTransition,
    
    // Store actions
    initializeTheme,
    toggleTheme,
    setTheme,
    resetToSystemPreference
  }
}