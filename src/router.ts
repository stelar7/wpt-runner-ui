import { createMemoryHistory, createRouter } from "vue-router";

import HomeView from "./views/HomeView.vue";
import RunView from "./views/RunView.vue";

const routes = [
  { name: "HOMEVIEW", path: "/", component: HomeView },
  { name: "RUNVIEW", path: "/wpt/:filepath*", component: RunView, props: true },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
