<script setup>
import { ref, computed, watch } from "vue";
import { useQuestStore } from "../../stores/questStore";

const questStore = useQuestStore();

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  node: {
    type: Object,
    required: true,
  },
  locationId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close", "edit", "delete", "navigate-to-location"]);

const isEditing = ref(false);
const editedName = ref("");
const editedDescription = ref("");
const editedReadAloud = ref("");
const editedDmNote = ref("");

// Watch for node changes and update the displayed values
watch(
  () => props.node,
  (newNode) => {
    if (newNode && !isEditing.value) {
      // Update displayed values when node changes (but not while editing)
      editedName.value = newNode.name;
      editedDescription.value = newNode.defaultDescription || "";
      editedReadAloud.value = newNode.readAloud || "";
      editedDmNote.value = newNode.dmNote || "";
    }
  },
  { deep: true, immediate: true },
);

// Get quest-specific description if there's an active quest
const questDescription = computed(() => {
  if (!props.node.questDescriptions) return null;

  // Find active quests for this location
  const activeQuests = questStore.quests.filter(
    (q) => q.status === "active" && q.location?._id === props.locationId,
  );

  // Check if any active quest has a description for this node
  for (const quest of activeQuests) {
    const desc =
      props.node.questDescriptions?.get?.(quest._id) ||
      props.node.questDescriptions?.[quest._id];
    if (desc) {
      return { questName: quest.name, description: desc };
    }
  }

  return null;
});

// Display description (quest-specific or default)
const displayDescription = computed(() => {
  return (
    questDescription.value?.description ||
    props.node.defaultDescription ||
    "No description available."
  );
});

function handleClose() {
  isEditing.value = false;
  emit("close");
}

function startEdit() {
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
}

function saveEdit() {
  emit("edit", {
    node: props.node,
    name: editedName.value,
    description: editedDescription.value,
    readAloud: editedReadAloud.value,
    dmNote: editedDmNote.value,
  });
  isEditing.value = false;
}

function handleDelete() {
  emit("delete", props.node);
  handleClose();
}

