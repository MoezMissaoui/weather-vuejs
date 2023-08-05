import { createApp } from 'vue'
import App from './App.vue'

//add bootstrap css 
import "bootstrap/dist/css/bootstrap.css";

createApp(App).mount('#app')

//add bootstrap js 
import "bootstrap/dist/js/bootstrap.js";




console.log(process.env.VUE_APP_TITLE ?? 'WEATHER APPLICATION');
