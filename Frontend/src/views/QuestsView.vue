<script setup>
import { onMounted, watch, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuestStore } from "../stores/questStore";
import { useQuestSectionStore } from "../stores/questSectionStore";
import { useCampaignStore } from "../stores/campaignStore";
import CreateQuestModal from "../components/Quest/CreateQuestModal.vue";
import { useCompendiumNavigation } from "../composables/useCompendiumNavigation";

const showCreateModal = ref(false);
const showCreateSectionModal = ref(false);
const newSectionName = ref("");
const newSectionDescription = ref("");

const router = useRouter();
const questStore = useQuestStore();
const questSectionStore = useQuestSectionStore();
const campaignStore = useCampaignStore();
const { navigateToCompendiumEntry } = useCompendiumNavigation();

onMounted(() => {
  const campaignId = campaignStore.activeCampaign?._id;
  if (campaignId) {
    questStore.fetchQuests(campaignId);
    questSectionStore.fetchSections(campaignId);
  } else {
    questStore.$patch({ quests: [] });
    questSectionStore.$patch({ sections: [] });
  }
});

watch(
  () => campaignStore.activeCampaign,
  (newCampaign) => {
    if (newCampaign?._id) {
      questStore.fetchQuests(newCampaign._id);
      questSectionStore.fetchSections(newCampaign._id);
    } else {
      questStore.$patch({ quests: [] });
      questSectionStore.$patch({ sections: [] });
    }
  },
);

// Get unique locations in a section
function getLocationsInSection(sectionId) {
  const quests = questStore.quests.filter((q) => q.section?._id === sectionId);

  const locations = quests.map((q) => q.location).filter((loc) => loc != null);

  const uniqueLocations = [];
  const seenIds = new Set();

  for (const loc of locations) {
    if (!seenIds.has(loc._id)) {
      seenIds.add(loc._id);
      uniqueLocations.push(loc);
    }
  }
  return uniqueLocations;
}

function getQuestsInLocation(sectionId, location) {
  return questStore.quests.filter(
    (q) => q.section?._id === sectionId && q.location?._id === location?._id,
  );
}

function getQuestsWithoutLocation(sectionId) {
  return questStore.quests.filter(
    (q) => q.section?._id === sectionId && !q.location,
  );
}

function getQuestsWithoutSection() {
  return questStore.quests.filter((q) => !q.section);
}

function getQuestStatus(questId) {
  if (!campaignStore.hasActiveCampaign) {
    return "locked";
  }

  const campaign = campaignStore.activeCampaign;

  if (campaign.completedQuests?.includes(questId)) {
    return "completed";
  }

  if (campaign.activeQuests?.includes(questId)) {
    return "in-progress";
  }

  return "available";
}

function getStatusClass(status) {
  const classes = {
    available: "border-green-500",
    "in-progress": "border-blue-500",
    completed: "border-gray-500",
    locked: "border-red-500 opacity-60",
  };
  return classes[status] || "border-gray-500";
}

function getStatusBadgeClass(status) {
  const classes = {
    available: "bg-green-900 text-green-100",
    "in-progress": "bg-blue-900 text-blue-100",
    completed: "bg-gray-700 text-gray-300",
    locked: "bg-red-900 text-red-100",
  };
  return classes[status] || "bg-gray-700 text-gray-300";
}

function goToQuestDetail(questId) {
  router.push(`/quests/${questId}`);
}

function openQuestInCompendium(quest, event) {
  event.stopPropagation();
  navigateToCompendiumEntry(quest.title, 'Quest');
}

async function deleteQuest(questId, event) {
  event.stopPropagation();
  
  try {
    await questStore.deleteQuest(questId);
    if (campaignStore.activeCampaign?._id) {
      await questStore.fetchQuests(campaignStore.activeCampaign._id);
    }
  } catch (error) {
    console.error('Error deleting quest:', error);
  }
}

