<script setup>
import { ref, computed } from "vue";
import { useCampaignStore } from "../../stores/campaignStore";

const campaignStore = useCampaignStore();

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
]);

const isDragging = ref(false);
const dragStart = ref(null);

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

function handleClick(event) {
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
    :class="{ dragging: isDragging, completed: isCompleted }"
    :style="nodeStyle"
    @click="handleClick"
    @mousedown="handleMouseDown"
    @contextmenu="handleRightClick"
  >
    <!-- Node marker (pin/dot) -->
    <div class="node-marker">
      <div class="marker-dot"></div>
      <div class="marker-pulse" v-if="!isCompleted"></div>
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

.location-node.completed .node-label {
  background: rgba(16, 185, 129, 0.8);
  text-decoration: line-through;
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
