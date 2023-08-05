import { createApp } from 'vue'
import App from './App.vue'

import { library } from "@fortawesome/fontawesome-svg-core";
import { 
        faWind
    } from "@fortawesome/free-solid-svg-icons";

library.add(
        faWind
    );

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import router from './router'

//add bootstrap css 
import "bootstrap/dist/css/bootstrap.css";

//add font-awesome css 
import "@/assets/plugins/fontawesome/font-awesome.css";

createApp(App)
    .use(router)
    .component("font-awesome-icon", FontAwesomeIcon)
    .mount('#app')

//add bootstrap js 
import "bootstrap/dist/js/bootstrap.js";