async function createSection() {
  if (!newSectionName.value.trim() || !campaignStore.activeCampaign) return;

  try {
    await questSectionStore.createSection({
      name: newSectionName.value,
      description: newSectionDescription.value,
      campaignId: campaignStore.activeCampaign._id,
      order: questSectionStore.sections.length,
    });
    newSectionName.value = "";
    newSectionDescription.value = "";
    showCreateSectionModal.value = false;
  } catch (error) {
    console.error('Error creating section:', error);
  }
}

async function deleteSection(sectionId, event) {
  event.stopPropagation();
  
  try {
    await questSectionStore.deleteSection(sectionId);
  } catch (error) {
    console.error('Error deleting section:', error);
  }
}

// Drag and drop functionality
const draggedQuest = ref(null);

function handleDragStart(quest, event) {
  draggedQuest.value = quest;
  event.dataTransfer.effectAllowed = 'move';
  event.target.style.opacity = '0.5';
}

function handleDragEnd(event) {
  event.target.style.opacity = '1';
  draggedQuest.value = null;
}

function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

async function handleDrop(sectionId, event) {
  event.preventDefault();
  
  if (!draggedQuest.value) return;
  
  const currentSectionId = draggedQuest.value.section?._id || null;
  
  // Don't do anything if dropping in the same section
  if (currentSectionId === sectionId) return;
  
  try {
    await questStore.updateQuest(draggedQuest.value._id, {
      ...draggedQuest.value,
      section: sectionId,
    });
    
    // Refresh quests
    if (campaignStore.activeCampaign?._id) {
      await questStore.fetchQuests(campaignStore.activeCampaign._id);
    }
  } catch (error) {
    console.error('Error moving quest:', error);
  }
}
</script>

