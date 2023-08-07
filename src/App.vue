<template>
  <component :is="this.$route.meta.layoutComponent">
    <router-view />
  </component>
</template>


<script>
    export default {
        name: 'App',

        // beforeCreate(){
        //   alert('beforeCreate')
        // },

        // created(){
        //   alert('created')
        // },

        // beforeMount(){
        //   alert('beforeMount')
        // },

        // mounted(){
        //   alert('mounted')
        // },

        // beforeUpdate(){
        //   alert('beforeUpdate')
        // },

        // updated(){
        //   alert('updated')
        // },

        // beforeUnmount(){
        //   alert('beforeUnmount')
        // },

        // unmounted(){
        //   alert('unmounted')
        // },

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
