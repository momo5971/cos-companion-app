<script setup>
import { ref, watch } from "vue";
import { useCampaignStore } from "../../stores/campaignStore";
import { computed } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  parentLocationId: {
    type: String,
    default: null,
  },
  location: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "create", "update"]);

const campaignStore = useCampaignStore();

const formData = ref({
  name: "",
  description: "",
  type: "dungeon",
});

const isSubmitting = ref(false);

const isEditMode = computed(() => !!props.location);

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.location) {
      // Edit mode - populate with existing data
      formData.value = {
        name: props.location.name || "",
        description: props.location.description || "",
        type: props.location.type || "dungeon",
      };
    } else {
      // Create mode - reset form
      formData.value = {
        name: "",
        description: "",
        type: "dungeon",
      };
    }
  }
});

async function handleSubmit() {
  if (!formData.value.name.trim() || (!isEditMode.value && !campaignStore.activeCampaign?._id)) {
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      // Update existing location
      emit("update", {
        name: formData.value.name,
        description: formData.value.description,
        type: formData.value.type,
      });
    } else {
      // Create new location
      emit("create", {
        name: formData.value.name,
        description: formData.value.description,
        type: formData.value.type,
        campaignId: campaignStore.activeCampaign?._id,
        parentLocationId: props.parentLocationId,
      });
    }

    // Reset form
    formData.value = {
      name: "",
      description: "",
      type: "dungeon",
    };
  } catch (error) {
    console.error(`Failed to ${isEditMode.value ? 'update' : 'create'} location:`, error);
  } finally {
    isSubmitting.value = false;
  }
}

function handleClose() {
  formData.value = {
    name: "",
    description: "",
    type: "dungeon",
  };
  emit("close");
}
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="font-cinzel text-strahd-gold">
          {{ location ? 'Edit Location' : (parentLocationId ? 'Create Sub-Location' : 'Create New Location') }}
        </h2>
        <button @click="handleClose" class="close-btn">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label for="name">Location Name *</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            placeholder="e.g., Castle Ravenloft, Village of Barovia"
            required
            autofocus autocomplete="off">
        </div>

        <div class="form-group">
          <label for="type">Location Type *</label>
          <select id="type" v-model="formData.type" required>
            <option value="world">World Map</option>
            <option value="region">Region</option>
            <option value="city">City</option>
            <option value="village">Village</option>
            <option value="settlement">Settlement</option>
            <option value="dungeon">Dungeon</option>
            <option value="cave">Cave</option>
            <option value="building">Building</option>
            <option value="temple">Temple</option>
            <option value="landmark">Landmark</option>
          </select>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="4"
            placeholder="Describe this location..."
            autocomplete="off"
          ></textarea>
        </div>

        <div class="modal-footer">
          <button type="button" @click="handleClose" class="btn-secondary">
            Cancel
          </button>
          <button type="submit" :disabled="isSubmitting" class="btn-primary">
            {{ isSubmitting ? (location ? "Updating..." : "Creating...") : (location ? "Update Location" : "Create Location") }}
          </button>
        </div>
      </form>
    </div>
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
</style>
