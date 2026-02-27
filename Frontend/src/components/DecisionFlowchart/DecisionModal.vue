<script setup>
import { computed } from "vue";
import { ref } from "vue";
import { useDecisionNodeStore } from "../../stores/decisionNodeStore";

const decisionNodeStore = useDecisionNodeStore();

const isEditMode = ref(false);
const emit = defineEmits(["close"]);

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  node: {
    type: Object,
    required: true,
  },
});

const editForm = ref({
  title: "",
  description: "",
  consequences: "",
  nodeType: "",
  readAloud: "",
  dmNote: "",
});

const connectedNodes = computed(() => {
  if (!props.node.nextNodes || props.node.nextNodes.length === 0) {
    return [];
  }
  return props.node.nextNodes.map((nodeId) => {
    const node = decisionNodeStore.nodes.find((n) => n._id === nodeId);
    return node ? node.title : "Unknown";
  });
});

const nodeTypeClass = computed(() => {
  const classes = {
    decision: "bg-blue-900 text-blue-100",
    outcome: "bg-green-900 text-green-100",
    event: "bg-purple-900 text-purple-100",
  };
  return classes[props.node.nodeType] || "bg-gray-700 text-gray-300";
});

const nodeIcon = computed(() => {
  const icons = {
    decision: "🔀",
    outcome: "🎯",
    event: "📜",
  };
  return icons[props.node.nodeType] || "📍";
});

function closeModal() {
  emit("close");
}

function startEdit() {
  editForm.value = {
    title: props.node.title,
    description: props.node.description,
    consequences: props.node.consequences || "",
    nodeType: props.node.nodeType,
    readAloud: props.node.readAloud || "",
    dmNote: props.node.dmNote || "",
  };
  isEditMode.value = true;
}
function cancelEdit() {
  isEditMode.value = false;
}

async function saveEdit() {
  try {
    await decisionNodeStore.updateNode(props.node._id, editForm.value);
    isEditMode.value = false;
  } catch (error) {
    console.error("Error updating node:", error);
  }
}

