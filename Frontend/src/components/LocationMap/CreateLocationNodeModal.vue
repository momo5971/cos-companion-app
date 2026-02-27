<script setup>
import { ref, watch, computed } from "vue";
import { useLocationStore } from "../../stores/locationStore";
import { useCampaignStore } from "../../stores/campaignStore";
import CreateLocationModal from "./CreateLocationModal.vue";

const locationStore = useLocationStore();
const campaignStore = useCampaignStore();

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  position: {
    type: Object,
    default: null,
  },
  currentLocationId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close", "create"]);

// Get sub-locations (locations that have this location as parent)
const subLocations = computed(() => {
  return locationStore.locations.filter(
    loc => loc.parentLocationId === props.currentLocationId
  );
});

const formData = ref({
  name: "",
  type: "info",
  description: "",
  readAloud: "",
  dmNote: "",
  linkedLocationId: null,
});

const isSubmitting = ref(false);
const isCreateSubLocationOpen = ref(false);

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    formData.value = {
      name: "",
      type: "info",
      description: "",
      readAloud: "",
      dmNote: "",
      linkedLocationId: null,
    };
  }
});

function openCreateSubLocationModal() {
  isCreateSubLocationOpen.value = true;
}

function closeCreateSubLocationModal() {
  isCreateSubLocationOpen.value = false;
}

async function handleCreateSubLocation(locationData) {
  try {
    const newLocation = await locationStore.createLocation(locationData);
    // Auto-select the newly created location
    formData.value.linkedLocationId = newLocation._id;
    closeCreateSubLocationModal();
  } catch (error) {
    console.error('Error creating sub-location:', error);
  }
}

async function handleSubmit() {
  if (!formData.value.name.trim()) {
    return;
  }

  isSubmitting.value = true;
  try {
    emit("create", {
      name: formData.value.name,
      type: formData.value.type,
      description: formData.value.description,
      readAloud: formData.value.readAloud,
      dmNote: formData.value.dmNote,
      linkedLocationId: formData.value.linkedLocationId || null,
      position: props.position,
    });

    // Reset form
    formData.value = {
      name: "",
      type: "info",
      description: "",
      readAloud: "",
      dmNote: "",
      linkedLocationId: null,
    };
  } catch (error) {
    console.error("Error creating node:", error);
  } finally {
    isSubmitting.value = false;
  }
}

function handleClose() {
  formData.value = {
    name: "",
    type: "info",
    description: "",
    readAloud: "",
    dmNote: "",
    linkedLocationId: null,
  };
  emit("close");
}
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="font-cinzel text-strahd-gold">Create Location Node</h2>
        <button @click="handleClose" class="close-btn">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label for="name">Node Name *</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            placeholder="e.g., Main Entrance, Secret Room, Treasure Vault"
            required
            autofocus
            autocomplete="off"
          >
        </div>

        <div v-if="!formData.linkedLocationId" class="form-group">
          <label for="type">Node Type *</label>
          <select id="type" v-model="formData.type" required>
            <option value="encounter">⚔️ Encounter - Combat/Enemy</option>
            <option value="npc">🎭 NPC - Character Interaction</option>
            <option value="treasure">💎 Treasure - Loot/Reward</option>
            <option value="objective">🎯 Objective - Quest Goal</option>
            <option value="secret">🗝️ Secret - Hidden Discovery</option>
            <option value="info">📜 Info - Lore/Clues</option>
          </select>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="4"
            placeholder="Describe what the players see or find here..."
            autocomplete="off"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="readAloud">Read Aloud</label>
          <textarea
            id="readAloud"
            v-model="formData.readAloud"
            rows="3"
            placeholder="Text to read aloud to players..."
            class="read-aloud-input"
            autocomplete="off"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="dmNote">DM Note</label>
          <textarea
            id="dmNote"
            v-model="formData.dmNote"
            rows="3"
            placeholder="Private notes for the DM..."
            class="dm-note-input"
            autocomplete="off"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="linkedLocation">Link to Sub-Location (Optional)</label>
          <div class="flex gap-2">
            <select id="linkedLocation" v-model="formData.linkedLocationId" class="flex-1">
              <option :value="null">None - Regular Node</option>
              <option v-for="location in subLocations" :key="location._id" :value="location._id">
                {{ location.name }} ({{ location.type }})
              </option>
            </select>
            <button
              type="button"
              @click="openCreateSubLocationModal"
              class="btn-create-sublocation"
              title="Create new sub-location"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-1">
            When clicked, this node will navigate to the selected sub-location
          </p>
        </div>

        <div class="modal-footer">
          <button type="button" @click="handleClose" class="btn-secondary">
            Cancel
          </button>
          <button type="submit" :disabled="isSubmitting" class="btn-primary">
            {{ isSubmitting ? "Creating..." : "Create Node" }}
          </button>
        </div>
      </form>
    </div>

    <!-- Create Sub-Location Modal -->
    <CreateLocationModal
      :show="isCreateSubLocationOpen"
      :parent-location-id="currentLocationId"
      @close="closeCreateSubLocationModal"
      @create="handleCreateSubLocation"
    />
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a2e;
  border: 2px solid #d4af37;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #d4af37;
}

.modal-header h2 {
  font-size: 1.5rem;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #d4af37;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #fff;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #d4af37;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-family: "Cinzel", serif;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  background: #0f0f1e;
  border: 1px solid #d4af37;
  border-radius: 6px;
  color: #e0e0e0;
  font-family: "Crimson Text", serif;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #8b0000;
  box-shadow: 0 0 10px rgba(139, 0, 0, 0.3);
}

.form-group textarea {
  resize: vertical;
}

.read-aloud-input {
  font-style: italic;
  text-align: center;
}

.dm-note-input {
  font-weight: bold;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #8b0000;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #a00000;
  box-shadow: 0 0 15px rgba(139, 0, 0, 0.5);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: #d4af37;
  border: 1px solid #d4af37;
}

.btn-secondary:hover {
  background: rgba(212, 175, 55, 0.1);
}

.btn-create-sublocation {
  padding: 0.75rem;
  border-radius: 6px;
  background: #8b0000;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-create-sublocation:hover {
  background: #a00000;
  box-shadow: 0 0 15px rgba(139, 0, 0, 0.5);
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
