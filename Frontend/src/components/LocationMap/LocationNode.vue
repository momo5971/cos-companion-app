<script setup>
import { ref, computed } from "vue";
import { useCampaignStore } from "../../stores/campaignStore";
import { useLocationStore } from "../../stores/locationStore";

const campaignStore = useCampaignStore();
const locationStore = useLocationStore();

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  locationId: {
    type: String,
    required: true,
  },
  transform: {
    type: Object,
    default: () => ({ x: 0, y: 0, k: 1 }),
  },
});

const emit = defineEmits([
  "view-details",
  "update-position",
  "toggle-completed",
  "navigate-to-location",
]);

const isDragging = ref(false);
const dragStart = ref(null);

// Long-press for mobile (toggle completed)
let longPressTimer = null;
const didLongPress = ref(false);

function handleTouchStart(event) {
  didLongPress.value = false;
  longPressTimer = setTimeout(() => {
    didLongPress.value = true;
    emit("toggle-completed", props.node);
  }, 500);
}

function handleTouchMove() {
  clearTimeout(longPressTimer);
}

function handleTouchEnd() {
  clearTimeout(longPressTimer);
}

// Position styling
const nodeStyle = computed(() => ({
  left: `${props.node.position.x}px`,
  top: `${props.node.position.y}px`,
}));

const isCompleted = computed(() => {
  if (campaignStore.hasActiveCampaign) {
    return campaignStore.isLocationNodeCompleted(
      props.locationId,
      props.node.name,
    );
  }
  return props.node.completed;
});

// Get linked location if exists
const linkedLocation = computed(() => {
  if (!props.node.linkedLocationId) return null;
  return locationStore.locations.find(loc => loc._id === props.node.linkedLocationId);
});

// Get icon based on location type
const nodeIcon = computed(() => {
  if (!linkedLocation.value) return null;
  
  const iconMap = {
    world: '🗺️',      // Map for world
    region: '🏞️',     // Landscape for region
    city: '🏰',       // Castle for city
    village: '🏘️',    // Houses for village
    settlement: '⛺',  // Tent for settlement/camp
    dungeon: '⚔️',    // Crossed swords for dungeon
    cave: '🕳️',      // Hole for cave
    building: '🏛️',   // Classical building
    temple: '⛪',     // Church for temple
    landmark: '🗿',   // Moai statue for landmark
  };
  
  return iconMap[linkedLocation.value.type] || '📍';
});

// Node color based on type
const nodeColor = computed(() => {
  if (isCompleted.value) return 'completed';
  if (linkedLocation.value) return 'linked';
  
  // Regular node colors based on type
  return props.node.type || 'info';
});

function handleClick(event) {
  // Skip if long-press just triggered
  if (didLongPress.value) {
    didLongPress.value = false;
    return;
  }
  // Only emit view-details if not dragging
  if (!isDragging.value) {
    emit("view-details", props.node);
  }
}

function handleRightClick(event) {
  event.preventDefault();
  event.stopPropagation();

  // Toggle completed status
  emit("toggle-completed", props.node);
}

function handleMouseDown(event) {
  // Ignore right-click
  if (event.button !== 0) return;

  // Prevent default to avoid text selection
  event.preventDefault();
  event.stopPropagation();

  isDragging.value = false;

  // Store initial mouse position (accounting for zoom/pan transform)
  dragStart.value = {
    x: (event.clientX - props.transform.x) / props.transform.k,
    y: (event.clientY - props.transform.y) / props.transform.k,
    nodeX: props.node.position.x,
    nodeY: props.node.position.y,
  };

  // Add event listeners
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
}

function handleMouseMove(event) {
  isDragging.value = true;

  // Calculate new position (accounting for zoom/pan transform)
  const currentX = (event.clientX - props.transform.x) / props.transform.k;
  const currentY = (event.clientY - props.transform.y) / props.transform.k;

  const deltaX = currentX - dragStart.value.x;
  const deltaY = currentY - dragStart.value.y;

  const newX = dragStart.value.nodeX + deltaX;
  const newY = dragStart.value.nodeY + deltaY;

  // Emit position update
  emit("update-position", {
    node: props.node,
    position: { x: Math.round(newX), y: Math.round(newY) },
  });
}

function handleMouseUp() {
  // Remove event listeners
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);

  // Reset dragging state after a short delay
  setTimeout(() => {
    isDragging.value = false;
  }, 100);
}
</script>

