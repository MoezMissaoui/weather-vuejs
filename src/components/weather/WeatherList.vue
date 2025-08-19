<template>
  <div class="weather-list-container">
    <!-- Error State -->
    <div v-if="error" class="error-state">
      <div class="error-icon">
        <i class="fa fa-exclamation-triangle"></i>
      </div>
      <h3>Weather Service Unavailable</h3>
      <p>We're having trouble connecting to the weather service. Please try again later.</p>
      <button @click="retryFetch" class="btn btn-primary retry-btn">
        <i class="fa fa-refresh"></i> Try Again
      </button>
    </div>

    <!-- Loading State -->
    <div v-else-if="!weathers" class="loading-state fade-in">
      <div class="loading-spinner pulse">
        <i class="fa fa-spinner spin"></i>
      </div>
      <p class="loading-text">
        Loading weather data
        <span class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </p>
      
      <!-- Loading Skeletons -->
      <div class="weather-grid">
        <div v-for="n in 5" :key="n" class="loading-skeleton-card">
          <div class="loading-skeleton skeleton-header"></div>
          <div class="loading-skeleton skeleton-icon"></div>
          <div class="loading-skeleton skeleton-temp"></div>
          <div class="loading-skeleton skeleton-details"></div>
        </div>
      </div>
    </div>

    <!-- Weather Data -->
    <div v-else class="weather-content">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <div class="hero-content">
                <h1 class="hero-title">
                  {{ getLocationTitle() }}
                </h1>
                <p class="hero-subtitle">
                  5-day weather forecast with detailed information
                </p>
                <div class="weather-summary">
                  <div class="current-temp">
                    {{ getCurrentTemp() }}°C
                  </div>
                  <div class="current-desc">
                    {{ getCurrentDescription() }}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-6 d-none d-lg-block">
              <div class="hero-illustration">
                <img 
                  :src="require('@/assets/undraw/undraw_weather_re_qsmd.svg')" 
                  alt="Weather illustration" 
                  class="img-fluid"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Weather Cards Grid -->
      <div class="weather-grid-section">
        <div class="container">
          <div class="section-header">
            <h2>5-Day Forecast</h2>
            <p>Detailed weather information for the upcoming days</p>
          </div>
          
          <div class="weather-grid">
            <div 
              v-for="(weather, index) in weathers?.list" 
              :key="weather.dt"
              class="weather-card-wrapper"
              :style="{ animationDelay: index * 0.1 + 's' }"
            >
              <WeatherCard :weather="weather" :index="index" class="card-enter" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
      
<script>
  import WeatherCard from "@/components/weather/WeatherCard.vue";
  import { get_weather_infos, get_geocoding } from '@/actions/weather';

  export default {
    name: 'WeatherList',
    components: {
      WeatherCard,
    },
    created() {
      this.fetchWeatherData();
    },
    
    data() {
      return {
        weathers: null,
        region: this.$route.params.region || 'Tunis',
        error: null,
        loading: false
      }
    },
    
    methods: {
      async fetchWeatherData() {
        this.loading = true;
        this.error = null;
        
        try {
          // Get geocoding data
          const geoData = await get_geocoding(this.region);
          if (!geoData) {
            throw new Error('Location not found');
          }
          
          // Get weather information
          const weatherData = await get_weather_infos(geoData.lat, geoData.lon);
          this.weathers = weatherData;
        } catch (error) {
          console.error('Weather fetch error:', error);
          this.error = error;
        } finally {
          this.loading = false;
        }
      },
      
      retryFetch() {
        this.fetchWeatherData();
      },
      
      getLocationTitle() {
        const cityName = this.weathers?.city?.name || this.region;
        const country = this.weathers?.city?.country;
        return country ? `${cityName}, ${country}` : cityName;
      },
      
      getCurrentTemp() {
        if (!this.weathers?.list?.[0]?.main?.temp) return '--';
        return Math.round(this.weathers.list[0].main.temp - 273.15);
      },
      
      getCurrentDescription() {
        return this.weathers?.list?.[0]?.weather?.[0]?.description || 'No data available';
      }
    },
    
    watch: {
      '$route.params.region'(newRegion) {
        this.region = newRegion || 'Tunis';
        this.fetchWeatherData();
      }
    }
  }
</script>

<style scoped>
.weather-list-container {
  min-height: 100vh;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: var(--spacing-2xl);
}

.error-icon {
  font-size: 4rem;
  color: #dc3545;
  margin-bottom: var(--spacing-lg);
}

.error-state h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  font-weight: 600;
}

.error-state p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  max-width: 400px;
}

.retry-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 8px;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.retry-btn:hover {
  transform: translateY(-1px);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: var(--spacing-2xl);
}

.loading-spinner {
  margin-bottom: var(--spacing-xl);
  font-size: 2rem;
  color: var(--primary-color);
}

.loading-text {
  font-size: 1.2rem;
  margin-bottom: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Loading Skeleton Cards */
.loading-skeleton-card {
  background: var(--card-bg);
  border-radius: var(--card-radius);
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-skeleton {
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-header {
  height: 24px;
  width: 80px;
  border-radius: 12px;
  align-self: flex-end;
}

.skeleton-icon {
  height: 80px;
  width: 80px;
  border-radius: 50%;
  align-self: center;
  margin: 1rem 0;
}

.skeleton-temp {
  height: 48px;
  width: 120px;
  border-radius: 8px;
  align-self: center;
}

.skeleton-details {
  height: 60px;
  width: 100%;
  border-radius: 8px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  font-weight: 600;
}

.loading-state p {
  color: var(--text-secondary);
  max-width: 400px;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  padding: var(--spacing-2xl) 0;
  margin-top: 80px;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xl);
  opacity: 0.9;
}

.weather-summary {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

.current-temp {
  font-size: 4rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.current-desc {
  font-size: var(--font-size-lg);
  text-transform: capitalize;
  opacity: 0.9;
}

.hero-illustration {
  position: relative;
  z-index: 2;
}

.hero-illustration img {
  filter: brightness(1.1) contrast(1.1);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* Weather Grid Section */
.weather-grid-section {
  padding: var(--spacing-2xl) 0;
  background: var(--bg-secondary);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.section-header h2 {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.section-header p {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

.weather-card-wrapper {
  animation: slideInUp 0.6s ease-out both;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section {
    padding: var(--spacing-xl) 0;
    margin-top: 60px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .current-temp {
    font-size: 3rem;
  }
  
  .weather-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .weather-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .weather-grid-section {
    padding: var(--spacing-xl) 0;
  }
}

@media (max-width: 576px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .current-temp {
    font-size: 2.5rem;
  }
  
  .error-state,
  .loading-state {
    padding: var(--spacing-xl);
  }
}
</style>