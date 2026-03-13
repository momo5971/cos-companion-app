<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLocationStore } from "../stores/locationStore";
import { useCampaignStore } from "../stores/campaignStore";
import LocationMap from "../components/LocationMap/LocationMap.vue";
import CreateLocationModal from "../components/LocationMap/CreateLocationModal.vue";

const route = useRoute();
const router = useRouter();
const locationStore = useLocationStore();

const locationId = computed(() => route.params.id);
const isUploadingImage = ref(false);
const isCreateSubLocationOpen = ref(false);
const isEditLocationOpen = ref(false);
const selectedMapId = ref(null);
const isAddingMap = ref(false);
const newMapName = ref("");
const newMapImageInput = ref(null);

// Watch for location ID changes and reset selectedMapId
watch(() => locationId.value, async (newId) => {
  selectedMapId.value = null;
  if (newId) {
    await locationStore.fetchLocationById(newId);
  }
});

const currentLocation = computed(() => {
  // Prefer the dedicated currentLocation (has full image data)
  if (locationStore.currentLocation && String(locationStore.currentLocation._id) === String(locationId.value)) {
    return locationStore.currentLocation;
  }
  return locationStore.locations.find((loc) => String(loc._id) === String(locationId.value));
});

onMounted(async () => {
  // Fetch the full location with map images
  await locationStore.fetchLocationById(locationId.value);
  
  // Also fetch the list if empty (for navigation purposes)
  if (locationStore.locations.length <= 1) {
    const campaignStore = useCampaignStore();
    if (campaignStore.activeCampaign?._id) {
      await locationStore.fetchLocations(campaignStore.activeCampaign._id);
      // Re-fetch full location since fetchLocations overwrites without images
      await locationStore.fetchLocationById(locationId.value);
    }
  }
  
  // Set initial selected map after location is loaded
  if (currentLocation.value?.maps && currentLocation.value.maps.length > 0) {
    // Try to restore the last selected map for this location
    const lastSelected = locationStore.getLastSelectedMap(locationId.value);
    
    if (lastSelected && currentLocation.value.maps.find(m => (m.id || m.name) === lastSelected)) {
      // Restore the last selected map if it still exists
      selectedMapId.value = lastSelected;
    } else {
      // Otherwise select the first map
      const firstMap = currentLocation.value.maps[0];
      selectedMapId.value = firstMap.id || firstMap.name;
    }
  }
});

// Watch for location changes to update selected map
watch(() => currentLocation.value, (newLocation) => {
  if (newLocation?.maps && newLocation.maps.length > 0 && !selectedMapId.value) {
    // Try to restore the last selected map for this location
    const lastSelected = locationStore.getLastSelectedMap(locationId.value);
    
    if (lastSelected && newLocation.maps.find(m => (m.id || m.name) === lastSelected)) {
      // Restore the last selected map if it still exists
      selectedMapId.value = lastSelected;
    } else {
      // Otherwise select the first map
      const firstMap = newLocation.maps[0];
      selectedMapId.value = firstMap.id || firstMap.name;
    }
  }
}, { immediate: true });

function goBack() {
  router.push("/locations");
}

function goToParentLocation() {
  if (currentLocation.value?.parentLocationId) {
    router.push(`/locations/${currentLocation.value.parentLocationId}`);
  }
}

function openCreateSubLocation() {
  isCreateSubLocationOpen.value = true;
}

function closeCreateSubLocation() {
  isCreateSubLocationOpen.value = false;
}

async function handleCreateSubLocation(locationData) {
  try {
    await locationStore.createLocation(locationData);
    closeCreateSubLocation();
  } catch (error) {
    // Silent fail
  }
}

function openEditLocation() {
  isEditLocationOpen.value = true;
}

function closeEditLocation() {
  isEditLocationOpen.value = false;
}

async function handleUpdateLocation(locationData) {
  try {
    await locationStore.updateLocation(locationId.value, locationData);
    closeEditLocation();
  } catch (error) {
    // Silent fail
  }
}

async function handleDeleteLocation() {
  try {
    await locationStore.deleteLocation(locationId.value);
    // Navigate to parent location if exists, otherwise to locations list
    if (currentLocation.value?.parentLocationId) {
      router.push(`/locations/${currentLocation.value.parentLocationId}`);
    } else {
      router.push("/locations");
    }
  } catch (error) {
    // Silent fail
  }
}

// Multiple maps functionality
const currentMapImage = computed(() => {
  if (!currentLocation.value) return null;
  
  // If using new maps system
  if (currentLocation.value.maps && currentLocation.value.maps.length > 0) {
    const selectedMap = currentLocation.value.maps.find(
      m => (m.id || m.name) === selectedMapId.value
    );
    return selectedMap?.image || currentLocation.value.maps[0].image;
  }
  
  // Fallback to old mapImage
  return currentLocation.value.mapImage;
});

function selectMap(mapId) {
  selectedMapId.value = mapId;
  // Remember this selection for this location
  locationStore.setLastSelectedMap(locationId.value, mapId);
}

