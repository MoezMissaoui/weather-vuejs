<template>
    <div class="container">
        <WeatherList
            v-if="show_list"
            :weathers="weathers"
        />
        <div v-else class="alert alert-danger" role="alert">
          Weather API is Down
        </div>
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

    beforeMount() {
      /**** BEGIN Get geo coding of given city ****/
        get_geocoding(this.region).then(
          (res) => {  

            /**** BEGIN Get weather info ****/
              get_weather_infos(res?.lat,res?.lon).then(
                (weather_infos) => {  
                  this.weathers = weather_infos
                }
              ).catch(
                (error) => {
                  console.error(error);
                  this.show_list = false
                }
              )
            /**** END Get weather info ****/

          }
        ).catch(
          (error) => {
            console.error(error);
            this.show_list = false
          }
        )
      /**** END Get geo coding of given city ****/
    },
    
    data () {
      return {
        weathers : [],
        region : this.$route.params.region || 'Tunis',
        show_list : true,
      }
    }
  }
</script>

<style scoped>
  div.container{
    margin-top: 100px;
  }
</style>