async function deleteNode() {
  const confirmed = confirm(`Delete node "${props.node.title}"? This action cannot be undone.`);
  if (!confirmed) return;

  try {
    await decisionNodeStore.deleteNode(props.node._id);
    closeModal();
  } catch (error) {
    console.error("Error deleting node:", error);
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay">
        <div class="modal-container" @click.stop>
          <!-- Close button -->
          <button class="close-btn" @click="closeModal">
            <span class="text-2xl">&times;</span>
          </button>

          <!-- Quest details -->
          <!-- Edit button (only show in view mode) -->
          <button
            v-if="!isEditMode"
            @click="startEdit"
            class="absolute top-4 right-16 px-4 py-2 bg-strahd-gold hover:bg-strahd-gold/80 text-strahd-dark rounded-lg transition-colors font-semibold text-sm"
          >
            Edit
          </button>

          <!-- Modal content -->
          <div class="modal-content">
            <!-- View Mode -->
            <div v-if="!isEditMode">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-4xl">{{ nodeIcon }}</span>
                <h2 class="text-3xl font-bold text-strahd-red">
                  {{ node.title }}
                </h2>
              </div>

              <div class="detail-section">
                <h3 class="section-title">Description</h3>
                <p class="text-gray-300 whitespace-pre-wrap">{{ node.description }}</p>
              </div>

              <div class="detail-section" v-if="node.readAloud">
                <h3 class="section-title">Read Aloud</h3>
                <div class="read-aloud-box">
                  <p class="text-gray-300 whitespace-pre-wrap">{{ node.readAloud }}</p>
                </div>
              </div>

              <div class="detail-section" v-if="node.dmNote">
                <h3 class="section-title">DM Note</h3>
                <div class="dm-note-box">
                  <p class="text-gray-300 whitespace-pre-wrap">{{ node.dmNote }}</p>
                </div>
              </div>

              <div class="detail-section" v-if="node.consequences">
                <h3 class="section-title">Consequences</h3>
                <div class="consequences-box">
                  <p class="text-gray-300 whitespace-pre-wrap">{{ node.consequences }}</p>
                </div>
              </div>

              <div class="detail-section">
                <h3 class="section-title">Type</h3>
                <span class="node-type-badge" :class="nodeTypeClass">
                  {{ node.nodeType }}
                </span>
              </div>

              <div class="detail-section" v-if="connectedNodes.length > 0">
                <h3 class="section-title">Leads To</h3>
                <ul class="connected-nodes-list">
                  <li
                    v-for="(nodeName, index) in connectedNodes"
                    :key="index"
                    class="text-gray-300 text-sm"
                  >
                    → {{ nodeName }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Edit Mode -->
            <div v-else>
              <h2 class="text-2xl font-bold text-strahd-red mb-6">
                Edit Decision Node
              </h2>

              <div class="detail-section">
                <label class="section-title">Title</label>
                <input
                  v-model="editForm.title"
                  type="text"
                  class="form-input"
                  autocomplete="off"
                >
              </div>

              <div class="detail-section">
                <label class="section-title">Description</label>
                <textarea
                  v-model="editForm.description"
                  rows="4"
                  class="form-input" autocomplete="off"></textarea>
              </div>

              <div class="detail-section">
                <label class="section-title">Read Aloud</label>
                <textarea
                  v-model="editForm.readAloud"
                  rows="3"
                  class="form-input read-aloud-input"
                  placeholder="Text to read aloud to players..." autocomplete="off"></textarea>
              </div>

              <div class="detail-section">
                <label class="section-title">DM Note</label>
                <textarea
                  v-model="editForm.dmNote"
                  rows="3"
                  class="form-input dm-note-input"
                  placeholder="Private notes for the DM..." autocomplete="off"></textarea>
              </div>

              <div class="detail-section">
                <label class="section-title">Consequences</label>
                <textarea
                  v-model="editForm.consequences"
                  rows="3"
                  class="form-input" autocomplete="off"></textarea>
              </div>

              <div class="detail-section">
                <label class="section-title">Node Type</label>
                <select v-model="editForm.nodeType" class="form-input">
                  <option value="decision">Decision</option>
                  <option value="outcome">Outcome</option>
                  <option value="event">Event</option>
                </select>
              </div>

              <div class="flex gap-3 mt-6">
                <button
                  @click="saveEdit"
                  class="px-6 py-2 bg-strahd-red hover:bg-strahd-red/80 text-white rounded-lg transition-colors font-semibold"
                >
                  Save
                </button>
                <button
                  @click="cancelEdit"
                  class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  @click="deleteNode"
                  class="px-6 py-2 bg-red-900 hover:bg-red-800 text-white rounded-lg transition-colors font-semibold ml-auto"
                >
                  Delete Node
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: linear-gradient(to bottom right, #0f1419, #1a1f2e);
  border: 2px solid #8b0000;
  border-radius: 12px;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 40px;
  padding-top: 70px;
  box-shadow: 0 0 30px rgba(139, 0, 0, 0.5);
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

/* Hide scrollbar for Chrome, Safari and Opera */
.modal-container::-webkit-scrollbar {
  display: none;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  color: #8b0000;
  cursor: pointer;
  font-size: 30px;
  line-height: 1;
  transition: transform 0.2s;
}

.close-btn:hover {
  transform: scale(1.2);
  color: #dc2626;
}

.modal-content {
  color: #e0e0e0;
  padding: 10px;
}

.read-aloud-box {
  background: rgba(212, 175, 55, 0.1);
  border-left: 3px solid #d4af37;
  padding: 16px;
  border-radius: 4px;
  font-style: italic;
  text-align: center;
}

.dm-note-box {
  background: rgba(139, 0, 0, 0.1);
  border-left: 3px solid #8b0000;
  padding: 16px;
  border-radius: 4px;
  font-weight: bold;
}

.form-input {
  width: 100%;
  background: #0f1419;
  border: 2px solid rgba(139, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  color: #e0e0e0;
  font-size: 1rem;
  transition: border-color 0.3s;
  resize: none;
}

.form-input:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
}

.detail-section {
  margin-bottom: 24px;
}

.connected-nodes-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background: rgba(15, 20, 25, 0.5);
  border-radius: 8px;
  padding: 12px;
}

.connected-nodes-list li {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(139, 0, 0, 0.2);
}

.connected-nodes-list li:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #8b0000;
  margin-bottom: 12px;
  font-family: "Cinzel", serif;
}

.node-type-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  border: 1px solid currentColor;
}

.read-aloud-input {
  font-style: italic;
  text-align: center;
}

.dm-note-input {
  font-weight: bold;
}

.consequences-box {
  background: rgba(139, 0, 0, 0.1);
  border-left: 3px solid #8b0000;
  padding: 16px;
  border-radius: 4px;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>


.connections-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #d4af37;
  border-radius: 8px;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
}

.connection-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.connection-item:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: #d4af37;
}

.connection-item.selected {
  background: rgba(139, 0, 0, 0.2);
  border-color: #8b0000;
}

.connection-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  accent-color: #8b0000;
}

.connection-title {
  flex: 1;
  color: #e0e0e0;
  font-size: 0.875rem;
}