<template>
  <div
    class="location-node"
    :class="{ dragging: isDragging, completed: isCompleted, linked: linkedLocation }"
    :data-node-type="nodeColor"
    :style="nodeStyle"
    @click="handleClick"
    @mousedown="handleMouseDown"
    @contextmenu="handleRightClick"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Node marker (pin/dot) -->
    <div class="node-marker">
      <div v-if="nodeIcon" class="marker-icon">{{ nodeIcon }}</div>
      <div v-else class="marker-dot"></div>
      <div class="marker-pulse" v-if="!isCompleted && !linkedLocation"></div>
      <div v-if="isCompleted" class="completed-check">✓</div>
    </div>

    <!-- Node label -->
    <div class="node-label">
      {{ node.name }}
    </div>
  </div>
</template>

<style scoped>
.location-node {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  cursor: pointer;
  z-index: 10;
  transition: transform 0.2s;
}

.location-node:hover {
  transform: translate(-50%, -50%) scale(1.1);
  z-index: 20;
}

.location-node.dragging {
  cursor: grabbing;
  transition: none;
  z-index: 30;
}

.location-node.completed .marker-dot {
  background: #10b981;
  border-color: #059669;
}

.location-node.completed .marker-icon {
  filter: grayscale(100%) brightness(1.2);
  opacity: 0.7;
}

.location-node.completed .node-label {
  background: rgba(16, 185, 129, 0.8);
  text-decoration: line-through;
}

/* Linked location nodes */
.location-node.linked .marker-icon {
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  border: 3px solid #b8941e;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.6);
}

.location-node.linked .node-label {
  background: rgba(212, 175, 55, 0.9);
  color: #1a1a2e;
  font-weight: 700;
}

.location-node.linked:hover .marker-icon {
  background: linear-gradient(135deg, #f4d03f 0%, #d4af37 100%);
  border-color: #d4af37;
  box-shadow: 0 2px 12px rgba(212, 175, 55, 0.8);
}

.node-marker {
  position: relative;
  width: 24px;
  height: 24px;
  margin: 0 auto;
}

.marker-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border: 3px solid #1e40af;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.6);
  z-index: 2;
}

/* Node type colors */
.location-node[data-node-type="encounter"] .marker-dot {
  background: #ef4444;
  border-color: #991b1b;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.6);
}

.location-node[data-node-type="npc"] .marker-dot {
  background: #8b5cf6;
  border-color: #5b21b6;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.6);
}

.location-node[data-node-type="treasure"] .marker-dot {
  background: #f59e0b;
  border-color: #92400e;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.6);
}

.location-node[data-node-type="objective"] .marker-dot {
  background: #10b981;
  border-color: #065f46;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.6);
}

.location-node[data-node-type="secret"] .marker-dot {
  background: #ec4899;
  border-color: #831843;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.6);
}

.location-node[data-node-type="info"] .marker-dot {
  background: #3b82f6;
  border-color: #1e40af;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.6);
}

/* Pulse colors for different types */
.location-node[data-node-type="encounter"] .marker-pulse {
  background: rgba(239, 68, 68, 0.4);
}

.location-node[data-node-type="npc"] .marker-pulse {
  background: rgba(139, 92, 246, 0.4);
}

.location-node[data-node-type="treasure"] .marker-pulse {
  background: rgba(245, 158, 11, 0.4);
}

.location-node[data-node-type="objective"] .marker-pulse {
  background: rgba(16, 185, 129, 0.4);
}

.location-node[data-node-type="secret"] .marker-pulse {
  background: rgba(236, 72, 153, 0.4);
}

.location-node[data-node-type="info"] .marker-pulse {
  background: rgba(59, 130, 246, 0.4);
}

.marker-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  z-index: 2;
}

.marker-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background: rgba(59, 130, 246, 0.4);
  border-radius: 50%;
  animation: pulse 2s infinite;
  z-index: 1;
}

.completed-check {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
  z-index: 3;
}

.location-node.dragging .marker-pulse {
  animation: none;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.node-label {
  margin-top: 4px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
  white-space: nowrap;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
}

.link-indicator {
  font-size: 8px;
}

.location-node:hover .node-label {
  background: rgba(59, 130, 246, 0.9);
}

.location-node:hover .marker-dot {
  background: #60a5fa;
  border-color: #3b82f6;
}

.location-node.completed:hover .marker-dot {
  background: #34d399;
  border-color: #10b981;
}
</style>
