<template>
    <div class="weather-card fade-in hover-lift" :class="`stagger-${index + 1}`">
        <div class="weather-card-header">
            <div class="date-badge scale-in">
                {{ get_date(weather?.dt) }}
            </div>
        </div>
        
        <div class="weather-card-body">
            <div class="weather-icon-container">
                <img 
                    :src="'https://openweathermap.org/img/wn/' + weather?.weather[0]?.icon + '@2x.png'"
                    :alt="weather?.weather[0]?.description"
                    class="weather-icon hover-scale"
                    :class="getWeatherIconClass(weather?.weather[0]?.main)"
                />
                <div class="weather-description slide-in-left">
                    {{ weather?.weather[0]?.description }}
                </div>
            </div>
            
            <div class="temperature-main bounce">
                {{ kelvin_to_celsius(weather?.main?.temp) }}°C
            </div>
            
            <div class="weather-details">
                <div class="detail-item slide-in-right stagger-1">
                    <i class="fa fa-thermometer-half detail-icon"></i>
                    <span class="detail-label">Feels like</span>
                    <span class="detail-value">{{ kelvin_to_celsius(weather?.main?.feels_like) }}°C</span>
                </div>
                
                <div class="detail-item slide-in-right stagger-2">
                    <font-awesome-icon icon="wind" class="detail-icon" />
                    <span class="detail-label">Wind</span>
                    <span class="detail-value">{{ weather?.wind?.speed }} m/s</span>
                </div>
                
                <div class="detail-item slide-in-right stagger-3">
                    <i class="fa fa-tint detail-icon"></i>
                    <span class="detail-label">Humidity</span>
                    <span class="detail-value">{{ weather?.main?.humidity }}%</span>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script>

    import { month_names } from "@/config";

    export default {
        name: 'WeatherCard',
        props:{
            weather: Object,
            index: {
                type: Number,
                default: 0
            }
        },
        methods:{
            get_date(unixTimestamp){
                if(!unixTimestamp)
                    return '';
                const milliseconds = unixTimestamp * 1000 
                var date = new Date(milliseconds)
                return date.getDate()+
                    " "+month_names[date.getMonth()]+
                    " "+date.getFullYear()+
                    " "+date.getHours()+
                    ":"+( (date.getMinutes().toString().length < 2) ? '0'+date.getMinutes() : date.getMinutes())
            },
            kelvin_to_celsius(kelvin){
                if(!kelvin)
                    return '';
                return Math.ceil(kelvin - 273) 
            },
            getWeatherIconClass(weatherMain) {
                const weatherType = weatherMain?.toLowerCase();
                switch (weatherType) {
                    case 'clear':
                        return 'sunny';
                    case 'rain':
                    case 'drizzle':
                        return 'rainy';
                    case 'snow':
                        return 'snowy';
                    case 'thunderstorm':
                        return 'stormy';
                    default:
                        return '';
                }
            }
        }
    }
</script>
  
<style scoped>
.weather-card {
  background: var(--card-bg);
  border-radius: var(--card-border-radius);
  box-shadow: var(--card-shadow);
  transition: all var(--transition-normal);
  overflow: hidden;
  margin-bottom: var(--spacing-lg);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.weather-card:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-4px);
}

.weather-card-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: center;
}

.date-badge {
  color: white;
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.weather-card-body {
  padding: var(--spacing-lg);
  text-align: center;
}

.weather-icon-container {
  margin-bottom: var(--spacing-md);
}

.weather-icon {
  width: 80px;
  height: 80px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: transform var(--transition-fast);
}

.weather-card:hover .weather-icon {
  transform: scale(1.1);
}

.weather-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-transform: capitalize;
  margin-top: var(--spacing-xs);
  font-weight: 500;
}

.temperature-main {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: var(--spacing-lg);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.weather-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-tertiary);
  border-radius: 8px;
  transition: background-color var(--transition-fast);
}

.detail-item:hover {
  background: var(--bg-secondary);
}

.detail-icon {
  color: var(--primary-color);
  width: 16px;
  margin-right: var(--spacing-sm);
}

.detail-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
  flex: 1;
  text-align: left;
}

.detail-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: 600;
}

/* Responsive design */
@media (max-width: 768px) {
  .weather-card {
    margin-bottom: var(--spacing-md);
  }
  
  .weather-card-body {
    padding: var(--spacing-md);
  }
  
  .weather-icon {
    width: 60px;
    height: 60px;
  }
  
  .temperature-main {
    font-size: var(--font-size-2xl);
  }
}
</style>
  