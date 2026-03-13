<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useDecisionNodeStore } from '../../stores/decisionNodeStore';
import { useCampaignStore } from '../../stores/campaignStore';
import { useSectionStore } from '../../stores/sectionStore';

const decisionNodeStore = useDecisionNodeStore();
const campaignStore = useCampaignStore();
const sectionStore = useSectionStore();

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  questId: {
    type: String,
    required: true
  },
  parentNodeId: {
    type: String,
    default: null
  },
  node: {
    type: Object,
    default: null
  },
  position: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'created', 'updated']);

const isEditMode = computed(() => !!props.node);

const formData = ref({
  title: '',
  description: '',
  nodeType: 'decision',
  readAloud: '',
  dmNote: '',
  consequences: '',
  section: 'Unsorted'
});

const nodeTypes = [
  { value: 'decision', label: 'Decision 🔀', description: 'Player makes a choice' },
  { value: 'outcome', label: 'Outcome 🎯', description: 'Result of a decision' },
  { value: 'event', label: 'Event 📜', description: 'Story event or description' }
];

const sections = computed(() => {
  // Get sections from the section store
  const storeSections = sectionStore.sections.map(s => s.name);
  
  // Also get unique sections from existing nodes (for backwards compatibility)
  const nodeSections = new Set(
    decisionNodeStore.nodes.map(n => n.section || 'Unsorted')
  );
  
  // Combine both, remove duplicates, and sort
  const allSections = new Set([...storeSections, ...nodeSections]);
  return Array.from(allSections).sort();
});

// Fetch sections when modal opens
watch(() => props.show, (isShown) => {
  if (isShown && props.questId) {
    sectionStore.fetchSectionsByQuest(props.questId);
    
    // Populate form if editing
    if (props.node) {
      formData.value = {
        title: props.node.title,
        description: props.node.description,
        nodeType: props.node.nodeType,
        readAloud: props.node.readAloud || '',
        dmNote: props.node.dmNote || '',
        consequences: props.node.consequences || '',
        section: props.node.section || 'Unsorted'
      };
    } else {
      // Reset form for create mode
      formData.value = {
        title: '',
        description: '',
        nodeType: 'decision',
        readAloud: '',
        dmNote: '',
        consequences: '',
        section: 'Unsorted'
      };
    }
  }
});

const showNewSectionInput = ref(false);
const newSectionName = ref('');

async function addNewSection() {
  if (newSectionName.value.trim()) {
    try {
      // Create the section in the database
      await sectionStore.createSection({
        name: newSectionName.value.trim(),
        questId: props.questId,
        campaignId: campaignStore.activeCampaign._id,
        description: '',
        order: sectionStore.sections.length
      });
      
      // Refresh sections to update the dropdown
      await sectionStore.fetchSectionsByQuest(props.questId);
      
      // Set the newly created section as selected
      formData.value.section = newSectionName.value.trim();
      newSectionName.value = '';
      showNewSectionInput.value = false;
    } catch (error) {
      console.error('Error creating section:', error);
    }
  }
}

const isValid = computed(() => {
  return formData.value.title.trim();
});

async function handleSubmit() {
  if (!isValid.value || !campaignStore.activeCampaign) return;

  try {
    if (isEditMode.value) {
      // Update existing node
      await decisionNodeStore.updateNode(props.node._id, formData.value);
      emit('updated');
    } else {
      // Create new node
      const nodeData = {
        ...formData.value,
        questId: props.questId,
        campaignId: campaignStore.activeCampaign._id,
        nextNodes: [],
        position: props.position || { x: 0, y: 0 }
      };

      const newNode = await decisionNodeStore.createNode(nodeData);
      
      // If there's a parent node, connect them
      if (props.parentNodeId) {
        const parentNode = decisionNodeStore.nodes.find(n => n._id === props.parentNodeId);
        if (parentNode) {
          const updatedNextNodes = [...(parentNode.nextNodes || []), newNode._id];
          await decisionNodeStore.updateNode(props.parentNodeId, {
            nextNodes: updatedNextNodes
          });
        }
      }

      emit('created', newNode);
    }
    
    handleClose();
  } catch (error) {
    console.error('Error saving node:', error);
  }
}

