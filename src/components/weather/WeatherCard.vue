<template>

    <div class="card" style="width: 18rem;">
        <img class="card-img-top" src="https://icon-library.com/images/google-weather-icon/google-weather-icon-20.jpg" alt="Card image cap">
        <div class="card-body">
            <h5 class="card-title">{{ get_date(weather?.dt) }}</h5>
            <p class="card-text"> Temperature = {{ kelvin_to_celsius(weather?.main?.temp) }}  </p>
            <!-- <a href="#" class="btn btn-primary">Go somewhere</a> -->
        </div>
    </div>
  
</template>
  
<script>
  export default {
    name: 'WeatherCard',
    props:{
      weather: Object
    },
    methods:{
        get_date(unixTimestamp ){
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            const milliseconds = unixTimestamp * 1000 
            var date = new Date(milliseconds)
            return date.getDate()+
                " / "+monthNames[date.getMonth()]+
                " / "+date.getFullYear()+
                " "+date.getHours()+
                ":"+( (date.getMinutes().toString().length < 2) ? '0'+date.getMinutes() : date.getMinutes())
        },
        kelvin_to_celsius(kelvin){
            return Math.ceil(kelvin - 273) 
        }
    }
  }
</script>
  
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
  