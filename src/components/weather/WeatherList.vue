<template>
  <div class="container mt-4 mb-5">
    <div class="jumbotron shadow-sm bg-info text-white">
      <h1 class="display-4">
        {{ 
          ((weathers?.city?.name) ? (weathers?.city?.name + ' - ') : ' ') + 
          (weathers?.city?.country ?? '') 
        }}
      </h1>      
    </div>     

    <div class="row">
      <div class="col-md-2" v-for="weather in weathers?.list" v-bind:key="weather">
        <WeatherCard
          :weather="weather"
        />
      </div>
    </div>
</div>
</template>
    
<script>
  import WeatherCard  from "./WeatherCard.vue";

  export default {
    name: 'WeatherList',
    components: {
      WeatherCard,
    },
    props:{
      weathers: Object
    },
  }
</script>
    
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>