<script setup>
import { ref, computed, watch } from "vue";
import { useSectionStore } from "../../stores/sectionStore";
import { useCampaignStore } from "../../stores/campaignStore";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  questId: {
    type: String,
    required: true,
  },
  section: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "created", "updated"]);

const sectionStore = useSectionStore();
const campaignStore = useCampaignStore();

const formData = ref({
  name: "",
  description: "",
});

const isSubmitting = ref(false);
const isEditMode = computed(() => !!props.section);

// Watch for section prop changes to populate form in edit mode
watch(() => props.section, (newSection) => {
  if (newSection) {
    formData.value = {
      name: newSection.name || "",
      description: newSection.description || "",
    };
  } else {
    formData.value = {
      name: "",
      description: "",
    };
  }
}, { immediate: true });

async function handleSubmit() {
  if (!formData.value.name.trim()) {
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      // Update existing section
      await sectionStore.updateSection(props.section._id, formData.value);
      emit("updated");
    } else {
      // Create new section
      await sectionStore.createSection({
        ...formData.value,
        questId: props.questId,
        campaignId: campaignStore.activeCampaign._id,
      });
      emit("created");
    }

    // Reset form
    formData.value = {
      name: "",
      description: "",
    };
  } catch (error) {
    console.error(`Error ${isEditMode.value ? 'updating' : 'creating'} section:`, error);
  } finally {
    isSubmitting.value = false;
  }
}

function handleClose() {
  formData.value = {
    name: "",
    description: "",
  };
  emit("close");
}
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="font-cinzel text-strahd-gold">
          {{ isEditMode ? 'Edit Section' : 'Create New Section' }}
        </h2>
        <button @click="handleClose" class="close-btn">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label for="name">Section Name *</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            placeholder="e.g., Main Hall, Upper Floor, Basement"
            required autocomplete="off">
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="3"
            placeholder="Optional description of this section"
            autocomplete="off"
          ></textarea>
        </div>

        <div class="modal-footer">
          <button type="button" @click="handleClose" class="btn-secondary">
            Cancel
          </button>
          <button type="submit" :disabled="isSubmitting" class="btn-primary">
            {{ isSubmitting ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Section" : "Create Section") }}
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
.form-group textarea {
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
.form-group textarea:focus {
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
