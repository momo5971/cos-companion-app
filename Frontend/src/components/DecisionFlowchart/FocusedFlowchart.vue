<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import * as d3 from "d3";
import DecisionNode from "./DecisionNode.vue";
import DecisionModal from "./DecisionModal.vue";
import { useDecisionNodeStore } from "../../stores/decisionNodeStore";

const props = defineProps({
  focusedNodeId: {
    type: String,
    default: null,
  },
});

const decisionNodeStore = useDecisionNodeStore();
const canvasContainer = ref(null);
const svgCanvas = ref(null);
const selectedNodeId = ref(null);
const isModalOpen = ref(false);
const hoveredNodeId = ref(null);

// Multi-selection state
const selectedNodeIds = ref(new Set());

// Connection drawing state
const isDrawingConnection = ref(false);
const connectionStart = ref(null);

// Viewport state (D3 zoom-based)
const viewportTransform = ref({ x: 0, y: 0, scale: 1 });

// D3 zoom instance
let zoomBehavior = null;

// Drag state
const isDragging = ref(false);
const draggedNodeId = ref(null);
const dragStart = ref({ x: 0, y: 0 });
const dragStartPositions = ref({});
const nodePositions = ref({});

const selectedNode = computed(() => {
  if (!selectedNodeId.value) return null;
  return decisionNodeStore.nodes.find((n) => n._id === selectedNodeId.value);
});

// Get the section of the focused node
const focusedSection = computed(() => {
  if (!props.focusedNodeId) return null;
  const node = decisionNodeStore.nodes.find((n) => n._id === props.focusedNodeId);
  return node ? (node.section || "Unsorted") : null;
});

// Get all nodes in the focused section
const sectionNodes = computed(() => {
  if (!focusedSection.value) return [];
  return decisionNodeStore.nodes.filter(
    (n) => (n.section || "Unsorted") === focusedSection.value
  );
});

// Calculate grid positions for section nodes
const nodesWithPositions = computed(() => {
  if (sectionNodes.value.length === 0) return [];

  const nodeWidth = 250;
  const nodeHeight = 150;
  const horizontalSpacing = 100;
  const verticalSpacing = 200;
  const padding = 50;
  const nodesPerRow = 3;

  return sectionNodes.value.map((node, index) => {
    // Check if we have a custom position for this node
    if (nodePositions.value[node._id]) {
      return {
        ...node,
        position: nodePositions.value[node._id],
      };
    }

    // Otherwise use grid position
    const row = Math.floor(index / nodesPerRow);
    const col = index % nodesPerRow;

    return {
      ...node,
      position: {
        x: padding + col * (nodeWidth + horizontalSpacing),
        y: padding + row * (nodeHeight + verticalSpacing),
      },
    };
  });
});

// Viewport transform style (like Figma's canvas)
const canvasStyle = computed(() => {
  return {
    transform: `translate(${viewportTransform.value.x}px, ${viewportTransform.value.y}px) scale(${viewportTransform.value.scale})`,
    transformOrigin: '0 0',
  };
});

function handleNodeHover(nodeId) {
  hoveredNodeId.value = nodeId;
}

function handleNodeLeave() {
  hoveredNodeId.value = null;
}

function isNodeHighlighted(nodeId) {
  if (!hoveredNodeId.value) return false;
  const hoveredNode = nodesWithPositions.value.find(
    (n) => n._id === hoveredNodeId.value,
  );
  if (!hoveredNode) return false;

  return (
    nodeId === hoveredNodeId.value ||
    hoveredNode.nextNodes?.includes(nodeId) ||
    nodesWithPositions.value.some(
      (n) => n.nextNodes?.includes(hoveredNodeId.value) && n._id === nodeId,
    )
  );
}

function isNodeDimmed(nodeId) {
  if (!hoveredNodeId.value) return false;
  return !isNodeHighlighted(nodeId);
}

function handleNodeClick(node, event) {
  if (event.ctrlKey || event.metaKey) {
    // Ctrl+click: toggle selection
    if (selectedNodeIds.value.has(node._id)) {
      selectedNodeIds.value.delete(node._id);
    } else {
      selectedNodeIds.value.add(node._id);
    }
    selectedNodeIds.value = new Set(selectedNodeIds.value);
  } else {
    // Regular click: select only this node
    selectedNodeIds.value = new Set([node._id]);
  }
}

