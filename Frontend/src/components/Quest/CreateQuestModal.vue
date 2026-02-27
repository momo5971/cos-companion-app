<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useQuestStore } from '../../stores/questStore';
import { useCampaignStore } from '../../stores/campaignStore';
import { useLocationStore } from '../../stores/locationStore';
import { useQuestSectionStore } from '../../stores/questSectionStore';

const questStore = useQuestStore();
const campaignStore = useCampaignStore();
const locationStore = useLocationStore();
const questSectionStore = useQuestSectionStore();

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  quest: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'created', 'updated']);

const formData = ref({
  title: '',
  description: '',
  section: '',
  location: '',
  levelRequirement: 1,
  status: 'available'
});

const newLocationData = ref({
  name: '',
  type: '',
  description: ''
});

const showNewLocationForm = ref(false);

onMounted(() => {
  if (campaignStore.activeCampaign?._id) {
    questSectionStore.fetchSections(campaignStore.activeCampaign._id);
  }
});

// Function to populate form data
function populateForm() {
  if (props.quest) {
    formData.value = {
      title: props.quest.title,
      description: props.quest.description,
      section: props.quest.section?._id || '',
      location: props.quest.location?._id || '',
      levelRequirement: props.quest.levelRequirement || 1,
      status: props.quest.status || 'available'
    };
  } else {
    formData.value = {
      title: '',
      description: '',
      section: '',
      location: '',
      levelRequirement: 1,
      status: 'available'
    };
  }
}

// Watch for modal opening to populate/reset form
watch(() => props.show, (isShowing) => {
  if (isShowing) {
    populateForm();
  }
});
const locationTypes = [
  'world',
  'region',
  'city',
  'village',
  'settlement',
  'dungeon',
  'cave',
  'building',
  'temple',
  'landmark'
];

const isValid = computed(() => {
  return formData.value.title.trim() && 
         formData.value.description.trim();
});

const isNewLocationValid = computed(() => {
  return newLocationData.value.name.trim() && 
         newLocationData.value.type.trim() &&
         newLocationData.value.description.trim();
});

function handleLocationChange(event) {
  if (event.target.value === '__create_new__') {
    showNewLocationForm.value = true;
    formData.value.location = '';
  } else {
    showNewLocationForm.value = false;
  }
}

async function createNewLocation() {
  if (!isNewLocationValid.value || !campaignStore.activeCampaign) return;

  try {
    const locationData = {
      ...newLocationData.value,
      campaignId: campaignStore.activeCampaign._id
    };

    const newLocation = await locationStore.createLocation(locationData);
    formData.value.location = newLocation._id;
    showNewLocationForm.value = false;
    
    // Reset new location form
    newLocationData.value = {
      name: '',
      type: '',
      description: ''
    };
  } catch (error) {
    console.error('Error creating location:', error);
  }
}

async function handleSubmit() {
  if (!isValid.value || !campaignStore.activeCampaign) return;

  try {
    const questData = {
      ...formData.value,
      campaignId: campaignStore.activeCampaign._id,
      location: formData.value.location || null,
      section: formData.value.section || null
    };

    if (props.quest) {
      // Update existing quest
      await questStore.updateQuest(props.quest._id, questData);
      emit('updated');
    } else {
      // Create new quest
      await questStore.createQuest(questData);
      emit('created');
    }
    
    handleClose();
  } catch (error) {
    console.error('Error saving quest:', error);
  }
}

