<template>
  <div v-if="!authChecked" class="min-h-screen bg-strahd-darker flex items-center justify-center">
    <svg class="w-12 h-12 text-strahd-red animate-spin" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
  <AuthGate v-else-if="!isAuthenticated" @authenticated="handleAuthenticated" />
  <div v-else class="min-h-screen bg-strahd-dark text-gray-100">
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
import AuthGate from "./components/Layout/AuthGate.vue";
import { ref, onMounted, onUnmounted } from "vue";
import { useCampaignStore } from "./stores/campaignStore";

const campaignStore = useCampaignStore();
const isAuthenticated = ref(false);
const authChecked = ref(false);

async function checkExistingToken() {
  const token = localStorage.getItem("app-token");
  if (!token) {
    authChecked.value = true;
    return;
  }

  try {
    const baseURL = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api$/, "")
      : "";
    const res = await fetch(`${baseURL}/api/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (res.ok) {
      isAuthenticated.value = true;
      campaignStore.fetchCampaigns();
    } else {
      localStorage.removeItem("app-token");
    }
  } catch {
    // Network error — let them try anyway with stored token
    isAuthenticated.value = true;
    campaignStore.fetchCampaigns();
  }
  authChecked.value = true;
}

function handleAuthenticated() {
  isAuthenticated.value = true;
  campaignStore.fetchCampaigns();
}

function handleAuthExpired() {
  isAuthenticated.value = false;
}

onMounted(() => {
  window.addEventListener("auth-expired", handleAuthExpired);
  checkExistingToken();
});

onUnmounted(() => {
  window.removeEventListener("auth-expired", handleAuthExpired);
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
