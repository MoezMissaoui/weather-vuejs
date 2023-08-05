<template>
    <div class="card mt-4 shadow-sm">
        <div class="card-body">

            <h6 class="card-title">
                <small>
                    <Badge
                        :_class="'badge-pill badge-info'"
                        :text="get_date(weather?.dt)"
                    />
                </small>
            </h6>

            <hr/>

            <Image
                :_class="'card-img-top'"
                :_src="'https://openweathermap.org/img/wn/' + weather?.weather[0]?.icon + '@2x.png'"
                :_alt="weather?.weather[0]?.description"
            />

            <hr/>

            <p class="card-text"> 
                <small>
                    <font-awesome-icon icon="temperature-half" />
                    {{ kelvin_to_celsius(weather?.main?.temp) }}
                </small>
                <br>
                <small>
                    <font-awesome-icon icon="wind" />
                    {{ weather?.wind?.speed }}
                </small>
            </p>
            
        </div>
    </div>
</template>
  
<script>

    import { month_names } from "@/config";
    import Image  from "../standard/Image.vue";
    import Badge  from "../standard/Badge.vue";

    export default {
        name: 'WeatherCard',
        components: {
            Image,
            Badge,
        },
        props:{
            weather: Object
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
            }
        }
    }
</script>
  
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
  