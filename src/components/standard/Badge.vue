<template>
    <span 
        :class="'badge ' + _class">
        {{ text }}
    </span>
</template>
  
<script>
    export default {
        name: 'Badge',
        props:{
            _class: String,
            text: String,
        },
    }
</script>
  