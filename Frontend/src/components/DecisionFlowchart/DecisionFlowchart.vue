<script setup>
import { ref, onMounted, watch, computed } from "vue";
import * as d3 from "d3";
import DecisionNode from "./DecisionNode.vue";
import DecisionModal from "./DecisionModal.vue";
import { useDecisionNodeStore } from "../../stores/decisionNodeStore";

const decisionNodeStore = useDecisionNodeStore();
const svgCanvas = ref(null);
const nodesLayer = ref(null);
const selectedNode = ref(null);
const isModalOpen = ref(false);
const canvasWidth = ref(1600);

// Zoom state
const transform = ref({ x: 0, y: 0, k: 1 });

const props = defineProps({
  questId: {
    type: String,
    required: true,
  },
});

const canvasHeight = computed(() => {
  if (decisionNodeStore.nodes.length === 0) return 800;

  const levels = groupNodesByLevel(decisionNodeStore.nodes);
  const nodeHeight = 150;
  const verticalSpacing = 120;

  return levels.length * (nodeHeight + verticalSpacing) + 100;
});

function handleViewDetails(node) {
  selectedNode.value = node;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  selectedNode.value = null;
}

// Compute positions automatically
const nodesWithPositions = computed(() => {
  return calculateLayout(decisionNodeStore.nodes);
});

// Auto-layout algorithm
function calculateLayout(nodes) {
  if (nodes.length === 0) return [];

  // Group nodes by level (based on connections)
  const levels = groupNodesByLevel(nodes);

  const nodeWidth = 250;
  const nodeHeight = 150;
  const horizontalSpacing = 100; // Increased from 30
  const verticalSpacing = 200; // Increased from 70

  const positioned = [];

  levels.forEach((levelNodes, levelIndex) => {
    const totalWidth =
      levelNodes.length * nodeWidth +
      (levelNodes.length - 1) * horizontalSpacing;
    const startX = (canvasWidth.value - totalWidth) / 2;

    levelNodes.forEach((node, nodeIndex) => {
      positioned.push({
        ...node,
        position: {
          x: startX + nodeIndex * (nodeWidth + horizontalSpacing),
          y: 50 + levelIndex * (nodeHeight + verticalSpacing),
        },
      });
    });
  });

  return positioned;
}

// Group nodes into levels based on their connections
function groupNodesByLevel(nodes) {
  const levels = [];
  const nodeMap = new Map(nodes.map((n) => [n._id, n]));
  const nodeLevel = new Map(); // Track which level each node belongs to

  // Find root nodes (no incoming connections)
  const rootNodes = nodes.filter((node) => {
    return !nodes.some((n) => n.nextNodes && n.nextNodes.includes(node._id));
  });

  // BFS to assign levels
  let currentLevel = rootNodes;
  let levelIndex = 0;

  while (currentLevel.length > 0) {
    // Mark all nodes in current level
    currentLevel.forEach((node) => {
      if (!nodeLevel.has(node._id)) {
        nodeLevel.set(node._id, levelIndex);
      }
    });

    levels.push([...currentLevel]);
    const nextLevel = [];

    currentLevel.forEach((node) => {
      if (node.nextNodes) {
        node.nextNodes.forEach((nextId) => {
          // Only add if not already assigned to a level
          if (!nodeLevel.has(nextId)) {
            const nextNode = nodeMap.get(nextId);
            if (nextNode) {
              // Check if already in nextLevel by ID
              const alreadyInNextLevel = nextLevel.some(
                (n) => n._id === nextId,
              );
              if (!alreadyInNextLevel) {
                nextLevel.push(nextNode);
              }
            }
          }
        });
      }
    });

    currentLevel = nextLevel;
    levelIndex++;
  }

  // Add any orphaned nodes to the last level
  const orphans = nodes.filter((n) => !nodeLevel.has(n._id));
  if (orphans.length > 0) {
    levels.push(orphans);
  }

  return levels;
}

// Draw connections when nodes change
watch(
  nodesWithPositions,
  () => {
    if (nodesWithPositions.value.length > 0) {
      drawConnections();
    }
  },
  { deep: true },
);

onMounted(async () => {
  await decisionNodeStore.fetchNodesByQuest(props.questId);

  // Only setup zoom and draw connections if there are nodes
  if (decisionNodeStore.nodes.length > 0) {
    setupZoom();
    drawConnections();
  }
});

