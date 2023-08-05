<template>
    <div 
        :class="'jumbotron ' + _class"
    >
            <h1 :class="_class_title">
                {{ title_text }}
            </h1>      
    </div> 
</template>
  
<script>
    export default {
        name: 'Jumbotron',
        props:{
            _class: String,
            _class_title: String,
            title_text: String,
        },
    }
</script>
  