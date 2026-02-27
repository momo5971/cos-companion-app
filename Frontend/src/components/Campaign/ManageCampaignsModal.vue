<script setup>
import { ref, computed } from "vue";
import { useCampaignStore } from "../../stores/campaignStore";
import { useQuestStore } from "../../stores/questStore";
import { useLocationStore } from "../../stores/locationStore";
import { useCompendiumStore } from "../../stores/compendiumStore";

const emit = defineEmits(["close"]);
const campaignStore = useCampaignStore();
const questStore = useQuestStore();
const locationStore = useLocationStore();
const compendiumStore = useCompendiumStore();
const fileInput = ref(null);
const error = ref(null);

const campaigns = computed(() => campaignStore.campaigns);

function formatDate(date) {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString();
}

function exportCampaign(campaign) {
  // Set as active temporarily to export
  const previousActive = campaignStore.activeCampaign;
  campaignStore.activeCampaign = campaign;
  campaignStore.exportCampaign();
  campaignStore.activeCampaign = previousActive;
}

const handleImport = async (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  try {
    const fileContent = await file.text();
    const campaignData = JSON.parse(fileContent);

    const importedCampaign = await campaignStore.importCampaign(file);

    // Set as active campaign
    await campaignStore.setActiveCampaign(importedCampaign._id);

    // Refresh all stores with the new campaign ID
    await questStore.fetchQuests(importedCampaign._id);
    await locationStore.fetchLocations(importedCampaign._id);
    await compendiumStore.fetchEntries(importedCampaign._id);

    // Clear the file input
    if (fileInput.value) {
      fileInput.value.value = "";
    }

    // Refresh campaigns list
    await campaignStore.fetchCampaigns();
  } catch (error) {
    console.error("Import error:", error);
  }
};

async function confirmDelete(campaign) { {
    try {
      await campaignStore.deleteCampaign(campaign._id);
    } catch (err) {
      error.value = "Failed to delete campaign";
    }
  }
}
</script>

<template>
  <div class="modal-overlay">
    <div
      class="modal-content animate-scale-in p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
    >
      <h2 class="text-2xl font-bold text-strahd-red mb-4 text-glow-red">
        Manage Campaigns
      </h2>

      <div class="space-y-3 mb-6">
        <div
          v-for="(campaign, index) in campaigns"
          :key="campaign._id"
          class="card animate-slide-right"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-lg font-bold text-strahd-gold">
                {{ campaign.name }}
                <span
                  v-if="campaign.isActive"
                  class="text-xs text-green-500 ml-2 animate-pulse-slow"
                  >(Active)</span
                >
              </h3>
              <p v-if="campaign.description" class="text-sm text-gray-400 mt-1">
                {{ campaign.description }}
              </p>
              <div class="text-xs text-gray-500 mt-2">
                Last played: {{ formatDate(campaign.lastPlayed) }}
              </div>
            </div>

            <div class="flex gap-2 ml-4">
              <button
                @click="exportCampaign(campaign)"
                class="btn-secondary text-sm transition-bounce"
                title="Export Campaign"
              >
                Export
              </button>
              <button
                @click="confirmDelete(campaign)"
                class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-all duration-200"
                title="Delete Campaign"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="campaigns.length === 0"
          class="text-center text-gray-400 py-8 animate-fade-in"
        >
          No campaigns yet. Create one to get started!
        </div>
      </div>

      <!-- Import Section -->
      <div class="border-t border-strahd-red pt-4 mb-4">
        <label class="block text-strahd-gold mb-2">Import Campaign</label>
        <input
          type="file"
          accept=".json"
          @change="handleImport"
          ref="fileInput"
          class="w-full px-3 py-2 bg-strahd-darker border border-strahd-red rounded text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-strahd-red file:text-white hover:file:bg-red-700 transition-all"
        />
      </div>

      <div v-if="error" class="mb-4 text-red-500 text-sm animate-slide-down">
        {{ error }}
      </div>

      <div class="flex justify-end">
        <button @click="$emit('close')" class="btn-secondary">Close</button>
      </div>
    </div>
  </div>
</template>
