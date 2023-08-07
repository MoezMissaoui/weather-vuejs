<template>
  <div v-if="show_list">
    
    <div class="bg-light mt-5">
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

  </div>

  <div v-else class="alert alert-danger" role="alert">
    Weather API is Down
  </div>
</template>
    
<script>
  import WeatherCard  from "@/components/weather/WeatherCard.vue";
  import Image  from "@/components/standard/Image.vue";
  import {get_weather_infos, get_geocoding} from '@/actions/weather' 

  export default {
    name: 'WeatherList',
    components: {
      WeatherCard,
      Image,
    },
    created() {
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
        show_list : true
      }
    }
  }
</script>