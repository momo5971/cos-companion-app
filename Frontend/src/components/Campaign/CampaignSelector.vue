<script setup>
import { ref, computed, onMounted } from "vue";
import { useCampaignStore } from "../../stores/campaignStore";
import CreateCampaignModal from "./CreateCampaignModal.vue";

const campaignStore = useCampaignStore();
const isOpen = ref(false);
const showCreateModal = ref(false);

const campaigns = computed(() => campaignStore.campaigns);
const activeCampaign = computed(() => campaignStore.activeCampaign);

onMounted(() => {
  campaignStore.fetchCampaigns();
});

async function selectCampaign(campaignId) {
  await campaignStore.setActiveCampaign(campaignId);
  isOpen.value = false;
}

function openCreateModal() {
  isOpen.value = false;
  showCreateModal.value = true;
}

function handleCampaignCreated(campaign) {
  showCreateModal.value = false;
  campaignStore.setActiveCampaign(campaign._id);
}

function formatDate(date) {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString();
}
</script>

<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-4 py-2 bg-strahd-dark border border-strahd-red rounded hover:bg-strahd-darker transition-colors"
    >
      <span class="text-strahd-gold">
        {{ activeCampaign ? activeCampaign.name : "No Campaign Selected" }}
      </span>
      <svg
        class="w-4 h-4 text-strahd-red"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="absolute top-full mt-2 w-64 bg-strahd-dark border border-strahd-red rounded shadow-lg z-50"
    >
      <div class="p-2 max-h-64 overflow-y-auto">
        <div
          v-for="campaign in campaigns"
          :key="campaign._id"
          @click="selectCampaign(campaign._id)"
          class="px-3 py-2 hover:bg-strahd-darker cursor-pointer rounded transition-colors"
          :class="{ 'bg-strahd-darker': campaign._id === activeCampaign?._id }"
        >
          <div class="text-strahd-gold">{{ campaign.name }}</div>
          <div class="text-xs text-gray-400">
            Last played: {{ formatDate(campaign.lastPlayed) }}
          </div>
        </div>
      </div>

      <div class="border-t border-strahd-red p-2">
        <button
          @click="openCreateModal"
          class="w-full px-3 py-2 bg-strahd-red text-white rounded hover:bg-red-700 transition-colors"
        >
          + Create New Campaign
        </button>
      </div>
    </div>

    <!-- Create Campaign Modal -->
    <CreateCampaignModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleCampaignCreated"
    />
  </div>
</template>
