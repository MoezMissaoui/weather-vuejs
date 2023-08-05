<template>
  <NavBar
    :app_name="app_name"
  />

  <WeatherList
    :weathers="weathers"
  />

  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
</template>

<script>

import NavBar from './components/NavBar.vue'
import WeatherList from './components/weather/WeatherList.vue'
import {get_weather_infos} from './actions/weather' 


export default {
  name: 'App',
  components: {
    NavBar,
    WeatherList,
  },

  mounted() {
      get_weather_infos(20,20).then(
        (res) => {  
          this.weathers = res
          // console.log(this.weathers);
        }
      )
  },
  data () {
    return {
      app_name : process.env.VUE_APP_TITLE ?? 'WEATHER APPLICATION',
      weathers : []
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
