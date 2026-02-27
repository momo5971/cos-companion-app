<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import * as d3 from "d3";
import { useRouter } from "vue-router";
import LocationNode from "./LocationNode.vue";
import LocationModal from "./LocationModal.vue";
import CreateLocationNodeModal from "./CreateLocationNodeModal.vue";
import { useLocationStore } from "../../stores/locationStore";
import { useCampaignStore } from "../../stores/campaignStore";

const campaignStore = useCampaignStore();
const locationStore = useLocationStore();
const router = useRouter();
const mapContainer = ref(null);
const selectedNode = ref(null);
const isModalOpen = ref(false);
const isCreateModalOpen = ref(false);
const pendingNodePosition = ref(null);

// Zoom state
const transform = ref({ x: 0, y: 0, k: 1 });

// Flag to prevent saving during restore
let isRestoring = false;

// Flag to hide map until viewport is restored
const isViewportReady = ref(false);

// Current zoom behavior instance
let currentZoom = null;

const props = defineProps({
  locationId: {
    type: String,
    required: true,
  },
  selectedMapId: {
    type: String,
    default: null,
  },
});

// Get current location
const currentLocation = computed(() => {
  return locationStore.locations.find((loc) => loc._id === props.locationId);
});

// Get nodes with positions
const locationNodes = computed(() => {
  if (!currentLocation.value || !currentLocation.value.nodes) return [];
  
  // Filter nodes by selected map if using multiple maps
  let nodes = currentLocation.value.nodes;
  if (props.selectedMapId && currentLocation.value.maps && currentLocation.value.maps.length > 0) {
    // Show nodes that match the selected map OR nodes without a mapId (legacy nodes)
    nodes = nodes.filter(node => 
      node.mapId === props.selectedMapId || !node.mapId
    );
  } else if (!currentLocation.value.mapImage && (!currentLocation.value.maps || currentLocation.value.maps.length === 0)) {
    // If no map selected and no legacy mapImage and no maps, show no nodes
    return [];
  }
  
  // Only return nodes that have a valid position
  return nodes.filter(node => 
    node.position && node.position.x !== undefined && node.position.y !== undefined
  );
});

const mapImageUrl = computed(() => {
  if (!currentLocation.value) return null;
  
  // If using new maps system
  if (currentLocation.value.maps && currentLocation.value.maps.length > 0) {
    if (props.selectedMapId) {
      const selectedMap = currentLocation.value.maps.find(
        m => (m._id || m.name) === props.selectedMapId
      );
      if (selectedMap?.image) {
        return selectedMap.image;
      }
    }
    // Default to first map if no selection or not found
    return currentLocation.value.maps[0]?.image || null;
  }
  
  // Fallback to old mapImage
  return currentLocation.value.mapImage || null;
});

function handleViewDetails(node) {
  selectedNode.value = node;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  selectedNode.value = null;
}

async function handleUpdatePosition({ node, position }) {
  // Update the node position in the store with proper reactivity
  await locationStore.updateLocationNodePosition(
    props.locationId,
    node.id,
    position,
  );
}

async function handleToggleCompleted(node) {
  await locationStore.toggleNodeCompleted(props.locationId, node.id);

  // Track completion in the campaign
  if (campaignStore.hasActiveCampaign) {
    await campaignStore.toggleLocationNodeCompletion(
      props.locationId,
      node.name,
    );
  }
}

async function handleEditNode({ node, name, description, readAloud, dmNote }) {
  await locationStore.updateNode(props.locationId, node.id, {
    name,
    defaultDescription: description,
    readAloud: readAloud || "",
    dmNote: dmNote || "",
  });

  // Update selected node reference
  if (selectedNode.value && selectedNode.value.id === node.id) {
    const location = locationStore.locations.find(
      (loc) => loc._id === props.locationId,
    );
    if (location) {
      selectedNode.value = location.nodes.find((n) => n.id === node.id);
    }
  }
}

