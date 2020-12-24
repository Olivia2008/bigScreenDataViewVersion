import Vue from "vue";
import VueRouter from "vue-router";
import Home from "views/index.vue";
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/screen"
  },
  {
    path: "/screen",
    name: "screen",
    component: Home
  }
];

const router = new VueRouter({
  routes
});

export default router;