<template>
  <div class="animate-fade-in">
    <!-- Page Header -->
    <div class="relative mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
      <div>
        <h2 class="text-3xl sm:text-4xl font-bold text-strahd-red text-glow-red">Quests</h2>
        <div
          class="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-strahd-red to-transparent"
        ></div>
        <p class="text-strahd-gold text-sm mt-3 opacity-80">
          Track your journey through Barovia
        </p>
      </div>
      <div class="flex gap-2">
        <button 
          @click="showCreateSectionModal = true"
          class="create-section-btn"
          :disabled="!campaignStore.hasActiveCampaign"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          New Section
        </button>
        <button 
          @click="showCreateModal = true"
          class="create-btn"
          :disabled="!campaignStore.hasActiveCampaign"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Create Quest
        </button>
      </div>
    </div>

    <!-- Create Section Modal -->
    <div v-if="showCreateSectionModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="text-2xl font-bold text-strahd-red">Create New Section</h2>
          <button @click="showCreateSectionModal = false" class="close-btn">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Section Name *</label>
            <input 
              v-model="newSectionName" 
              type="text" 
              placeholder="e.g., Act I, Chapter 1, Main Story"
              autocomplete="off"
            >
          </div>
          <div class="form-group">
            <label>Description (Optional)</label>
            <textarea 
              v-model="newSectionDescription" 
              placeholder="Brief description of this section"
              rows="3"
              autocomplete="off"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button @click="showCreateSectionModal = false" class="btn-cancel">Cancel</button>
            <button @click="createSection" :disabled="!newSectionName.trim()" class="btn-submit">Create Section</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Quest Modal -->
    <CreateQuestModal 
      :show="showCreateModal" 
      @close="showCreateModal = false"
      @created="questStore.fetchQuests(campaignStore.activeCampaign._id)"
    />

    <!-- Loading State -->
    <div
      v-if="questStore.loading"
      class="flex flex-col items-center justify-center py-16"
    >
      <svg
        class="w-12 h-12 text-strahd-red animate-spin mb-4"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p class="text-xl text-strahd-gold">Loading quests...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="questStore.error"
      class="bg-strahd-burgundy/30 border-2 border-strahd-red text-red-100 px-6 py-4 rounded-lg shadow-glow-red"
    >
      <div class="flex items-center gap-3">
        <svg
          class="w-6 h-6 text-strahd-red"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <div>
          <p class="font-bold text-lg">Error Loading Quests</p>
          <p class="text-sm opacity-90">{{ questStore.error }}</p>
        </div>
      </div>
    </div>

    <!-- Quests by Section -->
    <div v-else class="space-y-8">
      <div 
        v-for="section in questSectionStore.sections" 
        :key="section._id" 
        class="act-section animate-slide-up drop-zone"
        @dragover="handleDragOver"
        @drop="handleDrop(section._id, $event)"
      >
        <!-- Section Header -->
        <div class="relative mb-6 flex justify-between items-center">
          <div>
            <h3 class="text-3xl font-bold text-strahd-red text-glow-red">
              {{ section.name }}
            </h3>
            <p v-if="section.description" class="text-gray-400 text-sm mt-1">{{ section.description }}</p>
            <div class="absolute -bottom-1 left-0 w-16 h-0.5 bg-strahd-red"></div>
          </div>
          <button
            @click="deleteSection(section._id, $event)"
            class="delete-section-btn"
            title="Delete section"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>

        <!-- Locations within Section -->
        <div
          v-for="location in getLocationsInSection(section._id)"
          :key="location"
          class="location-section mb-8"
        >
          <!-- Location Header -->
          <div class="flex items-center gap-3 mb-4">
            <svg
              class="w-5 h-5 text-strahd-gold"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clip-rule="evenodd"
              />
            </svg>
            <h4 class="text-xl font-semibold text-strahd-gold">
              {{ location?.name || "Unknown Location" }}
            </h4>
          </div>

          <!-- Quests in Location -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="quest in getQuestsInLocation(section._id, location)"
              :key="quest._id"
              class="quest-card group"
              :class="getStatusClass(getQuestStatus(quest._id))"
              draggable="true"
              @dragstart="handleDragStart(quest, $event)"
              @dragend="handleDragEnd"
              @click="goToQuestDetail(quest._id)"
            >
              <!-- Quest Icon -->
              <div
                class="absolute -top-3 -right-3 w-10 h-10 bg-strahd-dark border-2 border-current rounded-full flex items-center justify-center shadow-lg"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fill-rule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>

              <!-- Delete Button -->
              <button
                @click="deleteQuest(quest._id, $event)"
                class="delete-quest-btn"
                title="Delete quest"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>

              <h5
                class="text-lg font-bold mb-2 group-hover:text-strahd-gold transition-colors"
              >
                <span class="quest-title-link" @click.stop="openQuestInCompendium(quest, $event)">{{ quest.title }}</span></h5>
              <p class="text-sm text-gray-300 mb-4 line-clamp-2">
                {{ quest.description }}
              </p>

              <div class="flex justify-between items-center mt-auto">
                <span
                  class="status-badge"
                  :class="getStatusBadgeClass(getQuestStatus(quest._id))"
                >
                  {{ getQuestStatus(quest._id) }}
                </span>
                <span
                  v-if="quest.levelRequirement"
                  class="text-xs text-strahd-gold font-semibold flex items-center gap-1"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                  Level {{ quest.levelRequirement }}
                </span>
              </div>

              <!-- Hover indicator -->
              <div
                class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  class="w-5 h-5 text-strahd-gold"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Quests without Location -->
        <div
          v-if="getQuestsWithoutLocation(section._id).length > 0"
          class="location-section mb-8"
        >
          <!-- No Location Header -->
          <div class="flex items-center gap-3 mb-4">
            <svg
              class="w-5 h-5 text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <h4 class="text-xl font-semibold text-gray-500">
              No Location
            </h4>
          </div>

          <!-- Quests without Location -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="quest in getQuestsWithoutLocation(section._id)"
              :key="quest._id"
              class="quest-card group"
              :class="getStatusClass(getQuestStatus(quest._id))"
              draggable="true"
              @dragstart="handleDragStart(quest, $event)"
              @dragend="handleDragEnd"
              @click="goToQuestDetail(quest._id)"
            >
              <!-- Quest Icon -->
              <div
                class="absolute -top-3 -right-3 w-10 h-10 bg-strahd-dark border-2 border-current rounded-full flex items-center justify-center shadow-lg"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fill-rule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>

              <!-- Delete Button -->
              <button
                @click="deleteQuest(quest._id, $event)"
                class="delete-quest-btn"
                title="Delete quest"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>

              <h5
                class="text-lg font-bold mb-2 group-hover:text-strahd-gold transition-colors"
              >
                <span class="quest-title-link" @click.stop="openQuestInCompendium(quest, $event)">{{ quest.title }}</span></h5>
              <p class="text-sm text-gray-300 mb-4 line-clamp-2">
                {{ quest.description }}
              </p>

              <div class="flex justify-between items-center mt-auto">
                <span
                  class="status-badge"
                  :class="getStatusBadgeClass(getQuestStatus(quest._id))"
                >
                  {{ getQuestStatus(quest._id) }}
                </span>
                <span
                  v-if="quest.levelRequirement"
                  class="text-xs text-strahd-gold font-semibold flex items-center gap-1"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                  Level {{ quest.levelRequirement }}
                </span>
              </div>

              <!-- Hover indicator -->
              <div
                class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  class="w-5 h-5 text-strahd-gold"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quests without Section -->
      <div 
        v-if="getQuestsWithoutSection().length > 0" 
        class="act-section animate-slide-up drop-zone"
        @dragover="handleDragOver"
        @drop="handleDrop(null, $event)"
      >
        <div class="relative mb-6">
          <h3 class="text-3xl font-bold text-gray-500">
            No Section
          </h3>
          <div class="absolute -bottom-1 left-0 w-16 h-0.5 bg-gray-500"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="quest in getQuestsWithoutSection()"
            :key="quest._id"
            class="quest-card group"
            :class="getStatusClass(getQuestStatus(quest._id))"
            draggable="true"
            @dragstart="handleDragStart(quest, $event)"
            @dragend="handleDragEnd"
            @click="goToQuestDetail(quest._id)"
          >
            <!-- Quest Icon -->
            <div
              class="absolute -top-3 -right-3 w-10 h-10 bg-strahd-dark border-2 border-current rounded-full flex items-center justify-center shadow-lg"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fill-rule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>

            <!-- Delete Button -->
            <button
              @click="deleteQuest(quest._id, $event)"
              class="delete-quest-btn"
              title="Delete quest"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>

              <h5
              class="text-lg font-bold mb-2 group-hover:text-strahd-gold transition-colors"
            >
              <span class="quest-title-link" @click.stop="openQuestInCompendium(quest, $event)">{{ quest.title }}</span></h5>
            <p class="text-sm text-gray-300 mb-4 line-clamp-2">
              {{ quest.description }}
            </p>

            <div class="flex justify-between items-center mt-auto">
              <span
                class="status-badge"
                :class="getStatusBadgeClass(getQuestStatus(quest._id))"
              >
                {{ getQuestStatus(quest._id) }}
              </span>
              <span
                v-if="quest.levelRequirement"
                class="text-xs text-strahd-gold font-semibold flex items-center gap-1"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
                Level {{ quest.levelRequirement }}
              </span>
            </div>

            <!-- Hover indicator -->
            <div
              class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg
                class="w-5 h-5 text-strahd-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.act-section {
  @apply bg-gradient-to-br from-strahd-dark to-strahd-darker;
  @apply border-2 border-strahd-red/30 rounded-xl p-4 sm:p-8 shadow-xl;
  @apply transition-all duration-300;
}

