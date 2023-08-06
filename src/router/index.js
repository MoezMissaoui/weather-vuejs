import { createWebHistory, createRouter } from "vue-router";
import Home from "@/pages/Home.vue";
import About from "@/pages/About.vue";
import NotFound from "@/pages/NotFound.vue";

// import MainLayout from "@/layouts/MainLayout.vue";
// import PageLayout from "@/layouts/PageLayout.vue";

import {loadLayoutMiddleware} from "@/router/middleware/loadLayoutMiddleware";


const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      layout_name: 'MainLayout'
    }
  },
  {
    path: "/weather/:region",
    name: "HomeRegion",
    component: Home,
    meta: {
      layout_name: 'MainLayout'
    }
  },
  {
    path: "/about",
    name: "About",
    component: About,
    meta: {
      layout_name: 'PageLayout'
    }
  },
  
  // and finally the default route, when none of the above matches:
  { 
    path: "/:pathMatch(.*)*", 
    name: "NotFound",
    component: NotFound 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Before each route changing the loadLayoutMiddleware middleware is executing.
router.beforeEach(loadLayoutMiddleware)

export default router;