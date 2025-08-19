import { defineStore } from 'pinia'

/**
 * Theme Store - Manages application theme state and preferences
 * 
 * This store handles:
 * - Dark/light theme switching
 * - System theme preference detection
 * - Theme persistence in localStorage
 * - Automatic theme application to DOM
 * - System theme change listening
 * 
 * @example
 * ```js
 * import { useThemeStore } from '@/stores/theme'
 * 
 * const themeStore = useThemeStore()
 * themeStore.initializeTheme()
 * themeStore.toggleTheme()
 * ```
 */
export const useThemeStore = defineStore('theme', {
  state: () => ({
    /** @type {boolean} Current theme state - true for dark, false for light */
    isDarkTheme: false,
    /** @type {string} System's preferred theme ('dark' or 'light') */
    systemPreference: 'light'
  }),

  getters: {
    /**
     * Get current theme as string
     * @param {Object} state - Store state
     * @returns {string} 'dark' or 'light'
     */
    currentTheme: (state) => state.isDarkTheme ? 'dark' : 'light',
    
    /**
     * Get appropriate icon class for theme toggle button
     * @param {Object} state - Store state
     * @returns {string} FontAwesome icon class
     */
    themeIcon: (state) => state.isDarkTheme ? 'fas fa-sun' : 'fas fa-moon',
    
    /**
     * Get label for theme toggle button
     * @param {Object} state - Store state
     * @returns {string} Human-readable theme toggle label
     */
    themeLabel: (state) => state.isDarkTheme ? 'Light Mode' : 'Dark Mode'
  },

  actions: {
    /**
     * Initialize theme on application startup
     * 
     * This method:
     * - Checks for saved theme preference in localStorage
     * - Falls back to system preference if no saved preference
     * - Applies the determined theme to the DOM
     * - Sets up system theme change listener
     * 
     * @example
     * ```js
     * // Call this in your main.js or App.vue
     * themeStore.initializeTheme()
     * ```
     */
    initializeTheme() {
      // Check for saved theme preference or default to system preference
      const savedTheme = localStorage.getItem('theme')
      
      if (savedTheme) {
        this.isDarkTheme = savedTheme === 'dark'
      } else {
        // Check system preference
        this.systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        this.isDarkTheme = this.systemPreference === 'dark'
      }
      
      this.applyTheme()
      this.setupSystemThemeListener()
    },

    /**
     * Toggle between dark and light themes
     * 
     * Switches the current theme, saves the preference to localStorage,
     * and applies the new theme to the DOM.
     * 
     * @example
     * ```js
     * themeStore.toggleTheme()
     * ```
     */
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme
      this.saveThemePreference()
      this.applyTheme()
    },

    /**
     * Set a specific theme
     * 
     * @param {string} theme - Theme to set ('dark' or 'light')
     * 
     * @example
     * ```js
     * themeStore.setTheme('dark')
     * themeStore.setTheme('light')
     * ```
     */
    setTheme(theme) {
      this.isDarkTheme = theme === 'dark'
      this.saveThemePreference()
      this.applyTheme()
    },

    /**
     * Apply the current theme to the DOM
     * 
     * Updates the document root's data-theme attribute and body classes
     * to reflect the current theme state. This triggers CSS theme changes.
     * 
     * @private
     */
    applyTheme() {
      const root = document.documentElement
      
      if (this.isDarkTheme) {
        root.setAttribute('data-theme', 'dark')
        document.body.classList.add('dark-theme')
        document.body.classList.remove('light-theme')
      } else {
        root.setAttribute('data-theme', 'light')
        document.body.classList.add('light-theme')
        document.body.classList.remove('dark-theme')
      }
    },

    /**
     * Save current theme preference to localStorage
     * 
     * Persists the user's theme choice so it can be restored
     * on subsequent visits.
     * 
     * @private
     */
    saveThemePreference() {
      localStorage.setItem('theme', this.currentTheme)
    },

    /**
     * Set up listener for system theme changes
     * 
     * Listens for changes to the system's color scheme preference
     * and updates the theme accordingly, but only if the user hasn't
     * manually set a theme preference.
     * 
     * @private
     */
    setupSystemThemeListener() {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      mediaQuery.addEventListener('change', (e) => {
        // Only update if user hasn't set a manual preference
        const savedTheme = localStorage.getItem('theme')
        if (!savedTheme) {
          this.isDarkTheme = e.matches
          this.applyTheme()
        }
      })
    },

    /**
     * Reset theme to system preference
     * 
     * Removes the saved theme preference and reverts to using
     * the system's color scheme preference.
     * 
     * @example
     * ```js
     * themeStore.resetToSystemPreference()
     * ```
     */
    resetToSystemPreference() {
      localStorage.removeItem('theme')
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      this.isDarkTheme = systemDark
      this.applyTheme()
    }
  }
})