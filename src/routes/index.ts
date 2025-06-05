import { createRouter, createWebHistory } from "vue-router";

const routes = createRouter({
  routes: [
    {
      path: "/",
      component: import("@/pages/ErrorDebug.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("@/pages/404/index.vue"),
    },
  ],
  history: createWebHistory(),
});

export { routes };
