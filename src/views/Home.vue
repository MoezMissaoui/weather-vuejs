<template>
    <NavBar
        :app_name="app_name"
    />
    <div class="container mt-5">
        <WeatherList
            :weathers="weathers"
        />
    </div>

    <Footer />
</template>

<script>
  import NavBar from '@/components/NavBar.vue'
  import WeatherList from '@/components/weather/WeatherList.vue'
  import {get_weather_infos, get_geocoding} from '@/actions/weather' 
  import Footer  from "@/components/Footer.vue";

  export default {
    name: 'Home',
    components: {
      NavBar,
      WeatherList,
      Footer,
    },

    mounted() {
      /**** BEGIN Get geo coding of given city ****/
        get_geocoding('Tunis').then(
          (res) => {  

            /**** BEGIN Get weather info ****/
              get_weather_infos(res?.lat,res?.lon).then(
                (res_infos) => {  
                  this.weathers = res_infos
                }
              ).catch(
                (error) => {
                  console.error(error);
                }
              )
            /**** END Get weather info ****/

          }
        ).catch(
          (error) => {
            console.error(error);
          }
        )
      /**** END Get geo coding of given city ****/
    },
    data () {
      return {
        app_name : process.env.VUE_APP_TITLE ?? 'WEATHER APPLICATION',
        weathers : [],
      }
    }
  }
</script>