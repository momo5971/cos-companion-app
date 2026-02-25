<script setup>
import { ref, onMounted, computed } from "vue";
import * as d3 from "d3";
import LocationNode from "./LocationNode.vue";
import LocationModal from "./LocationModal.vue";
import { useLocationStore } from "../../stores/locationStore";
import { useCampaignStore } from "../../stores/campaignStore";

const campaignStore = useCampaignStore();
const locationStore = useLocationStore();
const mapContainer = ref(null);
const selectedNode = ref(null);
const isModalOpen = ref(false);

// Debounce timer for saving positions
let saveTimer = null;

// Zoom state
const transform = ref({ x: 0, y: 0, k: 1 });

const props = defineProps({
  locationId: {
    type: String,
    required: true,
  },
});

// Get current location
const currentLocation = computed(() => {
  return locationStore.locations.find((loc) => loc._id === props.locationId);
});

// Get nodes with positions
const locationNodes = computed(() => {
  if (!currentLocation.value || !currentLocation.value.nodes) return [];
  return currentLocation.value.nodes;
});

const mapImageUrl = computed(() => {
  return currentLocation.value?.mapImage || null;
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
  // Find the location and node index
  const location = locationStore.locations.find(
    (loc) => loc._id === props.locationId,
  );
  if (location) {
    const nodeIndex = location.nodes.findIndex((n) => n.name === node.name);
    if (nodeIndex !== -1) {
      // Update using array splice to trigger reactivity
      location.nodes[nodeIndex] = {
        ...location.nodes[nodeIndex],
        position: { ...position },
      };
    }
  }

  // Debounce the save to backend (wait 500ms after last move)
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    await locationStore.updateLocationNodePosition(
      props.locationId,
      node.name,
      position,
    );
  }, 500);
}

async function handleToggleCompleted(node) {
  await locationStore.toggleNodeCompleted(props.locationId, node.name);

  // Track completion in the campaign
  if (campaignStore.hasActiveCampaign) {
    await campaignStore.toggleLocationNodeCompletion(
      props.locationId,
      node.name,
    );
  }
}

async function handleEditNode({ node, name, description }) {
  const oldName = node.name;

  await locationStore.updateNode(props.locationId, oldName, {
    name,
    defaultDescription: description,
  });

  // Update selected node reference with the new name
  if (selectedNode.value && selectedNode.value.name === oldName) {
    const location = locationStore.locations.find(
      (loc) => loc._id === props.locationId,
    );
    if (location) {
      selectedNode.value = location.nodes.find((n) => n.name === name);
    }
  }
}

async function handleDeleteNode(node) {
  await locationStore.deleteNode(props.locationId, node.name);
  closeModal();
}

function handleMapDoubleClick(event) {
  // Don't create node if clicking on an existing node
  if (event.target.closest(".location-node")) return;

  // Get click position relative to map content
  const mapContent = event.currentTarget.querySelector(".map-content");
  const rect = mapContent.getBoundingClientRect();

  // Calculate position accounting for zoom/pan
  const x = Math.round(
    (event.clientX - rect.left - transform.value.x) / transform.value.k,
  );
  const y = Math.round(
    (event.clientY - rect.top - transform.value.y) / transform.value.k,
  );

  // Prompt for node name
  const nodeName = prompt("Enter node name:");
  if (!nodeName) return;

  // Create the node
  locationStore.createNode(props.locationId, {
    name: nodeName,
    position: { x, y },
    defaultDescription: "",
    completed: false,
  });
}

onMounted(async () => {
  // Fetch the specific location if not already loaded
  if (!currentLocation.value) {
    await locationStore.fetchLocations();
  }

  // Setup zoom and pan
  setupZoom();
});

// Setup zoom and pan
function setupZoom() {
  if (!mapContainer.value) return;

  const container = d3.select(mapContainer.value);

  const zoom = d3
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
    });

  // Disable double-click zoom
  container.call(zoom).on("dblclick.zoom", null);
}

async function handleClearAllNodes() {
  if (
    confirm("Are you sure you want to delete ALL nodes? This cannot be undone.")
  ) {
    await locationStore.clearAllNodes(props.locationId);
  }
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
      <div class="map-content">
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
            :key="node.name"
            :node="node"
            :location-id="locationId"
            :transform="transform"
            @view-details="handleViewDetails"
            @update-position="handleUpdatePosition"
            @toggle-completed="handleToggleCompleted"
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
