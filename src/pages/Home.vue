<template>
    <div class="container mt-5">
        <WeatherList
            :weathers="weathers"
        />
    </div>
</template>

<script>
  import WeatherList from '@/components/weather/WeatherList.vue'
  import {get_weather_infos, get_geocoding} from '@/actions/weather' 
  export default {
    name: 'Home',
    components: {
      WeatherList,
    },

    mounted() {
      /**** BEGIN Get geo coding of given city ****/
        get_geocoding(this.$route.params.region || 'Tunis').then(
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
        weathers : [],
      }
    }
  }
</script>