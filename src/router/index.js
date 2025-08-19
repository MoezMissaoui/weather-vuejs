import { createWebHistory, createRouter } from "vue-router";
// import Home from "@/pages/Home.vue";
// import About from "@/pages/About.vue";
import NotFound from "@/pages/NotFound.vue";

// import MainLayout from "@/layouts/MainLayout.vue";
// import PageLayout from "@/layouts/PageLayout.vue";

import {loadLayoutMiddleware} from "@/router/middleware/loadLayoutMiddleware";


const routes = [
  {
    path: "/",
    name: "Home",
    // component: Home, // Eager Loading  
    component: () => import('@/pages/Home.vue'), // Lazy Loading
    meta: {
      layout_name: 'MainLayout'
    }
  },
  {
    path: "/weather/:region",
    name: "HomeByRegion",
    // component: Home, // Eager Loading
    component: () => import('@/pages/Home.vue'), // Lazy Loading
    meta: {
      layout_name: 'MainLayout'
    },
    props: (route) => {
      const region= Number.parseInt(route.params.region, 10)
      if (Number.isNaN(region)) {
        return 0
      }
      return { region }
    }
  },
  {
    path: "/about",
    name: "About",
    // component: About, // Eager Loading
    component: () => import('@/pages/About.vue'), // Lazy Loading
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

router.beforeEach(async (to , from) => {
  console.log('Hello from BeforeRoute from:'+ from.name + ', To:'+ to.name );
})

export default router;