async function handleDeleteNode(node) {
  await locationStore.deleteNode(props.locationId, node.id);
  closeModal();
}

function handleMapDoubleClick(event) {
  // Don't create node if clicking on an existing node
  if (event.target.closest(".location-node")) return;

  // Get click position relative to map content
  const mapContent = event.currentTarget.querySelector(".map-content");
  if (!mapContent) return;
  
  const rect = mapContent.getBoundingClientRect();

  // Calculate position relative to the map content (not the container)
  // This accounts for zoom/pan transform
  const x = Math.round(
    (event.clientX - rect.left) / transform.value.k,
  );
  const y = Math.round(
    (event.clientY - rect.top) / transform.value.k,
  );

  // Store position and open modal
  pendingNodePosition.value = { x, y };
  isCreateModalOpen.value = true;
}

async function handleCreateNode({ name, type, description, readAloud, dmNote, linkedLocationId, position }) {
  const nodeData = {
    name,
    type: type || "info",
    position,
    defaultDescription: description,
    readAloud: readAloud || "",
    dmNote: dmNote || "",
    linkedLocationId: linkedLocationId || null,
    mapId: props.selectedMapId || null,
    completed: false,
  };
  
  await locationStore.createNode(props.locationId, nodeData);
  
  isCreateModalOpen.value = false;
  pendingNodePosition.value = null;
}

function closeCreateModal() {
  isCreateModalOpen.value = false;
  pendingNodePosition.value = null;
}

function handleNavigateToLocation(locationId) {
  router.push(`/locations/${locationId}`);
}

// Load viewport states from store on mount
onMounted(async () => {
  // Fetch the specific location if not already loaded
  if (!currentLocation.value) {
    const campaignStore = useCampaignStore();
    if (campaignStore.activeCampaign?._id) {
      await locationStore.fetchLocations(campaignStore.activeCampaign._id);
    }
  }

  // Wait for next tick to ensure DOM is ready
  await nextTick();
  
  // Wait a bit more for images to start loading
  setTimeout(() => {
    if (mapContainer.value && mapImageUrl.value) {
      setupZoom();
    }
  }, 50);
});

// Watch for map changes and restore viewport
watch(() => props.selectedMapId, async (newMapId, oldMapId) => {
  if (newMapId !== oldMapId && newMapId) {
    isViewportReady.value = false; // Hide during transition
    await nextTick();
    setupZoom();
  }
});

// Setup zoom and pan
function setupZoom() {
  if (!mapContainer.value) return;

  const container = d3.select(mapContainer.value);
  
  // Remove existing zoom behavior
  container.on(".zoom", null);

  currentZoom = d3
    .zoom()
    .scaleExtent([0.5, 3])
    .on("zoom", (event) => {
      transform.value = event.transform;

      // Apply transform to the map content
      const mapContent = container.select(".map-content");
      mapContent.style(
        "transform",
        `translate(${event.transform.x}px, ${event.transform.y}px) scale(${event.transform.k})`,
      );
      
      // Only save viewport state if not currently restoring
      if (!isRestoring) {
        saveViewportState();
      }
    });

  // Disable double-click zoom
  container.call(currentZoom).on("dblclick.zoom", null);
  
  // Restore saved viewport or reset to default
  restoreViewportState(container);
}

// Get unique key for current map
function getMapKey() {
  return props.selectedMapId || 'legacy';
}

// Save current viewport state to store
function saveViewportState() {
  const mapKey = getMapKey();
  if (mapKey) {
    const viewport = {
      x: transform.value.x,
      y: transform.value.y,
      k: transform.value.k,
    };
    locationStore.saveMapViewport(props.locationId, mapKey, viewport);
  }
}