function handleViewDetails(node) {
  selectedNodeId.value = node._id;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  selectedNodeId.value = null;
}

// Convert screen coordinates to canvas coordinates
function screenToCanvas(screenX, screenY) {
  const rect = canvasContainer.value.getBoundingClientRect();
  const x = (screenX - rect.left - viewportTransform.value.x) / viewportTransform.value.scale;
  const y = (screenY - rect.top - viewportTransform.value.y) / viewportTransform.value.scale;
  return { x, y };
}

// Handle mouse down on canvas — only for node dragging and deselection
function handleMouseDown(event) {
  const nodeElement = event.target.closest('[data-node-id]');
  
  if (nodeElement) {
    const nodeId = nodeElement.getAttribute('data-node-id');
    const node = nodesWithPositions.value.find(n => n._id === nodeId);
    
    if (node && !event.target.closest('.connection-handle')) {
      if (selectedNodeIds.value.has(nodeId)) {
        startMultiNodeDrag(nodeId, event);
      } else {
        if (!event.ctrlKey && !event.metaKey) {
          selectedNodeIds.value = new Set([nodeId]);
        }
        startNodeDrag(nodeId, event, node.position);
      }
    }
  } else if (!event.target.closest('.connection-handle')) {
    // Click on empty canvas = deselect all (but not during pan)
    if (event.button === 0 && !event.shiftKey) {
      selectedNodeIds.value = new Set();
    }
  }
}

// Setup D3 zoom for pan and zoom
function setupZoom() {
  if (!canvasContainer.value) return;

  const container = d3.select(canvasContainer.value);
  
  // Remove existing zoom behavior
  container.on(".zoom", null);

  zoomBehavior = d3
    .zoom()
    .scaleExtent([0.1, 3])
    .filter((event) => {
      // Allow wheel events for zoom
      if (event.type === 'wheel') return true;
      // Allow touch events for mobile pan/zoom
      if (event.type === 'touchstart' || event.type === 'touchmove' || event.type === 'touchend') return true;
      // For mouse: only pan with middle button, or left button on empty canvas (not on nodes)
      if (event.type === 'mousedown') {
        if (event.button === 1) return true; // middle button
        if (event.button === 0 && !event.target.closest('[data-node-id]') && !event.target.closest('.connection-handle')) {
          return true; // left click on empty canvas
        }
      }
      return false;
    })
    .on("zoom", (event) => {
      viewportTransform.value = {
        x: event.transform.x,
        y: event.transform.y,
        scale: event.transform.k,
      };
    });

  container.call(zoomBehavior);
  
  // Disable double-click zoom
  container.on("dblclick.zoom", null);
}

// Node dragging (single node)
function startNodeDrag(nodeId, event, currentPosition) {
  event.preventDefault();
  event.stopPropagation();
  
  isDragging.value = true;
  draggedNodeId.value = nodeId;
  
  const canvasCoords = screenToCanvas(event.clientX, event.clientY);
  dragStart.value = {
    x: canvasCoords.x - currentPosition.x,
    y: canvasCoords.y - currentPosition.y,
  };
  
  document.addEventListener('mousemove', handleNodeDrag);
  document.addEventListener('mouseup', endNodeDrag);
}

function handleNodeDrag(event) {
  if (!isDragging.value || !draggedNodeId.value) return;
  
  const canvasCoords = screenToCanvas(event.clientX, event.clientY);
  const newX = canvasCoords.x - dragStart.value.x;
  const newY = canvasCoords.y - dragStart.value.y;
  
  nodePositions.value = {
    ...nodePositions.value,
    [draggedNodeId.value]: { x: newX, y: newY }
  };
  
  // Redraw connections
  drawConnections();
}

function endNodeDrag(event) {
  if (!isDragging.value) return;
  
  isDragging.value = false;
  draggedNodeId.value = null;
  
  document.removeEventListener('mousemove', handleNodeDrag);
  document.removeEventListener('mouseup', endNodeDrag);
}

