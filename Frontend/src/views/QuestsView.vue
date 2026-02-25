<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuestStore } from "../stores/questStore";

const router = useRouter();
const questStore = useQuestStore();

const acts = ["Act I", "Act II", "Act III", "Act IV", "Act V"];

onMounted(() => {
  questStore.fetchQuests();
});

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
  <div>
    <h2 class="text-3xl font-bold mb-6 text-strahd-red">Quests</h2>

    <!-- Loading State -->
    <div v-if="questStore.loading" class="text-center py-8">
      <p class="text-xl">Loading quests...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="questStore.error"
      class="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded"
    >
      <p class="font-bold">Error:</p>
      <p>{{ questStore.error }}</p>
    </div>

    <!-- Quests by Act -->
    <div v-else class="space-y-8">
      <div v-for="act in acts" :key="act" class="act-section">
        <h3 class="text-2xl font-bold text-strahd-red mb-4">{{ act }}</h3>

        <!-- Locations within Act -->
        <div
          v-for="location in getLocationsInAct(act)"
          :key="location"
          class="location-section mb-6"
        >
          <h4 class="text-xl font-semibold text-blue-400 mb-3">
            {{ location?.name || "Unknown Location" }}
          </h4>

          <!-- Quests in Location -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="quest in getQuestsInLocation(act, location)"
              :key="quest._id"
              class="quest-card"
              :class="getStatusClass(quest.status)"
              @click="goToQuestDetail(quest._id)"
            >
              <h5 class="text-lg font-bold mb-2">{{ quest.title }}</h5>
              <p class="text-sm text-gray-300 mb-3">{{ quest.description }}</p>
              <div class="flex justify-between items-center">
                <span
                  class="status-badge"
                  :class="getStatusBadgeClass(quest.status)"
                >
                  {{ quest.status }}
                </span>
                <span
                  v-if="quest.levelRequirement"
                  class="text-xs text-gray-400"
                >
                  Level {{ quest.levelRequirement }}
                </span>
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
  background: #1a1a2e;
  border-radius: 12px;
  padding: 24px;
}

.location-section {
  margin-left: 20px;
}

.quest-card {
  background: #16213e;
  border: 2px solid;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.quest-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
