<script setup>
import { onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuestStore } from "../stores/questStore";
import { useCampaignStore } from "../stores/campaignStore";
import DecisionFlowchart from "../components/DecisionFlowchart/DecisionFlowchart.vue";

const route = useRoute();
const router = useRouter();
const questStore = useQuestStore();
const campaignStore = useCampaignStore();

onMounted(() => {
  questStore.fetchQuestById(route.params.id);
});

function goBack() {
  router.push("/quests");
}

// Get quest status from campaign
const questStatus = computed(() => {
  if (!campaignStore.hasActiveCampaign || !questStore.currentQuest) {
    return "locked";
  }

  const campaign = campaignStore.activeCampaign;
  const questId = questStore.currentQuest._id;

  if (campaign.completedQuests?.includes(questId)) {
    return "completed";
  }

  if (campaign.activeQuests?.includes(questId)) {
    return "in-progress";
  }

  return "available";
});

function getStatusClass(status) {
  const classes = {
    available: "bg-green-900 text-green-100",
    "in-progress": "bg-blue-900 text-blue-100",
    completed: "bg-gray-700 text-gray-300",
    locked: "bg-red-900 text-red-100",
  };
  return classes[status] || "bg-gray-700 text-gray-300";
}

async function markAsActive() {
  if (!campaignStore.hasActiveCampaign) {
    alert("Please select a campaign first");
    return;
  }
  await campaignStore.addActiveQuest(questStore.currentQuest._id);
}

async function markAsCompleted() {
  if (!campaignStore.hasActiveCampaign) {
    alert("Please select a campaign first");
    return;
  }
  await campaignStore.addCompletedQuest(questStore.currentQuest._id);
}

async function removeFromActive() {
  if (!campaignStore.hasActiveCampaign) return;
  await campaignStore.removeActiveQuest(questStore.currentQuest._id);
}
</script>

<template>
  <div class="animate-fade-in">
    <!-- Back button -->
    <button @click="goBack" class="back-btn group mb-6">
      <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
      </svg>
      <span>Back to Quests</span>
    </button>

    <!-- Loading -->
    <div v-if="questStore.loading" class="flex flex-col items-center justify-center py-16">
      <svg class="w-12 h-12 text-strahd-red animate-spin mb-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-xl text-strahd-gold">Loading quest...</p>
    </div>

    <!-- Quest Details -->
    <div v-else-if="questStore.currentQuest" class="quest-detail">
      <div class="quest-header">
        <h2 class="text-4xl font-bold text-strahd-red text-glow-red mb-4">
          {{ questStore.currentQuest.title }}
        </h2>
        
        <div class="flex flex-wrap gap-3 mb-6 items-center">
          <!-- Act Badge -->
          <span class="badge badge-act">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
            </svg>
            {{ questStore.currentQuest.act }}
          </span>

          <!-- Location Badge -->
          <span class="badge badge-location">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
            </svg>
            {{ questStore.currentQuest.location?.name || "Unknown" }}
          </span>

          <!-- Status Badge -->
          <span class="status-badge" :class="getStatusClass(questStatus)">
            {{ questStatus }}
          </span>

          <!-- Quest Action Buttons -->
          <div class="flex gap-2 ml-auto">
            <button
              v-if="questStatus !== 'in-progress'"
              @click="markAsActive"
              class="action-btn action-btn-active"
              :disabled="!campaignStore.hasActiveCampaign"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Mark Active
            </button>
            <button
              v-if="questStatus === 'in-progress'"
              @click="removeFromActive"
              class="action-btn action-btn-remove"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Remove from Active
            </button>
            <button
              v-if="questStatus !== 'completed'"
              @click="markAsCompleted"
              class="action-btn action-btn-complete"
              :disabled="!campaignStore.hasActiveCampaign"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Mark Completed
            </button>
          </div>
        </div>

        <!-- Decorative divider -->
        <div class="h-0.5 bg-gradient-to-r from-strahd-red via-strahd-gold to-transparent"></div>
      </div>

      <div class="quest-info">
        <p class="text-lg text-gray-300 leading-relaxed mb-6">
          {{ questStore.currentQuest.description }}
        </p>

        <div class="info-grid">
          <div v-if="questStore.currentQuest.levelRequirement" class="info-card">
            <div class="info-icon">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <div>
              <div class="info-label">Level Requirement</div>
              <div class="info-value">Level {{ questStore.currentQuest.levelRequirement }}</div>
            </div>
          </div>

          <div v-if="questStore.currentQuest.rewards?.length" class="info-card">
            <div class="info-icon">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <div class="info-label">Rewards</div>
              <ul class="info-value list-disc list-inside space-y-1">
                <li v-for="(reward, index) in questStore.currentQuest.rewards" :key="index">
                  {{ reward }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Decision Flowchart Section -->
      <div class="flowchart-section">
        <div class="flex items-center gap-3 mb-6">
          <svg class="w-8 h-8 text-strahd-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
          <h3 class="text-3xl font-bold text-strahd-red text-glow-red">Decision Paths</h3>
        </div>
        <DecisionFlowchart :questId="questStore.currentQuest._id" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.back-btn {
  @apply flex items-center gap-2 text-strahd-gold hover:text-strahd-red;
  @apply transition-colors font-semibold;
}

.quest-detail {
  @apply bg-gradient-to-br from-strahd-dark to-strahd-darker;
  @apply border-2 border-strahd-red/30 rounded-xl p-8 shadow-xl;
}

.quest-header {
  @apply pb-6 mb-8;
}

.badge {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm;
  @apply border-2 transition-all duration-200;
}

.badge-act {
  @apply bg-strahd-burgundy/30 border-strahd-red/50 text-strahd-gold;
}

.badge-location {
  @apply bg-strahd-purple/30 border-purple-500/50 text-purple-300;
}

.status-badge {
  @apply px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wide;
  @apply border-2 shadow-lg;
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

.action-btn {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm;
  @apply border-2 transition-all duration-200 shadow-lg;
}

.action-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.action-btn-active {
  @apply bg-blue-600/80 border-blue-500 text-white;
  @apply hover:bg-blue-700 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)];
}

.action-btn-remove {
  @apply bg-gray-600/80 border-gray-500 text-white;
  @apply hover:bg-gray-700 hover:shadow-[0_0_15px_rgba(107,114,128,0.5)];
}

.action-btn-complete {
  @apply bg-green-600/80 border-green-500 text-white;
  @apply hover:bg-green-700 hover:shadow-[0_0_15px_rgba(34,197,94,0.5)];
}

.quest-info {
  @apply mb-8;
}

.info-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.info-card {
  @apply flex gap-4 p-4 bg-strahd-darker/50 border border-strahd-red/20 rounded-lg;
}

.info-icon {
  @apply flex-shrink-0 w-12 h-12 flex items-center justify-center;
  @apply bg-strahd-red/20 border border-strahd-red/30 rounded-lg text-strahd-gold;
}

.info-label {
  @apply text-sm font-semibold text-strahd-gold uppercase tracking-wide mb-1;
}

.info-value {
  @apply text-white;
}

.flowchart-section {
  @apply bg-strahd-darker/50 border-2 border-strahd-red/30 rounded-xl p-6;
  @apply min-h-[500px];
}
</style>
