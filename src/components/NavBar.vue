<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
    
    <router-link class="navbar-brand" to="/">
      <Image
          :_src="require('@/assets/logo.avif')"
          :_width="30"
          :_alt="app_name"
      />
    </router-link>

    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
  
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mr-auto float-end">

        <li class="nav-item float-end">
          <router-link class="nav-link" to="/about">About Us</router-link>
        </li>
      </ul>
      <form class="form-inline my-2 my-lg-0">
        <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
        <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
      </form>
    </div>
  </nav>
</template>
  
<script>
  import Image  from "./standard/Image.vue";
  export default {
    name: 'NavBar',
    components: {
        Image
    },
    props:{
      app_name: String
    },
  }
</script>
  
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  nav {
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1;
  }
</style>
  