// Setup zoom and pan
function setupZoom() {
  if (!svgCanvas.value?.parentElement?.parentElement) {
    return;
  }

  const container = d3.select(svgCanvas.value.parentElement.parentElement);

  const zoom = d3
    .zoom()
    .scaleExtent([0.5, 2])
    .on("zoom", (event) => {
      transform.value = event.transform;

      // Apply transform to SVG group
      d3.select(svgCanvas.value).attr(
        "transform",
        `translate(${event.transform.x},${event.transform.y}) scale(${event.transform.k})`,
      );

      // Apply transform to nodes layer
      if (nodesLayer.value) {
        nodesLayer.value.style.transform = `translate(${event.transform.x}px, ${event.transform.y}px) scale(${event.transform.k})`;
      }
    });

  container.call(zoom);
}

function drawConnections() {
  if (!svgCanvas.value || nodesWithPositions.value.length === 0) return;

  const svg = d3.select(svgCanvas.value);
  svg.selectAll("*").remove();

  // Draw lines between connected nodes
  nodesWithPositions.value.forEach((node) => {
    if (node.nextNodes && node.nextNodes.length > 0) {
      node.nextNodes.forEach((nextNodeId) => {
        const targetNode = nodesWithPositions.value.find(
          (n) => n._id === nextNodeId,
        );
        if (targetNode && node.position && targetNode.position) {
          drawLine(node.position, targetNode.position);
        }
      });
    }
  });
}

function drawLine(start, end) {
  const svg = d3.select(svgCanvas.value);

  const startX = start.x + 125;
  const startY = start.y + 75;
  const endX = end.x + 125;
  const endY = end.y + 75;

  svg
    .append("line")
    .attr("x1", startX)
    .attr("y1", startY)
    .attr("x2", endX)
    .attr("y2", endY)
    .attr("stroke", "#4a5568")
    .attr("stroke-width", 2)
    .attr("marker-end", "url(#arrowhead)");

  if (svg.select("#arrowhead").empty()) {
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("refX", 9)
      .attr("refY", 3)
      .attr("orient", "auto")
      .append("polygon")
      .attr("points", "0 0, 10 3, 0 6")
      .attr("fill", "#4a5568");
  }
}
</script>

<template>
  <div class="flowchart-container" :style="{ height: canvasHeight + 'px' }">
    <!-- Loading state -->
    <div v-if="decisionNodeStore.loading" class="loading-state">
      <p class="text-xl">Loading decision paths...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="decisionNodeStore.nodes.length === 0" class="empty-state">
      <p class="text-xl text-gray-400">No decision paths defined yet.</p>
    </div>

    <template v-else>
      <svg
        class="connections-layer"
        :width="canvasWidth"
        :height="canvasHeight"
      >
        <g ref="svgCanvas"></g>
      </svg>

      <div
        ref="nodesLayer"
        class="nodes-layer"
        :style="{
          height: canvasHeight + 'px',
          transformOrigin: '0 0',
        }"
      >
        <DecisionNode
          v-for="node in nodesWithPositions"
          :key="node._id"
          :node="node"
          @view-details="handleViewDetails"
        />
      </div>

      <!-- Controls -->
      <div class="controls-container">
        <div class="zoom-controls">
          <p class="text-xs text-gray-400">Scroll to zoom • Drag to pan</p>
        </div>
        <div class="node-controls">
          <p class="text-xs text-blue-400">Right-click to toggle completed</p>
        </div>
      </div>
    </template>
  </div>

  <!-- Quest Modal -->
  <DecisionModal
    v-if="selectedNode"
    :is-open="isModalOpen"
    :node="selectedNode"
    @close="closeModal"
  />
</template>

<style scoped>
.flowchart-container {
  position: relative;
  width: 100%;
  min-height: 100%;
  background: #1a1a2e;
  border-radius: 8px;
  overflow: hidden;
  cursor: grab;
}

.flowchart-container:active {
  cursor: grabbing;
}

.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

.nodes-layer {
  position: relative;
  z-index: 2;
  min-height: 100%;
}

.controls-container {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 12px;
  z-index: 10;
}

.zoom-controls {
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 12px;
  border-radius: 4px;
  pointer-events: none;
}

.node-controls {
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 12px;
  border-radius: 4px;
  pointer-events: none;
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