function handleClose() {
  formData.value = {
    title: '',
    description: '',
    nodeType: 'decision',
    readAloud: '',
    dmNote: '',
    consequences: '',
    section: 'Unsorted'
  };
  showNewSectionInput.value = false;
  newSectionName.value = '';
  emit('close');
}
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="text-2xl font-bold text-strahd-red">
          {{ isEditMode ? 'Edit Decision Node' : 'Create Decision Node' }}
        </h2>
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
            placeholder="Enter node title"
            autocomplete="off"
            required
          />
        </div>

        <div class="form-group">
          <label>Node Type *</label>
          <div class="node-type-grid">
            <label 
              v-for="type in nodeTypes" 
              :key="type.value"
              class="node-type-option"
              :class="{ selected: formData.nodeType === type.value }"
            >
              <input 
                type="radio" 
                :value="type.value" 
                v-model="formData.nodeType"
                class="hidden" autocomplete="off">
              <div class="node-type-label">{{ type.label }}</div>
              <div class="node-type-desc">{{ type.description }}</div>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Section</label>
          <div v-if="!showNewSectionInput" class="section-select-container">
            <select v-model="formData.section" class="section-select">
              <option v-for="section in sections" :key="section" :value="section">
                {{ section }}
              </option>
            </select>
            <button 
              type="button" 
              @click="showNewSectionInput = true"
              class="btn-new-section"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span>New Section</span>
            </button>
          </div>
          <div v-else>
            <label class="sub-label">Create New Section</label>
            <div class="new-section-input">
              <input 
                v-model="newSectionName"
                type="text"
                placeholder="Enter section name (e.g., Floor 1)"
                @keyup.enter="addNewSection"
                class="section-name-input" autocomplete="off">
              <button type="button" @click="addNewSection" class="btn-add">Add</button>
              <button type="button" @click="showNewSectionInput = false; newSectionName = ''" class="btn-cancel-small">Cancel</button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea 
            v-model="formData.description" 
            placeholder="Enter node description (optional)"
            rows="3"
           autocomplete="off"></textarea>
        </div>

        <div class="form-group">
          <label>Read Aloud Text (Optional)</label>
          <textarea 
            v-model="formData.readAloud" 
            placeholder="Text to read to players"
            rows="3"
           autocomplete="off"></textarea>
        </div>

        <div class="form-group">
          <label>DM Notes (Optional)</label>
          <textarea 
            v-model="formData.dmNote" 
            placeholder="Private notes for the DM"
            rows="2"
           autocomplete="off"></textarea>
        </div>

        <div class="form-group">
          <label>Consequences (Optional)</label>
          <textarea 
            v-model="formData.consequences" 
            placeholder="What happens as a result"
            rows="2"
           autocomplete="off"></textarea>
        </div>

        <div v-if="parentNodeId" class="info-box">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <span>This node will be connected to the selected parent node</span>
        </div>

        <div class="modal-footer">
          <button type="button" @click="handleClose" class="btn-cancel">
            Cancel
          </button>
          <button type="submit" :disabled="!isValid" class="btn-submit">
            {{ isEditMode ? 'Update Node' : 'Create Node' }}
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
  max-width: 700px;
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

label {
  display: block;
  color: #d4af37;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.sub-label {
  display: block;
  color: #d4af37;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.9;
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

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #8b0000;
  box-shadow: 0 0 10px rgba(139, 0, 0, 0.3);
}

textarea {
  resize: vertical;
  font-family: inherit;
}

select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d4af37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25rem;
  padding-right: 2.5rem;
}

select option {
  background: #0d0d0d;
  color: #e0e0e0;
  padding: 0.5rem;
}

.node-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.node-type-option {
  background: #0d0d0d;
  border: 2px solid #d4af37;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.node-type-option:hover {
  border-color: #8b0000;
  background: rgba(139, 0, 0, 0.1);
}

.node-type-option.selected {
  border-color: #8b0000;
  background: rgba(139, 0, 0, 0.2);
  box-shadow: 0 0 15px rgba(139, 0, 0, 0.3);
}

.node-type-label {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
  color: #e0e0e0;
}

.node-type-desc {
  font-size: 0.75rem;
  color: #999;
}

.info-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid #d4af37;
  border-radius: 6px;
  padding: 0.75rem;
  color: #d4af37;
  font-size: 0.875rem;
  margin-bottom: 1rem;
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

.section-select-container {
  display: flex;
  flex-direction: column;
}

.section-select {
  width: 100%;
  display: block;
}

.section-select + .btn-new-section {
  margin-top: 1rem;
}

.btn-new-section {
  display: block !important;
  width: 100%;
  text-align: center;
  padding: 0.625rem 1rem;
  background: transparent;
  border: 1px solid #d4af37;
  color: #d4af37;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-new-section svg {
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.5rem;
}

.btn-new-section span {
  display: inline-block;
  vertical-align: middle;
}

.btn-new-section:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: #d4af37;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
}

.new-section-input {
  display: flex;
  gap: 0.75rem;
  align-items: stretch;
  margin-top: 1rem;
}

.section-name-input {
  flex: 1;
}

.btn-add, .btn-cancel-small {
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  border: none;
  min-width: 80px;
}

.btn-add {
  background: #8b0000;
  color: white;
}

.btn-add:hover {
  background: #a00000;
  box-shadow: 0 0 10px rgba(139, 0, 0, 0.5);
}

.btn-cancel-small {
  background: transparent;
  border: 1px solid #666;
  color: #999;
}

.btn-cancel-small:hover {
  border-color: #d4af37;
  color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
}
</style>