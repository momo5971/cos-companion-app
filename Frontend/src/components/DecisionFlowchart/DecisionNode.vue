<script setup>
import { computed } from "vue";
import { useDecisionNodeStore } from "../../stores/decisionNodeStore";

const decisionNodeStore = useDecisionNodeStore();

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["viewDetails"]);

async function toggleCompleted(event) {
  event.preventDefault(); // Prevent context menu
  event.stopPropagation(); // Prevent opening modal
  await decisionNodeStore.updateNodeStatus(
    props.node._id,
    !props.node.completed,
  );
}

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

function viewDetails() {
  emit("viewDetails", props.node);
}
</script>

<template>
  <div
    class="decision-node"
    :class="[nodeTypeClass, { completed: node.completed }]"
    :style="nodeStyle"
    @click="viewDetails"
    @contextmenu="toggleCompleted"
    title="Right-click to toggle completed"
  >
    <div class="node-header">
      <span class="node-icon">{{ nodeIcon }}</span>
      <span class="node-type-badge">{{ node.nodeType }}</span>
    </div>
    <h3>{{ node.title }}</h3>
    <p class="node-description">{{ node.description }}</p>
    <p v-if="node.consequences" class="consequences">
      <span class="label">→</span> {{ node.consequences }}
    </p>
    <p class="text-xs text-gray-500 mt-2">Click for details</p>
  </div>
</template>

<style scoped>
.decision-node {
  @apply bg-strahd-darker border-2 rounded-lg p-4 cursor-pointer transition-all;
  min-width: 200px;
  max-width: 250px;
}

.decision-node:hover {
  @apply transform scale-105 shadow-lg;
}

.decision-node h3 {
  @apply text-lg font-bold mb-2;
}

.decision-node p {
  @apply text-sm text-gray-300 mb-2;
}
.decision-node.completed {
  opacity: 0.6;
  background: #2a2a3e;
}

.decision-node.completed h3 {
  text-decoration: line-through;
}

/* Node type-specific styles */
.node-type-decision {
  @apply border-blue-500;
}

.node-type-decision h3 {
  @apply text-blue-400;
}

.node-type-outcome {
  @apply border-green-500;
}

.node-type-outcome h3 {
  @apply text-green-400;
}

.node-type-event {
  @apply border-purple-500;
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
</style>