// Multi-node dragging
function startMultiNodeDrag(nodeId, event) {
  event.preventDefault();
  event.stopPropagation();
  
  isDragging.value = true;
  draggedNodeId.value = nodeId;
  
  // Store starting positions for all selected nodes
  dragStartPositions.value = {};
  selectedNodeIds.value.forEach(id => {
    const node = nodesWithPositions.value.find(n => n._id === id);
    if (node && node.position) {
      dragStartPositions.value[id] = { ...node.position };
    }
  });
  
  const canvasCoords = screenToCanvas(event.clientX, event.clientY);
  const currentNode = nodesWithPositions.value.find(n => n._id === nodeId);
  dragStart.value = {
    x: canvasCoords.x - currentNode.position.x,
    y: canvasCoords.y - currentNode.position.y,
  };
  
  document.addEventListener('mousemove', handleMultiNodeDrag);
  document.addEventListener('mouseup', endMultiNodeDrag);
}

function handleMultiNodeDrag(event) {
  if (!isDragging.value || !draggedNodeId.value) return;
  
  const canvasCoords = screenToCanvas(event.clientX, event.clientY);
  const newX = canvasCoords.x - dragStart.value.x;
  const newY = canvasCoords.y - dragStart.value.y;
  
  // Calculate delta from the dragged node's starting position
  const startPos = dragStartPositions.value[draggedNodeId.value];
  const deltaX = newX - startPos.x;
  const deltaY = newY - startPos.y;
  
  // Move all selected nodes by the same delta
  const newPositions = { ...nodePositions.value };
  selectedNodeIds.value.forEach(id => {
    const startPos = dragStartPositions.value[id];
    if (startPos) {
      newPositions[id] = {
        x: startPos.x + deltaX,
        y: startPos.y + deltaY
      };
    }
  });
  
  nodePositions.value = newPositions;
  
  // Redraw connections
  drawConnections();
}

function endMultiNodeDrag(event) {
  if (!isDragging.value) return;
  
  isDragging.value = false;
  draggedNodeId.value = null;
  dragStartPositions.value = {};
  
  document.removeEventListener('mousemove', handleMultiNodeDrag);
  document.removeEventListener('mouseup', endMultiNodeDrag);
}

// Start drawing a connection
function startConnection(nodeId, event) {
  event.stopPropagation();
  isDrawingConnection.value = true;
  connectionStart.value = nodeId;
  
  document.addEventListener('mousemove', updateTempLine);
  document.addEventListener('mouseup', endConnection);
}

// Update temporary line while dragging
function updateTempLine(event) {
  if (!isDrawingConnection.value || !connectionStart.value) return;

  const startNode = nodesWithPositions.value.find(n => n._id === connectionStart.value);
  if (!startNode) return;

  const canvasCoords = screenToCanvas(event.clientX, event.clientY);
  
  const svg = svgCanvas.value;
  if (!svg) return;
  
  // Remove old temp line
  const existingLine = svg.querySelector('.temp-line');
  if (existingLine) existingLine.remove();

  const nodeWidth = 250;
  const startX = startNode.position.x + nodeWidth / 2;
  const startY = startNode.position.y + 75;

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('class', 'temp-line');
  line.setAttribute('x1', startX);
  line.setAttribute('y1', startY);
  line.setAttribute('x2', canvasCoords.x);
  line.setAttribute('y2', canvasCoords.y);
  line.setAttribute('stroke', '#d4af37');
  line.setAttribute('stroke-width', '2');
  line.setAttribute('stroke-dasharray', '5,5');
  line.setAttribute('opacity', '0.6');
  
  svg.appendChild(line);
}

// End connection drawing
async function endConnection(event) {
  if (!isDrawingConnection.value) return;

  const targetElement = document.elementFromPoint(event.clientX, event.clientY);
  const nodeElement = targetElement?.closest('[data-node-id]');
  
  if (nodeElement && connectionStart.value) {
    const targetNodeId = nodeElement.getAttribute('data-node-id');
    
    if (targetNodeId && targetNodeId !== connectionStart.value) {
      await createConnection(connectionStart.value, targetNodeId);
    }
  }

  // Clean up
  const svg = svgCanvas.value;
  if (svg) {
    const tempLine = svg.querySelector('.temp-line');
    if (tempLine) tempLine.remove();
  }
  
  isDrawingConnection.value = false;
  connectionStart.value = null;
  
  document.removeEventListener('mousemove', updateTempLine);
  document.removeEventListener('mouseup', endConnection);
}

