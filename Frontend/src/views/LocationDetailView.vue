<script setup>
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLocationStore } from "../stores/locationStore";
import LocationMap from "../components/LocationMap/LocationMap.vue";

const route = useRoute();
const router = useRouter();
const locationStore = useLocationStore();

const locationId = computed(() => route.params.id);

const currentLocation = computed(() => {
  return locationStore.locations.find((loc) => loc._id === locationId.value);
});

onMounted(async () => {
  if (locationStore.locations.length === 0) {
    await locationStore.fetchLocations();
  }
});

function goBack() {
  router.push("/locations");
}
</script>

<template>
  <div class="location-detail-view animate-fade-in">
    <!-- Loading state -->
    <div v-if="locationStore.loading" class="loading-container">
      <svg class="w-12 h-12 text-strahd-red animate-spin mb-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-xl text-strahd-gold">Loading location...</p>
    </div>

    <!-- Location not found -->
    <div v-else-if="!currentLocation" class="error-container">
      <svg class="w-20 h-20 text-strahd-red/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
      <p class="text-xl text-red-400">Location not found</p>
      <button @click="goBack" class="btn-secondary mt-4">
        Back to Locations
      </button>
    </div>

    <!-- Location content -->
    <template v-else>
      <!-- Header -->
      <div class="location-header">
        <button @click="goBack" class="back-button">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span>Back to Locations</span>
        </button>

        <div class="location-info">
          <h1 class="location-title text-glow-red">{{ currentLocation.name }}</h1>
          <span class="location-type">{{ currentLocation.type }}</span>
        </div>

        <p class="location-description">{{ currentLocation.description }}</p>
        
        <div class="decorative-divider"></div>
      </div>

      <!-- Map -->
      <div class="map-section">
        <LocationMap :location-id="locationId" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.location-detail-view {
  @apply p-6 max-w-7xl mx-auto;
}

.loading-container,
.error-container {
  @apply flex flex-col items-center justify-center py-20;
}

.location-header {
  @apply mb-8;
}

.back-button {
  @apply flex items-center gap-2 px-4 py-2 mb-6;
  @apply bg-strahd-dark border-2 border-strahd-red/30 rounded-lg;
  @apply text-strahd-gold font-semibold transition-all duration-200;
}

.back-button:hover {
  @apply border-strahd-gold bg-strahd-darker shadow-glow-gold;
  transform: translateX(-4px);
}

.location-info {
  @apply flex items-center gap-4 mb-4 flex-wrap;
}

.location-title {
  @apply text-4xl font-bold text-strahd-red;
  font-family: 'Cinzel', serif;
}

.location-type {
  @apply px-4 py-2 bg-strahd-burgundy border-2 border-strahd-red rounded-full;
  @apply text-strahd-gold font-bold text-sm uppercase tracking-wider shadow-lg;
}

.location-description {
  @apply text-gray-300 text-lg leading-relaxed mb-6;
}

.decorative-divider {
  @apply w-full h-0.5 bg-gradient-to-r from-strahd-red via-strahd-gold to-transparent;
}

.map-section {
  @apply bg-gradient-to-br from-strahd-dark to-strahd-darker;
  @apply border-2 border-strahd-red/30 rounded-xl p-6 shadow-glow-red;
}
</style>
