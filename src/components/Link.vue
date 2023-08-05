<template>
    <a 
        :href="_href" 
        :class="'btn ' + _class"
    >
        {{ text }}
    </a>
</template>
  
<script>
    export default {
        name: 'Link',
        props:{
            _class: String,
            _href: String,
            text: String,
        },
    }
</script>
  