<template>
    <h1> Weather list </h1>


    <div class="row">

      <div class="col-md-3" v-for="weather in weathers?.list" v-bind:key="weather">

        <WeatherCard
          :weather="weather"
        />

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
    