// Create a connection between two nodes
async function createConnection(fromNodeId, toNodeId) {
  try {
    const fromNode = decisionNodeStore.nodes.find(n => n._id === fromNodeId);
    if (!fromNode) return;

    const updatedNextNodes = [...(fromNode.nextNodes || [])];
    
    const index = updatedNextNodes.indexOf(toNodeId);
    if (index > -1) {
      updatedNextNodes.splice(index, 1);
    } else {
      updatedNextNodes.push(toNodeId);
    }

    await decisionNodeStore.updateNode(fromNodeId, {
      nextNodes: updatedNextNodes
    });

    await nextTick();
    drawConnections();
  } catch (error) {
    console.error('Error creating connection:', error);
  }
}

function drawConnections() {
  if (!svgCanvas.value) return;

  // Clear ALL existing lines by removing all children
  while (svgCanvas.value.firstChild) {
    svgCanvas.value.removeChild(svgCanvas.value.firstChild);
  }
  
  // Don't draw if no nodes
  if (nodesWithPositions.value.length === 0) return;

  nodesWithPositions.value.forEach((node) => {
    if (node.nextNodes && node.nextNodes.length > 0) {
      node.nextNodes.forEach((nextNodeId) => {
        const targetNode = nodesWithPositions.value.find(
          (n) => n._id === nextNodeId,
        );
        // Only draw line if BOTH nodes exist and have positions
        if (targetNode && node.position && targetNode.position) {
          drawLine(node.position, targetNode.position, node._id, nextNodeId);
        }
      });
    }
  });
}

function drawLine(start, end, fromId, toId) {
  const svg = svgCanvas.value;
  if (!svg) return;
  
  const nodeWidth = 250;
  const nodeHeight = 150;

  const startCenterX = start.x + nodeWidth / 2;
  const startCenterY = start.y + nodeHeight / 2;
  const endCenterX = end.x + nodeWidth / 2;
  const endCenterY = end.y + nodeHeight / 2;

  const dx = endCenterX - startCenterX;
  const dy = endCenterY - startCenterY;

  let startX, startY, endX, endY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      startX = start.x + nodeWidth;
      startY = startCenterY;
    } else {
      startX = start.x;
      startY = startCenterY;
    }
  } else {
    if (dy > 0) {
      startX = startCenterX;
      startY = start.y + nodeHeight;
    } else {
      startX = startCenterX;
      startY = start.y;
    }
  }

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      endX = end.x;
      endY = endCenterY;
    } else {
      endX = end.x + nodeWidth;
      endY = endCenterY;
    }
  } else {
    if (dy > 0) {
      endX = endCenterX;
      endY = end.y;
    } else {
      endX = endCenterX;
      endY = end.y + nodeHeight;
    }
  }

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('class', 'connection-line');
  line.setAttribute('data-from', fromId);
  line.setAttribute('data-to', toId);
  line.setAttribute('x1', startX);
  line.setAttribute('y1', startY);
  line.setAttribute('x2', endX);
  line.setAttribute('y2', endY);
  line.setAttribute('stroke', '#d4af37');
  line.setAttribute('stroke-width', '2');
  line.setAttribute('opacity', '0.6');
  
  svg.appendChild(line);
}

watch(
  nodesWithPositions,
  async () => {
    if (nodesWithPositions.value.length > 0) {
      await nextTick();
      drawConnections();
      // Setup zoom if not already done (canvas just appeared)
      if (!zoomBehavior && canvasContainer.value) {
        setupZoom();
      }
    }
  },
  { deep: true, immediate: true },
);

// Reset when section changes
watch(focusedSection, () => {
  nodePositions.value = {};
  selectedNodeIds.value = new Set();
  viewportTransform.value = { x: 0, y: 0, scale: 1 };
  // Reset D3 zoom transform
  if (zoomBehavior && canvasContainer.value) {
    d3.select(canvasContainer.value).call(zoomBehavior.transform, d3.zoomIdentity);
  }
});

onMounted(() => {
  drawConnections();
  nextTick(() => setupZoom());
});

onUnmounted(() => {
  if (canvasContainer.value) {
    d3.select(canvasContainer.value).on(".zoom", null);
  }
});

