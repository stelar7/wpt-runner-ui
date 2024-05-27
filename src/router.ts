import { createWebHistory, createRouter } from "vue-router";
import { useStore } from "vuex";

import HomeView from "./views/HomeView.vue";
import RunView from "./views/RunView.vue";
import GraphView from "./views/GraphView.vue";

const waitForCheck = async (check) => {
  while (!check()) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
};

const beforeEnter = async (to, from) => {
  const store = useStore();
  if (!store.state.data["latest.json"]) {
    store.dispatch("setRedirectUrl", to);
    router.push({ name: "HOMEVIEW" });
  }
};

const routes = [
  { name: "HOMEVIEW", path: "/", component: HomeView },
  {
    name: "RUNVIEW",
    path: "/wpt/:filepath*",
    component: RunView,
    props: true,
    beforeEnter,
  },
  {
    name: "GRAPHVIEW",
    path: "/graph/:filepath*",
    component: GraphView,
    props: true,
    beforeEnter,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
