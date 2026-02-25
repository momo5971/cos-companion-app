<script setup>
import { onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useQuestStore } from "../stores/questStore";
import { useCampaignStore } from "../stores/campaignStore";

const router = useRouter();
const questStore = useQuestStore();
const campaignStore = useCampaignStore();

const acts = ["Act I", "Act II", "Act III", "Act IV", "Act V"];

onMounted(() => {
  const campaignId = campaignStore.activeCampaign?._id;
  if (campaignId) {
    questStore.fetchQuests(campaignId);
  }
});

watch(
  () => campaignStore.activeCampaign,
  (newCampaign) => {
    if (newCampaign?._id) {
      questStore.fetchQuests(newCampaign._id);
    } else {
      questStore.quests = [];
    }
  },
);

// Get unique locations in an act
function getLocationsInAct(act) {
  const quests = questStore.quests.filter((q) => q.act === act);

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

function getQuestsInLocation(act, location) {
  return questStore.quests.filter(
    (q) => q.act === act && q.location?._id === location?._id,
  );
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
</script>

<template>
  <div class="animate-fade-in">
    <!-- Page Header -->
    <div class="relative mb-8">
      <h2 class="text-4xl font-bold text-strahd-red text-glow-red">Quests</h2>
      <div
        class="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-strahd-red to-transparent"
      ></div>
      <p class="text-strahd-gold text-sm mt-3 opacity-80">
        Track your journey through Barovia
      </p>
    </div>

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

    <!-- Quests by Act -->
    <div v-else class="space-y-8">
      <div v-for="act in acts" :key="act" class="act-section animate-slide-up">
        <!-- Act Header -->
        <div class="relative mb-6">
          <h3 class="text-3xl font-bold text-strahd-red text-glow-red">
            {{ act }}
          </h3>
          <div class="absolute -bottom-1 left-0 w-16 h-0.5 bg-strahd-red"></div>
        </div>

        <!-- Locations within Act -->
        <div
          v-for="location in getLocationsInAct(act)"
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
              v-for="quest in getQuestsInLocation(act, location)"
              :key="quest._id"
              class="quest-card group"
              :class="getStatusClass(getQuestStatus(quest._id))"
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

              <h5
                class="text-lg font-bold mb-2 group-hover:text-strahd-gold transition-colors"
              >
                {{ quest.title }}
              </h5>
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
  </div>
</template>

<style scoped>
.act-section {
  @apply bg-gradient-to-br from-strahd-dark to-strahd-darker;
  @apply border-2 border-strahd-red/30 rounded-xl p-8 shadow-xl;
  @apply transition-all duration-300;
}

.act-section:hover {
  border-color: rgba(220, 38, 38, 0.5);
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.5);
}

.location-section {
  @apply ml-6 pl-6 border-l-2 border-strahd-gold/30;
}

.quest-card {
  @apply relative bg-strahd-darker border-2 rounded-lg p-6 cursor-pointer;
  @apply transition-all duration-300 flex flex-col shadow-xl;
  min-height: 180px;
}

.quest-card:hover {
  transform: translateY(-8px);
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
</style>