// Restore viewport state from store or reset to default
function restoreViewportState(container) {
  const mapKey = getMapKey();
  
  // Set flag to prevent saving during restore
  isRestoring = true;
  
  let targetTransform;
  
  const saved = locationStore.getMapViewport(props.locationId, mapKey);
  
  if (saved) {
    // Restore saved state
    targetTransform = d3.zoomIdentity
      .translate(saved.x, saved.y)
      .scale(saved.k);
  } else {
    // Reset to default (centered, scale 1)
    targetTransform = d3.zoomIdentity.translate(0, 0).scale(1);
  }
  
  // Apply transform immediately to the map content (before D3 zoom)
  const mapContent = container.select(".map-content");
  mapContent.style(
    "transform",
    `translate(${targetTransform.x}px, ${targetTransform.y}px) scale(${targetTransform.k})`,
  );
  
  // Then set the D3 zoom transform
  container.call(currentZoom.transform, targetTransform);
  transform.value = targetTransform;
  
  // Show the map now that viewport is restored
  isViewportReady.value = true;
  
  // Clear flag after restore is complete
  setTimeout(() => {
    isRestoring = false;
  }, 100);
}


</script>

<template>
  <div
    ref="mapContainer"
    class="location-map-container"
    @dblclick="handleMapDoubleClick"
  >
    <!-- Loading state -->
    <div v-if="locationStore.loading" class="loading-state">
      <p class="text-xl">Loading location map...</p>
    </div>

    <!-- No map image -->
    <div v-else-if="!mapImageUrl" class="empty-state">
      <p class="text-xl text-gray-400">
        No map image available for this location.
      </p>
      <p class="text-sm text-gray-500 mt-2">
        Add a mapImage URL to the location.
      </p>
    </div>

    <template v-else>
      <div class="map-content" :style="{ opacity: isViewportReady ? 1 : 0 }">
        <!-- Background map image -->
        <img
          :src="mapImageUrl"
          :alt="currentLocation?.name + ' Map'"
          class="map-image"
        />

        <!-- Overlay nodes on the map -->
        <div class="nodes-overlay">
          <LocationNode
            v-for="node in locationNodes"
            :key="node.id || node.name"
            :node="node"
            :location-id="locationId"
            :transform="transform"
            @view-details="handleViewDetails"
            @update-position="handleUpdatePosition"
            @toggle-completed="handleToggleCompleted"
            @navigate-to-location="handleNavigateToLocation"
          />
        </div>
      </div>

      <!-- Controls -->
      <div class="controls-container">
        <div class="zoom-controls">
          <p class="text-xs text-gray-400">Scroll to zoom • Drag to pan</p>
        </div>
        <div class="node-controls">
          <p class="text-xs text-blue-400">Double-click to create node</p>
          <p class="text-xs text-green-400">Right-click to toggle completed</p>
        </div>
      </div>
    </template>
  </div>

  <!-- Location Node Modal -->
  <LocationModal
    v-if="selectedNode"
    :is-open="isModalOpen"
    :node="selectedNode"
    :location-id="locationId"
    @close="closeModal"
    @edit="handleEditNode"
    @delete="handleDeleteNode"
  />

  <!-- Create Node Modal -->
  <CreateLocationNodeModal
    :show="isCreateModalOpen"
    :position="pendingNodePosition"
    :current-location-id="locationId"
    @close="closeCreateModal"
    @create="handleCreateNode"
  />
</template>

<style scoped>
.location-map-container {
  position: relative;
  width: 100%;
  height: 800px;
  background: #1a1a2e;
  border-radius: 8px;
  overflow: hidden;
  cursor: grab;
}

.location-map-container:active {
  cursor: grabbing;
}

.map-content {
  position: relative;
  transform-origin: 0 0;
  width: fit-content;
  height: fit-content;
  transition: opacity 0.15s ease-in-out;
}

.map-image {
  display: block;
  max-width: 100%;
  height: auto;
  user-select: none;
  pointer-events: none;
}

.nodes-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.controls-container {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.controls-container {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.zoom-controls,
.node-controls {
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 12px;
  border-radius: 4px;
  pointer-events: none;
}

.node-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}
</style>