.act-section:hover {
  border-color: rgba(220, 38, 38, 0.5);
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.5);
}

.location-section {
  @apply ml-2 sm:ml-6 pl-4 sm:pl-6 border-l-2 border-strahd-gold/30;
}

.quest-card {
  @apply relative bg-strahd-darker border-2 rounded-lg p-6 cursor-pointer;
  @apply transition-all duration-300 flex flex-col shadow-xl;
  min-height: 180px;
  cursor: grab;
}

.quest-card:active {
  cursor: grabbing;
}

.quest-card:hover {
  transform: translateY(-8px);
}

.drop-zone {
  transition: all 0.3s ease;
}

.drop-zone:has(.quest-card:hover) {
  background: rgba(139, 0, 0, 0.05);
}

.drop-zone.drag-over {
  background: rgba(212, 175, 55, 0.1);
  border-color: rgba(212, 175, 55, 0.5);
}

/* Status-specific styling */
.quest-card.border-green-500 {
  border-color: rgba(34, 197, 94, 0.5);
}

.quest-card.border-green-500:hover {
  border-color: rgb(34, 197, 94);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

.quest-card.border-blue-500 {
  border-color: rgba(59, 130, 246, 0.5);
}

.quest-card.border-blue-500:hover {
  border-color: rgb(59, 130, 246);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.quest-card.border-gray-500 {
  border-color: rgba(107, 114, 128, 0.5);
}

.quest-card.border-gray-500:hover {
  border-color: rgb(107, 114, 128);
  box-shadow: 0 0 20px rgba(107, 114, 128, 0.3);
}

.quest-card.border-red-500 {
  border-color: rgba(239, 68, 68, 0.5);
}

.quest-card.border-red-500:hover {
  border-color: rgba(239, 68, 68, 0.7);
}

.status-badge {
  @apply px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider;
  @apply border transition-all duration-200;
}

.status-badge.bg-green-900 {
  @apply bg-green-900/50 text-green-300 border-green-700/50;
}

.status-badge.bg-blue-900 {
  @apply bg-blue-900/50 text-blue-300 border-blue-700/50;
}

.status-badge.bg-gray-700 {
  @apply bg-gray-700/50 text-gray-300 border-gray-600/50;
}

.status-badge.bg-red-900 {
  @apply bg-red-900/50 text-red-300 border-red-700/50;
}

/* Text truncation */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.create-btn {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg font-semibold;
  @apply bg-strahd-red border-2 border-strahd-red text-white;
  @apply transition-all duration-200 shadow-lg;
}

.create-btn:hover:not(:disabled) {
  @apply bg-red-700 border-red-700;
  box-shadow: 0 0 20px rgba(139, 0, 0, 0.5);
}

.create-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.create-section-btn {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg font-semibold;
  @apply bg-strahd-dark border-2 border-strahd-gold text-strahd-gold;
  @apply transition-all duration-200 shadow-lg;
}

.create-section-btn:hover:not(:disabled) {
  @apply bg-strahd-gold/10 border-strahd-gold;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
}

.create-section-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.delete-section-btn {
  padding: 0.5rem;
  background: rgba(139, 0, 0, 0.8);
  border: 1px solid #8b0000;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-section-btn:hover {
  background: #a00000;
  box-shadow: 0 0 15px rgba(139, 0, 0, 0.6);
  transform: scale(1.1);
}

@media (hover: none) {
  .quest-card {
    cursor: default;
  }
}

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
  max-width: 500px;
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

.form-group label {
  display: block;
  color: #d4af37;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  background: #0d0d0d;
  border: 1px solid #d4af37;
  border-radius: 6px;
  padding: 0.75rem;
  color: #e0e0e0;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #8b0000;
}

.form-group textarea {
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

.btn-cancel,
.btn-submit {
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

.delete-quest-btn {
  position: absolute;
  top: 0.5rem;
  right: 3rem;
  padding: 0.5rem;
  background: rgba(139, 0, 0, 0.8);
  border: 1px solid #8b0000;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  z-index: 10;
}

.quest-card:hover .delete-quest-btn {
  opacity: 1;
}

@media (hover: none) {
  .delete-quest-btn {
    opacity: 1;
  }
}

.delete-quest-btn:hover {
  background: #a00000;
  box-shadow: 0 0 15px rgba(139, 0, 0, 0.6);
  transform: scale(1.1);
}

.quest-title-link {
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: all 0.2s;
}

.quest-title-link:hover {
  text-decoration-color: #d4af37;
  color: #d4af37;
}
</style>
