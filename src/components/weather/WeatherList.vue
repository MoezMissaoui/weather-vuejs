<template>
    <div class="bg-light">
      <div class="container py-5">
        <div class="row h-100 align-items-center py-5">
          <div class="col-lg-6">
            <h1 class="display-4">
              {{
                ((weathers?.city?.name) ? (weathers?.city?.name + ' - ') : ' ') + 
                (weathers?.city?.country ?? '')
              }}
            </h1>
            <p class="lead text-muted mb-0">
              Check the state of the climate in your home.
            </p>

          </div>
          <div class="col-lg-6 d-none d-lg-block">
            <Image 
                :src="require('@/assets/undraw/undraw_weather_re_qsmd.svg')" 
                alt="" 
                class="img-fluid"
              />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white">
      <div class="container py-5">
        <div class="row align-items-center">
          <div class="col-md-2" v-for="weather in weathers?.list" v-bind:key="weather">
            <WeatherCard
              :weather="weather"
            />
          </div>
        </div>
      </div>
    </div>
</template>
    
<script>
  import WeatherCard  from "@/components/weather/WeatherCard.vue";
  import Image  from "@/components/standard/Image.vue";

  export default {
    name: 'WeatherList',
    components: {
      WeatherCard,
      Image,
    },
    props:{
      weathers: Object
    },
  }
</script>