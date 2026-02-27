<script setup>
import { ref, computed, onMounted } from "vue";
import { useSectionStore } from "../../stores/sectionStore";
import { useDecisionNodeStore } from "../../stores/decisionNodeStore";

const props = defineProps({
  nodes: {
    type: Array,
    required: true,
  },
  focusedNodeId: {
    type: String,
    default: null,
  },
  questId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["node-selected", "create-section", "edit-section", "delete-section", "edit-node", "node-deleted", "zoom-to-node"]);

const sectionStore = useSectionStore();
const decisionNodeStore = useDecisionNodeStore();
const collapsedSections = ref(new Set());

// Group nodes by section
const nodesBySection = computed(() => {
  const grouped = {};
  
  props.nodes.forEach((node) => {
    const sectionName = node.section || "Unsorted";
    if (!grouped[sectionName]) {
      grouped[sectionName] = [];
    }
    grouped[sectionName].push(node);
  });
  
  return grouped;
});

// Get all sections (from store + implicit sections from nodes)
const allSections = computed(() => {
  const sections = [];
  
  // Add sections from store
  sectionStore.sections.forEach((section) => {
    sections.push({
      name: section.name,
      description: section.description,
      order: section.order,
      _id: section._id,
      fromStore: true,
    });
  });
  
  // Add implicit sections from nodes that don't have a matching store section
  Object.keys(nodesBySection.value).forEach((sectionName) => {
    if (!sections.find((s) => s.name === sectionName)) {
      sections.push({
        name: sectionName,
        description: "",
        order: 999,
        _id: null,
        fromStore: false,
      });
    }
  });
  
  // Sort by order
  return sections.sort((a, b) => a.order - b.order);
});

function toggleSection(sectionName) {
  if (collapsedSections.value.has(sectionName)) {
    collapsedSections.value.delete(sectionName);
  } else {
    collapsedSections.value.add(sectionName);
  }
}

function getNodeIcon(nodeType) {
  switch (nodeType) {
    case "decision":
      return "🔀";
    case "outcome":
      return "🎯";
    case "event":
      return "📜";
    default:
      return "📍";
  }
}

function handleEditNode(node, event) {
  event.stopPropagation();
  emit("edit-node", node);
}

async function handleDeleteNode(node, event) {
  event.stopPropagation();
  
  try {
    await decisionNodeStore.deleteNode(node._id);
    await decisionNodeStore.fetchNodesByQuest(props.questId);
    emit("node-deleted");
  } catch (error) {
    console.error("Error deleting node:", error);
  }
}

function handleEditSection(section, event) {
  event.stopPropagation();
  if (section._id) {
    emit("edit-section", section);
  }
}

async function handleDeleteSection(section, event) {
  event.stopPropagation();
  if (!section._id) {
    return;
  }
  
  try {
    await sectionStore.deleteSection(section._id);
    await sectionStore.fetchSectionsByQuest(props.questId);
    await decisionNodeStore.fetchNodesByQuest(props.questId);
  } catch (error) {
    console.error("Error deleting section:", error);
  }
}

onMounted(() => {
  sectionStore.fetchSectionsByQuest(props.questId);
})
</script>

<template>
  <div class="tree-view">
    <div class="tree-header">
      <h3 class="font-cinzel text-strahd-gold">Sections</h3>
      <p class="text-xs text-gray-400 mt-1">{{ nodes.length }} nodes</p>
      <button @click="$emit('create-section')" class="create-section-btn">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        New Section
      </button>
    </div>
    <div class="tree-content">
      <!-- Section Groups -->
      <div
        v-for="section in allSections"
        :key="section.name"
        class="section-group"
      >
        <div class="section-header" @click="toggleSection(section.name)">
          <span class="section-toggle">
            {{ collapsedSections.has(section.name) ? "▶" : "▼" }}
          </span>
          <span class="section-name">{{ section.name }}</span>
          <span class="section-count">
            {{ nodesBySection[section.name]?.length || 0 }}
          </span>
          <div v-if="section._id" class="section-actions">
            <button
              @click="handleEditSection(section, $event)"
              class="section-action-btn edit"
              title="Edit section"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button
              @click="handleDeleteSection(section, $event)"
              class="section-action-btn delete"
              title="Delete section"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
          <div v-else-if="section.name !== 'Unsorted'" class="section-info-badge" title="Implicit section - create nodes with this section name or create it as a formal section">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
        
        <!-- Nodes in this section -->
        <div
          v-if="!collapsedSections.has(section.name)"
          class="section-nodes"
        >
          <div
            v-for="node in nodesBySection[section.name]"
            :key="node._id"
            class="node-item"
            :class="{ focused: node._id === focusedNodeId }"
            @click="$emit('node-selected', node._id)"
            @dblclick="$emit('zoom-to-node', node._id)"
          >
            <span class="node-icon">{{ getNodeIcon(node.nodeType) }}</span>
            <span class="node-title">{{ node.title }}</span>
            <div class="node-actions">
              <button
                @click="handleEditNode(node, $event)"
                class="node-action-btn edit"
                title="Edit node"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button
                @click="handleDeleteNode(node, $event)"
                class="node-action-btn delete"
                title="Delete node"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
          <div
            v-if="!nodesBySection[section.name] || nodesBySection[section.name].length === 0"
            class="empty-section"
          >
            No nodes in this section
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tree-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  border-right: 2px solid #d4af37;
}

