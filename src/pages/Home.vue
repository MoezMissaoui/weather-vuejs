<template>
    <div class="container">
        <WeatherList
        />
    </div>
</template>

<script>
  import WeatherList from '@/components/weather/WeatherList.vue'

  export default {
    name: 'Home',
    components: {
      WeatherList,
    },
  }
</script>

<style scoped>
  div.container{
    margin-top: 100px;
  }
</style>