// Expose zoomToNode method for parent component
defineExpose({
  zoomToNode,
});

// Zoom to a specific node with smooth animation
function zoomToNode(nodeId) {
  const node = nodesWithPositions.value.find(n => n._id === nodeId);
  if (!node || !node.position || !canvasContainer.value || !zoomBehavior) return;
  
  const containerRect = canvasContainer.value.getBoundingClientRect();
  const nodeWidth = 250;
  const nodeHeight = 150;
  
  const nodeCenterX = node.position.x + nodeWidth / 2;
  const nodeCenterY = node.position.y + nodeHeight / 2;
  
  const viewportCenterX = containerRect.width / 2;
  const viewportCenterY = containerRect.height / 2;
  
  const targetScale = 1.2;
  
  const targetX = viewportCenterX - nodeCenterX * targetScale;
  const targetY = viewportCenterY - nodeCenterY * targetScale;
  
  const targetTransform = d3.zoomIdentity.translate(targetX, targetY).scale(targetScale);
  
  d3.select(canvasContainer.value)
    .transition()
    .duration(400)
    .ease(d3.easeCubicOut)
    .call(zoomBehavior.transform, targetTransform);
}
</script>

<template>
  <div class="focused-flowchart">
    <div v-if="!focusedNodeId" class="empty-state">
      <p class="text-xl text-gray-400">
        Select a node from the tree to view its section
      </p>
    </div>

    <div v-else class="flowchart-container">
      <div class="section-header">
        <h3 class="section-title">{{ focusedSection }}</h3>
        <p class="section-info">
          {{ sectionNodes.length }} nodes
          <span v-if="selectedNodeIds.size > 0"> • {{ selectedNodeIds.size }} selected</span>
          • Ctrl+Click to multi-select • Scroll to zoom • Drag to pan
        </p>
      </div>

      <div 
        ref="canvasContainer"
        class="canvas-container" 
        @mousedown="handleMouseDown"
      >
        <div class="canvas-layer" :style="canvasStyle">
          <svg class="connections-svg" width="10000" height="10000">
            <g ref="svgCanvas"></g>
          </svg>

          <div class="nodes-container">
            <DecisionNode
              v-for="node in nodesWithPositions"
              :key="node._id"
              :node="node"
              :is-highlighted="isNodeHighlighted(node._id)"
              :is-dimmed="isNodeDimmed(node._id)"
              :is-focused="node._id === focusedNodeId"
              :is-selected="selectedNodeIds.has(node._id)"
              :is-dragging="isDragging && selectedNodeIds.has(node._id)"
              @mouseenter="handleNodeHover(node._id)"
              @mouseleave="handleNodeLeave"
              @node-click="handleNodeClick"
              @view-details="handleViewDetails"
              @start-connection="startConnection"
            />
          </div>
        </div>
      </div>
    </div>

    <DecisionModal
      v-if="selectedNode"
      :is-open="isModalOpen"
      :node="selectedNode"
      @close="closeModal"
    />
  </div>
</template>

<style scoped>
.focused-flowchart {
  height: 100%;
  width: 100%;
  background: #1a1a2e;
  display: flex;
  flex-direction: column;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.flowchart-container {
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid #d4af37;
  flex-shrink: 0;
}

.section-title {
  font-family: "Cinzel", serif;
  font-size: 1.5rem;
  color: #d4af37;
  margin-bottom: 0.25rem;
}

.section-info {
  font-size: 0.875rem;
  color: #999;
}

.canvas-container {
  position: relative;
  width: 100%;
  flex: 1;
  overflow: hidden;
  cursor: grab;
  background: 
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  touch-action: none;
}

.canvas-container:active {
  cursor: grabbing;
}

.canvas-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 10000px;
  height: 10000px;
  transform-origin: 0 0;
  will-change: transform;
}

.connections-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  overflow: visible;
}

.nodes-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.connection-line {
  transition: opacity 0.2s, stroke-width 0.2s;
  cursor: pointer;
  pointer-events: stroke;
}

.connection-line.highlighted {
  opacity: 1 !important;
  stroke-width: 3;
}

.connection-line.dimmed {
  opacity: 0.2;
}

.temp-line {
  pointer-events: none;
}
</style>
