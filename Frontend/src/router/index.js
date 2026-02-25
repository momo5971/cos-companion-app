import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/quests",
  },
  {
    path: "/quests",
    name: "Quests",
    component: () => import("../views/QuestsView.vue"),
  },
  {
    path: "/quests/:id",
    name: "QuestDetail",
    component: () => import("../views/QuestDetailView.vue"),
  },
  {
    path: "/locations",
    name: "Locations",
    component: () => import("../views/LocationsView.vue"),
  },
  {
    path: "/locations/:id",
    name: "LocationDetail",
    component: () => import("../views/LocationDetailView.vue"),
  },
  {
    path: "/compendium",
    name: "Compendium",
    component: () => import("../views/CompendiumView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