function startAddingMap() {
  isAddingMap.value = true;
  newMapName.value = "";
}

function cancelAddingMap() {
  isAddingMap.value = false;
  newMapName.value = "";
}

function triggerNewMapImageUpload() {
  newMapImageInput.value?.click();
}

async function handleNewMapImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    return;
  }

  if (!newMapName.value.trim()) {
    return;
  }

  isUploadingImage.value = true;

  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target.result;
      
      const maps = [...(currentLocation.value.maps || [])];
      const newMap = {
        id: `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newMapName.value,
        image: base64Image,
        order: maps.length,
      };
      maps.push(newMap);
      
      await locationStore.updateLocation(locationId.value, { maps });
      
      // Select the newly added map
      selectedMapId.value = newMap.id;
      
      // Remember this selection
      locationStore.setLastSelectedMap(locationId.value, newMap.id);
      
      isAddingMap.value = false;
      newMapName.value = "";
      isUploadingImage.value = false;
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('Failed to upload map:', error);
    isUploadingImage.value = false;
  }
}

async function deleteMap(mapId) {
  try {
    const maps = currentLocation.value.maps.filter(
      m => (m.id || m.name) !== mapId
    );
    
    // If deleting the currently selected map, select another one first
    if (selectedMapId.value === mapId) {
      if (maps.length > 0) {
        selectedMapId.value = maps[0].id || maps[0].name;
      } else {
        selectedMapId.value = null;
      }
    }
    
    await locationStore.updateLocation(locationId.value, { maps });
  } catch (error) {
    // Silent fail
  }
}
</script>

<template>
  <div>
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
        <div class="flex gap-2 mb-6">
          <button @click="goBack" class="back-button">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            <span class="hidden sm:inline">Back to Locations</span>
          </button>
          
          <button 
            v-if="currentLocation.parentLocationId" 
            @click="goToParentLocation" 
            class="parent-location-button"
            title="Go to parent location"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span class="hidden sm:inline">Parent Location</span>
          </button>
        </div>

        <div class="location-info">
          <h1 class="location-title text-glow-red">{{ currentLocation.name }}</h1>
          <span class="location-type">{{ currentLocation.type }}</span>
          <button
            @click="openCreateSubLocation"
            class="create-sublocation-btn"
            title="Create sub-location"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span class="hidden sm:inline">Add Sub-Location</span>
          </button>
          <button
            @click="openEditLocation"
            class="edit-location-btn"
            title="Edit location"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            <span class="hidden sm:inline">Edit</span>
          </button>
          <button
            @click="handleDeleteLocation"
            class="delete-location-btn"
            title="Delete location"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            <span class="hidden sm:inline">Delete</span>
          </button>
        </div>

        <p v-if="currentLocation.description" class="location-description">{{ currentLocation.description }}</p>
        
        <!-- Maps Section -->
        <div class="maps-section">
          <div class="maps-header">
            <h3 class="text-lg font-semibold text-strahd-gold">Maps</h3>
            <button
              v-if="!isAddingMap"
              @click="startAddingMap"
              class="btn-add-map"
              title="Add new map"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span>Add Map</span>
            </button>
          </div>

          <!-- Add Map Form -->
          <div v-if="isAddingMap" class="add-map-form">
            <input
              v-model="newMapName"
              type="text"
              placeholder="Map name (e.g., Floor 1, Day, Night)"
              class="map-name-input"
              autocomplete="off"
            />
            <input
              ref="newMapImageInput"
              type="file"
              accept="image/*"
              @change="handleNewMapImageUpload"
              class="hidden"
            />
            <button
              @click="triggerNewMapImageUpload"
              :disabled="isUploadingImage || !newMapName.trim()"
              class="btn-upload-map"
            >
              <svg v-if="!isUploadingImage" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isUploadingImage ? 'Uploading...' : 'Upload Image' }}</span>
            </button>
            <button @click="cancelAddingMap" class="btn-cancel-map">Cancel</button>
          </div>

          <!-- Map Tabs -->
          <div v-if="currentLocation.maps && currentLocation.maps.length > 0" class="map-tabs">
            <button
              v-for="map in currentLocation.maps"
              :key="map.id || map.name"
              @click="selectMap(map.id || map.name)"
              :class="['map-tab', { active: (map.id || map.name) === selectedMapId }]"
            >
              <span>{{ map.name }}</span>
              <button
                @click.stop="deleteMap(map.id || map.name)"
                class="delete-map-btn"
                title="Delete map"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </button>
          </div>

          <!-- Empty state message -->
          <div v-if="!currentLocation.maps || currentLocation.maps.length === 0" class="empty-maps-message">
            <p class="text-sm text-gray-400">No maps yet. Click "Add Map" above to create your first map.</p>
          </div>
        </div>
        
        <div class="decorative-divider"></div>
      </div>

      <!-- Map -->
      <div class="map-section">
        <LocationMap 
          :key="`${locationId}-${selectedMapId}`"
          :location-id="locationId" 
          :selected-map-id="selectedMapId" 
        />
      </div>
    </template>
  </div>

  <!-- Create Sub-Location Modal -->
  <CreateLocationModal
    :show="isCreateSubLocationOpen"
    :parent-location-id="locationId"
    @close="closeCreateSubLocation"
    @create="handleCreateSubLocation"
  />

  <!-- Edit Location Modal -->
  <CreateLocationModal
    :show="isEditLocationOpen"
    :location="currentLocation"
    @close="closeEditLocation"
    @update="handleUpdateLocation"
  />
  </div>
</template>

<style scoped>
.location-detail-view {
  @apply p-3 sm:p-6 max-w-7xl mx-auto;
}

.loading-container,
.error-container {
  @apply flex flex-col items-center justify-center py-20;
}

.location-header {
  @apply mb-8;
}

.back-button {
  @apply flex items-center gap-2 px-4 py-2;
  @apply bg-strahd-dark border-2 border-strahd-red/30 rounded-lg;
  @apply text-strahd-gold font-semibold transition-all duration-200;
}

.back-button:hover {
  @apply border-strahd-gold bg-strahd-darker shadow-glow-gold;
  transform: translateX(-4px);
}

.parent-location-button {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg font-semibold;
  @apply bg-strahd-dark border-2 border-strahd-red/50 text-strahd-red;
  @apply transition-all duration-200 shadow-lg;
}

.parent-location-button:hover {
  @apply bg-strahd-red/10 border-strahd-red shadow-glow-red;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.flex {
  display: flex;
}

.gap-2 {
  gap: 0.5rem;
}

.location-info {
  @apply flex items-start sm:items-center gap-3 sm:gap-4 mb-4 flex-wrap;
}

.location-title {
  @apply text-2xl sm:text-4xl font-bold text-strahd-red w-full sm:w-auto;
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

.maps-section {
  @apply mb-6;
}

.maps-header {
  @apply flex justify-between items-center mb-4;
}

.btn-add-map {
  @apply flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm;
  @apply bg-strahd-dark border-2 border-strahd-gold/50 text-strahd-gold;
  @apply transition-all duration-200 shadow-lg;
}

.btn-add-map:hover {
  @apply bg-strahd-gold/10 border-strahd-gold shadow-glow-gold;
}

.add-map-form {
  @apply flex flex-col sm:flex-row gap-2 mb-4 p-4 bg-strahd-dark border border-strahd-gold/30 rounded-lg;
}

.map-name-input {
  @apply flex-1 px-3 py-2 bg-strahd-darker border border-strahd-gold/50 rounded-lg;
  @apply text-gray-300 font-semibold;
}

.map-name-input:focus {
  @apply outline-none border-strahd-gold;
}

.btn-upload-map {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg font-semibold;
  @apply bg-strahd-red text-white;
  @apply transition-all duration-200;
}

.btn-upload-map:hover:not(:disabled) {
  @apply bg-red-700 shadow-glow-red;
}

.btn-upload-map:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.btn-cancel-map {
  @apply px-4 py-2 rounded-lg font-semibold;
  @apply bg-gray-600 text-white;
  @apply transition-all duration-200;
}

.btn-cancel-map:hover {
  @apply bg-gray-700;
}

.map-tabs {
  @apply flex gap-2 flex-wrap mb-4;
}

.map-tab {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg font-semibold;
  @apply bg-strahd-dark border-2 border-strahd-red/30 text-gray-300;
  @apply transition-all duration-200;
}

.map-tab:hover {
  @apply border-strahd-gold/50 bg-strahd-darker;
}

.map-tab.active {
  @apply border-strahd-gold bg-strahd-gold/10 text-strahd-gold;
}

.delete-map-btn {
  @apply p-1 rounded bg-red-900/50 text-red-300;
  @apply transition-all duration-200;
}

.delete-map-btn:hover {
  @apply bg-red-900 text-white;
}

.empty-maps-message {
  @apply p-4 bg-strahd-dark/50 border border-strahd-red/20 rounded-lg text-center;
}

.create-sublocation-btn {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg font-semibold;
  @apply bg-strahd-dark border-2 border-strahd-gold/50 text-strahd-gold;
  @apply transition-all duration-200 shadow-lg;
}

.create-sublocation-btn:hover {
  @apply bg-strahd-gold/10 border-strahd-gold shadow-glow-gold;
}

.edit-location-btn {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg font-semibold;
  @apply bg-strahd-dark border-2 border-blue-500/50 text-blue-400;
  @apply transition-all duration-200 shadow-lg;
}

.edit-location-btn:hover {
  @apply bg-blue-500/10 border-blue-500 shadow-lg;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
}

.delete-location-btn {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg font-semibold;
  @apply bg-strahd-dark border-2 border-red-500/50 text-red-400;
  @apply transition-all duration-200 shadow-lg;
}

.delete-location-btn:hover {
  @apply bg-red-500/10 border-red-500;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
}

.map-section {
  @apply bg-gradient-to-br from-strahd-dark to-strahd-darker;
  @apply border-2 border-strahd-red/30 rounded-xl p-2 sm:p-6 shadow-glow-red;
}
</style>
