<script setup>
import { ref, onMounted } from "vue";
import DecisionTreeView from "./DecisionTreeView.vue";
import FocusedFlowchart from "./FocusedFlowchart.vue";
import CreateNodeModal from "./CreateNodeModal.vue";
import CreateSectionModal from "./CreateSectionModal.vue";
import { useDecisionNodeStore } from "../../stores/decisionNodeStore";
import { useSectionStore } from "../../stores/sectionStore";


const decisionNodeStore = useDecisionNodeStore();
const sectionStore = useSectionStore();
const focusedNodeId = ref(null);
const flowchartPanel = ref(null);
const focusedFlowchartRef = ref(null);
const showCreateModal = ref(false);
const showCreateSectionModal = ref(false);
const selectedParentNodeId = ref(null);
const editingSection = ref(null);
const editingNode = ref(null);
const pendingNodePosition = ref(null);

const props = defineProps({
  questId: {
    type: String,
    required: true,
  },
});

// Expose openCreateModal to parent component
defineExpose({
  openCreateModal: (parentNodeId = null) => {
    editingNode.value = null;
    selectedParentNodeId.value = parentNodeId;
    pendingNodePosition.value = null;
    showCreateModal.value = true;
  }
});

function handleNodeSelected(nodeId) {
  focusedNodeId.value = nodeId;
}

function handleZoomToNode(nodeId) {
  focusedNodeId.value = nodeId;
  if (focusedFlowchartRef.value) {
    focusedFlowchartRef.value.zoomToNode(nodeId);
  }
}

function openCreateModal(parentNodeId = null) {
  editingNode.value = null;
  selectedParentNodeId.value = parentNodeId;
  pendingNodePosition.value = null;
  showCreateModal.value = true;
}

function handleCreateAtPosition(position) {
  editingNode.value = null;
  selectedParentNodeId.value = null;
  pendingNodePosition.value = position;
  showCreateModal.value = true;
}

function handleEditNode(node) {
  editingNode.value = node;
  selectedParentNodeId.value = null;
  showCreateModal.value = true;
}

function openCreateSectionModal() {
  editingSection.value = null;
  showCreateSectionModal.value = true;
}

function openEditSectionModal(section) {
  editingSection.value = section;
  showCreateSectionModal.value = true;
}

function handleNodeCreated() {
  decisionNodeStore.fetchNodesByQuest(props.questId);
  showCreateModal.value = false;
  editingNode.value = null;
  pendingNodePosition.value = null;
}

function handleSectionCreated() {
  showCreateSectionModal.value = false;
  editingSection.value = null;
}

function handleSectionUpdated() {
  showCreateSectionModal.value = false;
  editingSection.value = null;
}

async function handleSectionDeleted(sectionName) {
  await sectionStore.fetchSectionsByQuest(props.questId);
  await decisionNodeStore.fetchNodesByQuest(props.questId);
}

async function handleNodeDeleted() {
  await decisionNodeStore.fetchNodesByQuest(props.questId);
}

onMounted(async () => {
  await decisionNodeStore.fetchNodesByQuest(props.questId);
});
</script>

<template>
  <div class="split-view-container">
    <div class="split-view-content">
      <!-- Left Panel: Tree View (30%) -->
      <div class="tree-panel">
        <DecisionTreeView
          :nodes="decisionNodeStore.nodes"
          :focused-node-id="focusedNodeId"
          :quest-id="props.questId"
          @node-selected="handleNodeSelected"
          @zoom-to-node="handleZoomToNode"
          @create-section="openCreateSectionModal"
          @edit-section="openEditSectionModal"
          @delete-section="handleSectionDeleted"
          @edit-node="handleEditNode"
          @node-deleted="handleNodeDeleted"
        />
      </div>

      <!-- Right Panel: Focused Flowchart (70%) -->
      <div ref="flowchartPanel" class="flowchart-panel">
        <FocusedFlowchart 
          ref="focusedFlowchartRef" 
          :focused-node-id="focusedNodeId"
          @create-at-position="handleCreateAtPosition"
        />
      </div>
    </div>

    <!-- Controls and Legend -->
    <div class="controls-overlay">
      <div class="legend">
        <div class="legend-item">
          <span class="legend-icon decision">🔀</span>
          <span>Decision</span>
        </div>
        <div class="legend-item">
          <span class="legend-icon outcome">🎯</span>
          <span>Outcome</span>
        </div>
        <div class="legend-item">
          <span class="legend-icon event">📜</span>
          <span>Event</span>
        </div>
      </div>
    </div>

    <!-- Create Node Modal -->
    <CreateNodeModal 
      :show="showCreateModal"
      :quest-id="props.questId"
      :parent-node-id="selectedParentNodeId"
      :node="editingNode"
      :position="pendingNodePosition"
      @close="showCreateModal = false; editingNode = null; pendingNodePosition = null"
      @created="handleNodeCreated"
      @updated="handleNodeCreated"
    />

    <!-- Create Section Modal -->
    <CreateSectionModal
      :show="showCreateSectionModal"
      :quest-id="props.questId"
      :section="editingSection"
      @close="showCreateSectionModal = false; editingSection = null"
      @created="handleSectionCreated"
      @updated="handleSectionUpdated"
    />
  </div>
</template>

<style scoped>
.split-view-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #1a1a2e;
  overflow: hidden;
}

.split-view-content {
  display: flex;
  height: 100%;
  width: 100%;
}

.tree-panel {
  width: 30%;
  height: 100%;
  overflow: hidden;
  flex-shrink: 0;
}

.flowchart-panel {
  width: 70%;
  height: 100%;
  flex-shrink: 0;
  position: relative;
}

.controls-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.legend {
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid #d4af37;
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #e0e0e0;
}

.legend-icon {
  font-size: 1rem;
}

.legend-icon.decision {
  color: #60a5fa;
}

.legend-icon.outcome {
  color: #f87171;
}

.legend-icon.event {
  color: #c084fc;
}

.zoom-controls {
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 12px;
  border-radius: 4px;
}
</style>
