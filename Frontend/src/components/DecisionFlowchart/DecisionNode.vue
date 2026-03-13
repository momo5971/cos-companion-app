<script setup>
import { computed } from "vue";
import { ref, watch } from "vue";
import { useDecisionNodeStore } from "../../stores/decisionNodeStore";
import { useCampaignStore } from "../../stores/campaignStore";

const decisionNodeStore = useDecisionNodeStore();
const campaignStore = useCampaignStore();

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  isCollapsed: {
    type: Boolean,
    default: false,
  },
  hasChildren: {
    type: Boolean,
    default: false,
  },
  isHighlighted: {
    type: Boolean,
    default: false,
  },
  isDimmed: {
    type: Boolean,
    default: false,
  },
  collapsedCount: {
    type: Number,
    default: 0,
  },
  isFocused: {
    type: Boolean,
    default: false,
  },
  isDragging: {
    type: Boolean,
    default: false,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["viewDetails", "startConnection", "toggleCollapse", "nodeClick"]);

async function toggleCompleted(event) {
  event.preventDefault();
  event.stopPropagation();

  // Update the node in the database
  await decisionNodeStore.updateNodeStatus(
    props.node._id,
    !props.node.completed,
  );

  // Track completion in the campaign
  if (campaignStore.hasActiveCampaign) {
    await campaignStore.toggleDecisionNodeCompletion(props.node._id);
  }
}

const isCompleted = computed(() => {
  if (campaignStore.hasActiveCampaign) {
    return campaignStore.isDecisionNodeCompleted(props.node._id);
  }
  return props.node.completed;
});

// Computed style for positioning
const nodeStyle = computed(() => {
  if (props.node.position) {
    return {
      position: "absolute",
      left: `${props.node.position.x}px`,
      top: `${props.node.position.y}px`,
    };
  }
  return {};
});

// Computed class based on node type
const nodeTypeClass = computed(() => {
  return `node-type-${props.node.nodeType}`;
});

const nodeIcon = computed(() => {
  const icons = {
    decision: "🔀",
    outcome: "🎯",
    event: "📜",
  };
  return icons[props.node.nodeType] || "📍";
});

function startConnection(event) {
  event.stopPropagation();
  emit("startConnection", props.node._id, event);
}

const isDraggingNode = ref(false);

// Touch double-tap detection
let lastTapTime = 0;

// Long-press for mobile (toggle completed)
let longPressTimer = null;
const didLongPress = ref(false);

function handleTouchStart() {
  didLongPress.value = false;
  longPressTimer = setTimeout(async () => {
    didLongPress.value = true;
    await toggleCompleted(new Event('touchstart'));
  }, 500);
}

function handleTouchMoveNode() {
  clearTimeout(longPressTimer);
}

function handleTouchEndNode(event) {
  clearTimeout(longPressTimer);

  // Skip double-tap detection if long-press fired
  if (didLongPress.value) {
    didLongPress.value = false;
    return;
  }

  // Skip if dragging
  if (isDraggingNode.value) {
    isDraggingNode.value = false;
    return;
  }

  if (event.target.closest('.connection-handle')) return;

  const now = Date.now();
  if (now - lastTapTime < 400) {
    event.preventDefault();
    emit("viewDetails", props.node);
    lastTapTime = 0;
  } else {
    lastTapTime = now;
  }
}

function viewDetails(event) {
  // Emit node-click for selection handling
  emit("nodeClick", props.node, event);
  
  // Skip if long-press just triggered
  if (didLongPress.value) {
    didLongPress.value = false;
    return;
  }
  
  // Only open details if we didn't just finish dragging
  if (isDraggingNode.value) {
    isDraggingNode.value = false;
    return;
  }
  
  // Don't open if clicking on connection handle
  if (event.target.closest('.connection-handle')) {
    return;
  }
  
  // Don't open if Ctrl/Cmd is held (multi-select mode)
  if (event.ctrlKey || event.metaKey) {
    return;
  }
}

function handleDoubleClick(event) {
  if (event.target.closest('.connection-handle')) {
    return;
  }
  
  emit("viewDetails", props.node);
}

// Track if node was dragged to prevent opening modal
watch(() => props.isDragging, (newVal) => {
  if (newVal) {
    isDraggingNode.value = true;
  }
});
</script>