.tree-header {
  padding: 1rem;
  border-bottom: 1px solid #d4af37;
}

.create-section-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  margin-top: 0.75rem;
  background: #8b0000;
  border: 1px solid #8b0000;
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}

.create-section-btn:hover {
  background: #a00000;
  box-shadow: 0 0 15px rgba(139, 0, 0, 0.5);
}

.tree-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  padding: 0.5rem;
}

.section-group {
  margin-bottom: 0.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid #d4af37;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.section-header:hover {
  background: rgba(212, 175, 55, 0.2);
}

.section-header:hover .section-actions {
  opacity: 1;
}

.section-toggle {
  color: #d4af37;
  font-size: 0.75rem;
  width: 16px;
  text-align: center;
}

.section-name {
  flex: 1;
  color: #d4af37;
  font-weight: 600;
  font-family: "Cinzel", serif;
}

.section-count {
  color: #888;
  font-size: 0.875rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.section-actions {
  display: flex;
  gap: 0.25rem;
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.2s;
}

.section-action-btn {
  padding: 0.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.section-action-btn.edit {
  color: #d4af37;
}

.section-action-btn.edit:hover {
  background: rgba(212, 175, 55, 0.2);
  color: #fff;
}

.section-action-btn.delete {
  color: #8b0000;
}

.section-action-btn.delete:hover {
  background: rgba(139, 0, 0, 0.2);
  color: #ff0000;
}

.section-info-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  opacity: 0.6;
  margin-left: auto;
}

.section-nodes {
  margin-top: 0.25rem;
  margin-left: 1rem;
  padding-left: 0.5rem;
  border-left: 2px solid rgba(212, 175, 55, 0.3);
}

.node-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  margin: 0.25rem 0;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.node-item:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: #d4af37;
}

.node-item:hover .node-actions {
  opacity: 1;
}

.node-item.focused {
  background: rgba(139, 0, 0, 0.3);
  border-color: #8b0000;
  box-shadow: 0 0 10px rgba(139, 0, 0, 0.3);
}

.node-icon {
  font-size: 1rem;
}

.node-title {
  flex: 1;
  color: #e0e0e0;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-actions {
  display: flex;
  gap: 0.25rem;
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.2s;
}

.node-action-btn {
  padding: 0.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.node-action-btn.edit {
  color: #d4af37;
}

.node-action-btn.edit:hover {
  background: rgba(212, 175, 55, 0.2);
  color: #fff;
}

.node-action-btn.delete {
  color: #8b0000;
}

.node-action-btn.delete:hover {
  background: rgba(139, 0, 0, 0.2);
  color: #ff0000;
}

.empty-section {
  padding: 1rem;
  text-align: center;
  color: #666;
  font-size: 0.875rem;
  font-style: italic;
}
</style>