function handleNavigateToLocation() {
  if (props.node.linkedLocationId) {
    emit("navigate-to-location", props.node.linkedLocationId);
    handleClose();
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-backdrop">
        <div class="modal-container">
          <!-- Header -->
          <div class="modal-header">
            <h3 class="modal-title">{{ node.name }}</h3>
            <button
              class="close-button"
              @click="handleClose"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <!-- Content -->
          <div class="modal-content">
            <!-- Edit Mode -->
            <div v-if="isEditing" class="edit-form">
              <div class="form-group">
                <label class="form-label">Node Name</label>
                <input
                  v-model="editedName"
                  type="text"
                  class="form-input"
                  placeholder="Enter node name"
                  autocomplete="off"
                >
              </div>

              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea
                  v-model="editedDescription"
                  class="form-textarea"
                  rows="6"
                  placeholder="Enter description"
                 autocomplete="off"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Read Aloud</label>
                <textarea
                  v-model="editedReadAloud"
                  class="form-textarea read-aloud-input"
                  rows="4"
                  placeholder="Text to read aloud to players..."
                 autocomplete="off"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">DM Note</label>
                <textarea
                  v-model="editedDmNote"
                  class="form-textarea dm-note-input"
                  rows="4"
                  placeholder="Private notes for the DM..."
                 autocomplete="off"></textarea>
              </div>

              <div class="form-actions">
                <button class="btn-secondary" @click="cancelEdit">
                  Cancel
                </button>
                <button class="btn-primary" @click="saveEdit">Save</button>
              </div>
            </div>

            <!-- View Mode -->
            <template v-else>
              <!-- Quest context banner -->
              <div v-if="questDescription" class="quest-banner">
                <span class="quest-icon">🎯</span>
                <span class="quest-text">{{ questDescription.questName }}</span>
              </div>

              <!-- Description -->
              <div class="description-section">
                <h4 class="section-title">Description</h4>
                <p class="description-text">{{ displayDescription }}</p>
              </div>

              <!-- Read Aloud -->
              <div v-if="node.readAloud" class="description-section">
                <h4 class="section-title">Read Aloud</h4>
                <div class="read-aloud-box">
                  <p class="description-text">{{ node.readAloud }}</p>
                </div>
              </div>

              <!-- DM Note -->
              <div v-if="node.dmNote" class="description-section">
                <h4 class="section-title">DM Note</h4>
                <div class="dm-note-box">
                  <p class="description-text">{{ node.dmNote }}</p>
                </div>
              </div>

              <!-- Show default description if quest description is active -->
              <div
                v-if="questDescription && node.defaultDescription"
                class="description-section"
              >
                <h4 class="section-title">General Information</h4>
                <p class="description-text text-gray-400">
                  {{ node.defaultDescription }}
                </p>
              </div>
            </template>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button v-if="!isEditing" class="btn-danger" @click="handleDelete">
              Delete
            </button>
            <button 
              v-if="!isEditing && node.linkedLocationId" 
              class="btn-navigate" 
              @click="handleNavigateToLocation"
              title="Navigate to linked location"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
              Go to Location
            </button>
            <div class="spacer"></div>
            <button v-if="!isEditing" class="btn-secondary" @click="startEdit">
              Edit
            </button>
            <button class="btn-primary" @click="handleClose">Close</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  @apply fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-5;
}

.modal-container {
  @apply bg-strahd-dark border-2 border-strahd-red rounded-xl shadow-glow-red;
  @apply max-w-2xl w-full max-h-[80vh] flex flex-col;
}

.modal-header {
  @apply flex justify-between items-center px-6 py-5 border-b border-strahd-red/30;
}

.modal-title {
  @apply text-2xl font-bold text-strahd-red text-glow-red;
  font-family: 'Cinzel', serif;
}

.close-button {
  @apply bg-transparent border-none text-gray-400 text-4xl cursor-pointer;
  @apply w-8 h-8 flex items-center justify-center rounded transition-all;
}

.close-button:hover {
  @apply bg-strahd-darker text-strahd-gold;
}

.modal-content {
  @apply px-6 py-6 overflow-y-auto flex-1;
}

.edit-form {
  @apply flex flex-col gap-4;
}

.form-group {
  @apply flex flex-col gap-2;
}

.form-label {
  @apply text-sm font-semibold text-strahd-gold uppercase tracking-wide;
}

.form-input,
.form-textarea {
  @apply input;
}

.form-textarea {
  @apply resize-y min-h-[100px];
}

.form-actions {
  @apply flex gap-3 justify-end mt-2;
}

.quest-banner {
  @apply flex items-center gap-2 px-4 py-3 mb-5;
  @apply bg-strahd-burgundy/30 border-2 border-strahd-gold/50 rounded-lg;
}

.quest-icon {
  @apply text-xl;
}

.quest-text {
  @apply text-strahd-gold font-semibold text-sm;
}

.description-section {
  @apply mb-5;
}

.description-section:last-child {
  @apply mb-0;
}

.section-title {
  @apply text-sm font-semibold text-strahd-gold uppercase tracking-wide mb-2;
}

.description-text {
  @apply text-gray-300 leading-relaxed text-base whitespace-pre-wrap;
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

.read-aloud-input {
  font-style: italic;
  text-align: center;
}

.dm-note-input {
  font-weight: bold;
}

.modal-footer {
  @apply px-6 py-4 border-t border-strahd-red/30 flex gap-3;
}

.spacer {
  @apply flex-1;
}

.btn-primary {
  @apply px-6 py-2.5 bg-strahd-red text-white rounded-lg font-semibold;
  @apply hover:bg-strahd-blood transition-all duration-200;
}

.btn-secondary {
  @apply px-6 py-2.5 bg-strahd-dark border-2 border-strahd-red text-strahd-gold rounded-lg font-semibold;
  @apply hover:bg-strahd-burgundy hover:border-strahd-gold transition-all duration-200;
}

.btn-danger {
  @apply px-6 py-2.5 bg-red-700 text-white rounded-lg font-semibold;
  @apply hover:bg-red-800 transition-all duration-200;
}

.btn-navigate {
  @apply px-6 py-2.5 bg-strahd-gold text-strahd-dark rounded-lg font-semibold;
  @apply hover:bg-yellow-500 transition-all duration-200;
  @apply flex items-center gap-2;
}

/* Transition animations */
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