function handleClose() {
  formData.value = {
    title: '',
    description: '',
    section: '',
    location: '',
    levelRequirement: 1,
    status: 'available'
  };
  newLocationData.value = {
    name: '',
    type: '',
    description: ''
  };
  showNewLocationForm.value = false;
  emit('close');
}
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="text-2xl font-bold text-strahd-red">{{ quest ? 'Edit Quest' : 'Create New Quest' }}</h2>
        <button @click="handleClose" class="close-btn">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label>Title *</label>
          <input 
            v-model="formData.title" 
            type="text" 
            placeholder="Enter quest title"
            required autocomplete="off">
        </div>

        <div class="form-group">
          <label>Description *</label>
          <textarea 
            v-model="formData.description" 
            placeholder="Enter quest description"
            rows="4"
            required autocomplete="off"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Section (Optional)</label>
            <select v-model="formData.section">
              <option value="">No section</option>
              <option 
                v-for="section in questSectionStore.sections" 
                :key="section._id" 
                :value="section._id"
              >
                {{ section.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Level Requirement</label>
            <input 
              v-model.number="formData.levelRequirement" 
              type="number" 
              min="1" 
              max="20" autocomplete="off">
          </div>
        </div>

        <div class="form-group">
          <label>Location (Optional)</label>
          <select v-model="formData.location" @change="handleLocationChange">
            <option value="">No location</option>
            <option value="__create_new__">+ Create New Location</option>
            <option 
              v-for="location in locationStore.locations" 
              :key="location._id" 
              :value="location._id"
            >
              {{ location.name }}
            </option>
          </select>
        </div>

        <!-- New Location Form -->
        <div v-if="showNewLocationForm" class="new-location-form">
          <h3 class="text-lg font-semibold text-strahd-gold mb-3">Create New Location</h3>
          
          <div class="form-group">
            <label>Location Name *</label>
            <input 
              v-model="newLocationData.name" 
              type="text" 
              placeholder="e.g., Death House"
              autocomplete="off"
            >
          </div>

          <div class="form-group">
            <label>Location Type *</label>
            <select v-model="newLocationData.type">
              <option value="">Select type</option>
              <option v-for="type in locationTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Location Description *</label>
            <textarea 
              v-model="newLocationData.description" 
              placeholder="Describe the location"
              rows="3"
             autocomplete="off"></textarea>
          </div>

          <div class="flex gap-2">
            <button 
              type="button" 
              @click="createNewLocation" 
              :disabled="!isNewLocationValid"
              class="btn-create-location"
            >
              Create Location
            </button>
            <button 
              type="button" 
              @click="showNewLocationForm = false; formData.location = ''"
              class="btn-cancel-location"
            >
              Cancel
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" @click="handleClose" class="btn-cancel">
            Cancel
          </button>
          <button type="submit" :disabled="!isValid" class="btn-submit">
            {{ quest ? 'Update Quest' : 'Create Quest' }}
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
  background: linear-gradient(to bottom right, #1a1a1a, #0d0d0d);
  border: 2px solid #8b0000;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 0 30px rgba(139, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #d4af37;
}

.close-btn {
  background: none;
  border: none;
  color: #d4af37;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #8b0000;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  display: block;
  color: #d4af37;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

input, textarea, select {
  width: 100%;
  background: #0d0d0d;
  border: 1px solid #d4af37;
  border-radius: 6px;
  padding: 0.75rem;
  color: #e0e0e0;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

/* Remove scroll wheel from number inputs */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #8b0000;
}

textarea {
  resize: vertical;
  font-family: inherit;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #d4af37;
}

.btn-cancel, .btn-submit {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: transparent;
  border: 1px solid #d4af37;
  color: #d4af37;
}

.btn-cancel:hover {
  background: rgba(212, 175, 55, 0.1);
}

.btn-submit {
  background: #8b0000;
  border: 1px solid #8b0000;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #a00000;
  box-shadow: 0 0 15px rgba(139, 0, 0, 0.5);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.new-location-form {
  background: rgba(139, 0, 0, 0.1);
  border: 1px solid #d4af37;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.btn-create-location {
  flex: 1;
  padding: 0.5rem 1rem;
  background: #d4af37;
  border: 1px solid #d4af37;
  color: #0d0d0d;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create-location:hover:not(:disabled) {
  background: #e5c047;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
}

.btn-create-location:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel-location {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #666;
  color: #999;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-location:hover {
  border-color: #d4af37;
  color: #d4af37;
}
</style>
