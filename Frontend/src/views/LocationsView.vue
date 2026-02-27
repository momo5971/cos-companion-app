<script setup>
import { onMounted, watch, ref } from "vue";
import { useRouter } from "vue-router";
import { useLocationStore } from "../stores/locationStore";
import { useCampaignStore } from "../stores/campaignStore";
import CreateLocationModal from "../components/LocationMap/CreateLocationModal.vue";

const router = useRouter();
const locationStore = useLocationStore();
const campaignStore = useCampaignStore();

const isCreateModalOpen = ref(false);

onMounted(async () => {
  const campaignId = campaignStore.activeCampaign?._id;
  if (campaignId) {
    await locationStore.fetchLocations(campaignId);
  } else {
    locationStore.$patch({ locations: [] });
  }
});

watch(
  () => campaignStore.activeCampaign,
  async (newCampaign) => {
    if (newCampaign?._id) {
      await locationStore.fetchLocations(newCampaign._id);
    } else {
      locationStore.$patch({ locations: [] });
    }
  },
);

function viewLocation(locationId) {
  router.push(`/locations/${locationId}`);
}

function getTypeColor(type) {
  const colors = {
    world: "bg-indigo-500",
    region: "bg-cyan-500",
    city: "bg-blue-500",
    dungeon: "bg-red-500",
    wilderness: "bg-green-500",
    landmark: "bg-purple-500",
  };
  return colors[type] || "bg-gray-500";
}

async function deleteLocation(locationId, event) {
  event.stopPropagation();
  
  try {
    await locationStore.deleteLocation(locationId);
    if (campaignStore.activeCampaign?._id) {
      await locationStore.fetchLocations(campaignStore.activeCampaign._id);
    }
  } catch (error) {
    console.error('Error deleting location:', error);
  }
}

function openCreateModal() {
  isCreateModalOpen.value = true;
}

function closeCreateModal() {
  isCreateModalOpen.value = false;
}

async function handleCreateLocation(locationData) {
  try {
    await locationStore.createLocation(locationData);
    closeCreateModal();
  } catch (error) {
    console.error('Error creating location:', error);
  }
}
</script>

<template>
  <div>
    <div class="locations-view animate-fade-in">
    <!-- Page Header -->
    <div class="relative mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-4xl font-bold text-strahd-red text-glow-red">
            Location Maps
          </h2>
          <div
            class="absolute -bottom-2 left-0 w-32 h-1 bg-gradient-to-r from-strahd-red to-transparent"
          ></div>
          <p class="text-strahd-gold text-sm mt-3 opacity-80">
            Explore interactive maps of Barovia's dark places
          </p>
        </div>
        <button
          @click="openCreateModal"
          class="create-location-btn"
          title="Create new location"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>New Location</span>
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div
      v-if="locationStore.loading"
      class="flex flex-col items-center justify-center py-16"
    >
      <svg
        class="w-12 h-12 text-strahd-red animate-spin mb-4"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p class="text-xl text-strahd-gold">Loading locations...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="locationStore.locations.length === 0" class="empty-state">
      <svg
        class="w-20 h-20 text-strahd-red/30 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
      <p class="text-xl text-gray-400">No locations available</p>
    </div>

    <!-- Locations grid -->
    <div v-else class="locations-grid">
      <div
        v-for="location in locationStore.locations"
        :key="location._id"
        class="location-card group"
        @click="viewLocation(location._id)"
      >
        <!-- Map Icon -->
        <div class="map-icon">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>

        <div class="card-header">
          <h3
            class="location-name group-hover:text-strahd-gold transition-colors"
          >
            {{ location.name }}
          </h3>
          <span class="location-type" :class="getTypeColor(location.type)">
            {{ location.type }}
          </span>
        </div>

        <p class="location-description">{{ location.description }}</p>

        <div class="card-footer">
          <div class="node-count">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ location.nodes?.length || 0 }} nodes</span>
          </div>
          <div class="view-link">
            <span>View Map</span>
            <svg
              class="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>
          
          <!-- Delete Button -->
          <button
            @click="deleteLocation(location._id, $event)"
            class="delete-location-btn"
            title="Delete location"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
        </div>
      </div>
    </div>

    <!-- Create Location Modal -->
    <CreateLocationModal
      :show="isCreateModalOpen"
      @close="closeCreateModal"
      @create="handleCreateLocation"
    />
  </div>
</template>

<style scoped>
.locations-view {
  @apply p-6 max-w-7xl mx-auto;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-20;
}

.locations-grid {
  @apply grid gap-6;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.location-card {
  @apply relative bg-gradient-to-br from-strahd-dark to-strahd-darker;
  @apply border-2 border-strahd-red/30 rounded-xl p-6 cursor-pointer;
  @apply transition-all duration-300 shadow-xl;
}

.location-card:hover {
  @apply border-strahd-gold shadow-glow-gold;
  transform: translateY(-4px);
}

.map-icon {
  @apply absolute -top-2 -right-2 w-10 h-10;
  @apply bg-strahd-dark border-2 border-strahd-red rounded-full;
  @apply flex items-center justify-center text-strahd-gold;
  @apply shadow-lg transition-all duration-300;
}

.location-card:hover .map-icon {
  @apply border-strahd-gold text-strahd-red shadow-glow-gold;
  transform: rotate(12deg) scale(1.1);
}

.card-header {
  @apply flex justify-between items-start gap-3 mb-4;
}

.location-name {
  @apply text-2xl font-bold text-white flex-1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.location-card:hover .location-name {
  white-space: normal;
  word-wrap: break-word;
}

.location-type {
  @apply px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider;
  @apply border-2 shadow-lg;
  flex-shrink: 0;
}

.location-type.bg-blue-500 {
  @apply bg-blue-600/80 border-blue-400/50 text-white;
}

.location-type.bg-indigo-500 {
  @apply bg-indigo-600/80 border-indigo-400/50 text-white;
}

.location-type.bg-cyan-500 {
  @apply bg-cyan-600/80 border-cyan-400/50 text-white;
}

.location-type.bg-red-500 {
  @apply bg-red-600/80 border-red-400/50 text-white;
}

.location-type.bg-green-500 {
  @apply bg-green-600/80 border-green-400/50 text-white;
}

.location-type.bg-purple-500 {
  @apply bg-purple-600/80 border-purple-400/50 text-white;
}

.location-type.bg-gray-500 {
  @apply bg-gray-600/80 border-gray-400/50 text-white;
}

.location-description {
  @apply text-gray-300 text-sm leading-relaxed mb-6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  @apply flex justify-between items-center pt-4;
  @apply border-t border-strahd-red/20;
  position: relative;
}

.node-count {
  @apply flex items-center gap-2 text-strahd-gold text-sm font-semibold;
}

.view-link {
  @apply flex items-center gap-2 text-strahd-gold font-semibold text-sm;
}

.delete-location-btn {
  padding: 0.5rem;
  background: rgba(139, 0, 0, 0.8);
  border: 1px solid #8b0000;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  z-index: 10;
}

.location-card:hover .delete-location-btn {
  opacity: 1;
}

.delete-location-btn:hover {
  background: #a00000;
  box-shadow: 0 0 15px rgba(139, 0, 0, 0.6);
  transform: scale(1.1);
}

.create-location-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #8b0000;
  border: 2px solid #d4af37;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 0 15px rgba(139, 0, 0, 0.3);
}

.create-location-btn:hover {
  background: #a00000;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
  transform: translateY(-2px);
}
</style>