<template>
  <div
    class="decision-node"
    :class="[
      nodeTypeClass,
      { 
        completed: isCompleted, 
        highlighted: isHighlighted,
        dimmed: isDimmed,
        dragging: isDragging,
        selected: isSelected
      },
    ]"
    :style="nodeStyle"
    :data-node-id="node._id"
    @click="viewDetails"
    @dblclick="handleDoubleClick"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMoveNode"
    @touchend="handleTouchEndNode"
    @contextmenu="toggleCompleted"
    title="Click to select • Ctrl+Click to multi-select • Drag to move • Double-click for details • Right-click to toggle completed"
  >
    <div class="connection-handle" @mousedown="startConnection" title="Drag to connect">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
      </svg>
    </div>
    <div class="node-header">
      <button
        v-if="hasChildren"
        @click.stop="$emit('toggle-collapse', node._id)"
        class="collapse-btn"
        :title="isCollapsed ? `Expand (${collapsedCount} hidden)` : 'Collapse'"
      >
        {{ isCollapsed ? "▶" : "▼" }}
        <span v-if="isCollapsed && collapsedCount > 0" class="collapse-count">
          {{ collapsedCount }}
        </span>
      </button>
      <span class="node-icon">{{ nodeIcon }}</span>
      <span class="node-type-badge">{{ node.nodeType }}</span>
    </div>
    <h3 :class="{ 'line-through': isCompleted }">{{ node.title }}</h3>
    <p class="node-description">{{ node.description }}</p>
    <p v-if="node.consequences" class="consequences">
      <span class="label">→</span> {{ node.consequences }}
    </p>
    <p class="text-xs text-gray-500 mt-2">Click for details</p>
  </div>
</template>

<style scoped>
.decision-node {
  @apply bg-strahd-darker border rounded-lg p-4 transition-all;
  width: 250px;
  box-sizing: border-box;
  flex-shrink: 0;
  border-width: 1px;
  cursor: move;
  will-change: transform;
}

.decision-node:hover {
  @apply transform scale-105;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.decision-node h3 {
  @apply text-lg font-bold mb-2;
}

.decision-node p {
  @apply text-sm text-gray-300 mb-2;
}

.collapse-btn {
  background: none;
  border: none;
  color: #d4af37;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.collapse-btn:hover {
  color: #fff;
}

.collapse-count {
  font-size: 0.65rem;
  background: rgba(212, 175, 55, 0.3);
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  margin-left: 0.25rem;
}

.decision-node.completed {
  opacity: 0.6;
  background: #2a2a3e;
}

.decision-node.completed h3 {
  text-decoration: line-through;
}

.decision-node.selected {
  box-shadow: 0 0 0 3px #d4af37;
  border-color: #d4af37;
  border-width: 2px;
  z-index: 15;
}

.decision-node.highlighted {
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.6);
  border-color: #d4af37;
  border-width: 2px;
  transform: scale(1.02);
  z-index: 10;
}

.decision-node.dimmed {
  opacity: 0.3;
  filter: grayscale(0.5);
}

/* Node type-specific styles */
.node-type-decision {
  border-color: #60a5fa;
  background: linear-gradient(135deg, #1a1a2e 0%, rgba(96, 165, 250, 0.05) 100%);
}

.node-type-decision h3 {
  @apply text-blue-400;
}

.node-type-outcome {
  border-color: #f87171;
  background: linear-gradient(135deg, #1a1a2e 0%, rgba(248, 113, 113, 0.05) 100%);
}

.node-type-outcome h3 {
  @apply text-red-400;
}

.node-type-event {
  border-color: #c084fc;
  background: linear-gradient(135deg, #1a1a2e 0%, rgba(192, 132, 252, 0.05) 100%);
}

.node-type-event h3 {
  @apply text-purple-400;
}
.node-header {
  @apply flex items-center justify-between mb-2;
}

.node-icon {
  @apply text-2xl;
}

.node-type-badge {
  @apply px-2 py-1 rounded text-xs font-semibold uppercase;
  background: rgba(255, 255, 255, 0.1);
}

.node-description {
  @apply text-sm text-gray-300 mb-2;
}

.consequences {
  @apply text-xs text-gray-400 italic mt-2 p-2 rounded;
  background: rgba(0, 0, 0, 0.3);
}

.consequences .label {
  @apply font-bold text-strahd-red;
}

.decision-node.highlighted {
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.6);
  border-color: #d4af37;
  transform: scale(1.02);
  z-index: 10;
}

.decision-node.dragging {
  cursor: grabbing;
  opacity: 0.9;
  z-index: 100;
  transition: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.connection-handle {
  position: absolute;
  top: 50%;
  right: -15px;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  background: #8b0000;
  border: 2px solid #d4af37;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  opacity: 0;
  transition: all 0.2s;
  z-index: 20;
}

.connection-handle:active {
  cursor: grabbing;
}

.decision-node:hover .connection-handle {
  opacity: 1;
}

@media (hover: none) {
  .connection-handle {
    opacity: 1;
  }
}

.connection-handle:hover {
  background: #a00000;
  box-shadow: 0 0 15px rgba(139, 0, 0, 0.6);
  transform: translateY(-50%) scale(1.1);
}

.connection-handle svg {
  color: #d4af37;
}
</style>
