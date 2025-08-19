<template>
  <nav class="modern-navbar">
    <div class="navbar-container">
      <!-- Brand -->
      <router-link to="/" class="navbar-brand">
        <img 
          :src="require('@/assets/logo.avif')"
          :alt="app_name"
          class="brand-logo"
        />
        <span class="brand-text">{{ app_name }}</span>
      </router-link>

      <!-- Desktop Navigation -->
      <div class="navbar-nav desktop-nav">
        <router-link to="/" class="nav-link" exact-active-class="active">
          <i class="fa fa-home"></i>
          <span>Home</span>
        </router-link>
        <router-link to="/about" class="nav-link" active-class="active">
          <i class="fa fa-info-circle"></i>
          <span>About</span>
        </router-link>
      </div>

      <!-- Search Bar -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <i class="fa fa-search search-icon"></i>
          <input 
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text" 
            class="search-input" 
            placeholder="Search city..."
            :disabled="isSearching"
          />
          <button 
            v-if="searchQuery"
            @click="clearSearch"
            class="clear-search-btn"
            type="button"
          >
            <i class="fa fa-times"></i>
          </button>
        </div>
        <button 
          @click="handleSearch"
          class="search-btn"
          :disabled="!searchQuery || isSearching"
          type="button"
        >
          <i class="fa fa-search" v-if="!isSearching"></i>
          <i class="fa fa-spinner fa-spin" v-else></i>
        </button>
      </div>

      <!-- Theme Toggle -->
      <button @click="toggleTheme" class="theme-toggle-btn" title="Toggle theme">
        <i class="fa fa-moon" v-if="!isDarkTheme"></i>
        <i class="fa fa-sun" v-else></i>
      </button>

      <!-- Mobile Menu Toggle -->
      <button 
        @click="toggleMobileMenu"
        class="mobile-menu-toggle"
        :class="{ active: isMobileMenuOpen }"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- Mobile Navigation -->
    <div class="mobile-nav" :class="{ open: isMobileMenuOpen }">
      <router-link 
        to="/" 
        class="mobile-nav-link" 
        exact-active-class="active"
        @click="closeMobileMenu"
      >
        <i class="fa fa-home"></i>
        <span>Home</span>
      </router-link>
      <router-link 
        to="/about" 
        class="mobile-nav-link" 
        active-class="active"
        @click="closeMobileMenu"
      >
        <i class="fa fa-info-circle"></i>
        <span>About</span>
      </router-link>
    </div>
  </nav>
</template>
  
<script>
export default {
  name: 'NavBar',
  props: {
    app_name: String
  },
  data() {
    return {
      searchQuery: '',
      isSearching: false,
      isMobileMenuOpen: false,
      isDarkTheme: false
    }
  },
  mounted() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('weather-app-theme')
    if (savedTheme) {
      this.isDarkTheme = savedTheme === 'dark'
      this.applyTheme()
    }
  },
  methods: {
    async handleSearch() {
      if (!this.searchQuery.trim() || this.isSearching) return
      
      this.isSearching = true
      try {
        // Navigate to home with the search query
        await this.$router.push({ 
          name: 'HomeByRegion', 
          params: { region: this.searchQuery.trim() } 
        })
        this.closeMobileMenu()
      } catch (error) {
        console.error('Search navigation error:', error)
      } finally {
        this.isSearching = false
      }
    },
    clearSearch() {
      this.searchQuery = ''
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false
    },
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme
      this.applyTheme()
      localStorage.setItem('weather-app-theme', this.isDarkTheme ? 'dark' : 'light')
    },
    applyTheme() {
      const root = document.documentElement
      if (this.isDarkTheme) {
        root.classList.add('dark-theme')
      } else {
        root.classList.remove('dark-theme')
      }
    }
  }
}
</script>
  
<style scoped>
.modern-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--bg-primary);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  transition: all var(--transition-duration);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

/* Brand */
.navbar-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1.25rem;
  transition: all var(--transition-duration);
}

.navbar-brand:hover {
  color: var(--primary-color);
  text-decoration: none;
}

.brand-logo {
  width: 40px;
  height: 40px;
  margin-right: 0.75rem;
  border-radius: 8px;
  object-fit: cover;
}

.brand-text {
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Desktop Navigation */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  border-radius: 8px;
  transition: all var(--transition-duration);
  position: relative;
}

.nav-link:hover {
  color: var(--primary-color);
  background: var(--bg-secondary);
  text-decoration: none;
  transform: translateY(-1px);
}

.nav-link.active {
  color: var(--primary-color);
  background: var(--bg-secondary);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: var(--primary-color);
  border-radius: 1px;
}

/* Search Container */
.search-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  max-width: 400px;
  margin: 0 2rem;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-secondary);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid var(--border-color);
  border-radius: 25px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all var(--transition-duration);
  outline: none;
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.clear-search-btn {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all var(--transition-duration);
}

.clear-search-btn:hover {
  color: var(--text-primary);
  background: var(--bg-primary);
}

.search-btn {
  padding: 0.75rem 1.25rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all var(--transition-duration);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
}

.search-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Theme Toggle */
.theme-toggle-btn {
  padding: 0.75rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-duration);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
}

.theme-toggle-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: rotate(180deg);
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.mobile-menu-toggle span {
  width: 100%;
  height: 3px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: all var(--transition-duration);
  transform-origin: center;
}

.mobile-menu-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Mobile Navigation */
.mobile-nav {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-100%);
  opacity: 0;
  transition: all var(--transition-duration);
}

.mobile-nav.open {
  transform: translateY(0);
  opacity: 1;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  border-bottom: 1px solid var(--border-color);
  transition: all var(--transition-duration);
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  color: var(--primary-color);
  background: var(--bg-secondary);
  text-decoration: none;
}

.mobile-nav-link:last-child {
  border-bottom: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: flex;
  }
  
  .mobile-nav {
    display: block;
  }
  
  .search-container {
    margin: 0 1rem;
    max-width: 200px;
  }
  
  .search-input {
    font-size: 0.8rem;
    padding: 0.6rem 0.8rem 0.6rem 2rem;
  }
  
  .search-btn {
    padding: 0.6rem 1rem;
    min-width: 40px;
  }
  
  .theme-toggle-btn {
    width: 40px;
    height: 40px;
    padding: 0.6rem;
  }
}

@media (max-width: 480px) {
  .navbar-container {
    padding: 0 0.75rem;
  }
  
  .brand-text {
    display: none;
  }
  
  .search-container {
    margin: 0 0.5rem;
    max-width: 150px;
  }
}
</style>
  