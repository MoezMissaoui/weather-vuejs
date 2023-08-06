import { createWebHistory, createRouter } from "vue-router";
import Home from "@/pages/Home.vue";
import About from "@/pages/About.vue";

import MainLayout from "@/layouts/MainLayout.vue";
import PageLayout from "@/layouts/PageLayout.vue";


const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
        layout: MainLayout
    }
  },
  {
    path: "/about",
    name: "About",
    component: About,
    meta: {
      layout: PageLayout
  }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;