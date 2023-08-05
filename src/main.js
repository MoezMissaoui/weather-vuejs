import { createApp } from 'vue'
import App from './App.vue'

import { library } from "@fortawesome/fontawesome-svg-core";
import { faTemperatureHalf , faWind } from "@fortawesome/free-solid-svg-icons";

library.add(faTemperatureHalf, faWind);

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

//add bootstrap css 
import "bootstrap/dist/css/bootstrap.css";

createApp(App)
    .component("font-awesome-icon", FontAwesomeIcon)
    .mount('#app')

//add bootstrap js 
import "bootstrap/dist/js/bootstrap.js";