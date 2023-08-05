<template>
    <img 
            :class="_class"
            :src="_src"
            :alt="_alt"
            :width="_width"
        >
</template>
  
<script>
    export default {
        name: 'Image',
        props:{
            _class: String,
            _src: String,
            _alt: String,
            _width: Number,
        },
    }
</script>
  