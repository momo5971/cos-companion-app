<template>
  <div class="min-h-screen bg-strahd-dark text-gray-100">
    <AppHeader />
    <AppNavigation />
    <main class="container mx-auto px-4 py-8">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import AppHeader from "./components/Layout/AppHeader.vue";
import AppNavigation from "./components/Layout/AppNavigation.vue";
import { onMounted } from "vue";
import { useCampaignStore } from "./stores/campaignStore";

const campaignStore = useCampaignStore();

onMounted(() => {
  // Initialize campaign store
  campaignStore.fetchCampaigns();
});
</script>

<style scoped>
/* Page transition animations */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
