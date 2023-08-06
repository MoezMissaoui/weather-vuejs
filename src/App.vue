<template>
  <component :is="$route.meta.layout || 'DefaultLayout'">
    <router-view />
  </component>
</template>


<script>
    import DefaultLayout from '@/layouts/DefaultLayout.vue'
    export default {
        name: 'App',
        components: {
            DefaultLayout
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
    overflow: hidden;
  }
</style>
