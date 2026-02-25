<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuestStore } from "../stores/questStore";
import DecisionFlowchart from "../components/DecisionFlowchart/DecisionFlowchart.vue";

const route = useRoute();
const router = useRouter();
const questStore = useQuestStore();

const statusOptions = ["locked", "available", "in-progress", "completed"];

onMounted(() => {
  questStore.fetchQuestById(route.params.id);
});

function goBack() {
  router.push("/quests");
}

function getStatusClass(status) {
  const classes = {
    available: "bg-green-900 text-green-100",
    "in-progress": "bg-blue-900 text-blue-100",
    completed: "bg-gray-700 text-gray-300",
    locked: "bg-red-900 text-red-100",
  };
  return classes[status] || "bg-gray-700 text-gray-300";
}

async function cycleStatus() {
  const currentIndex = statusOptions.indexOf(questStore.currentQuest.status);
  const nextIndex = (currentIndex + 1) % statusOptions.length;
  const newStatus = statusOptions[nextIndex];

  await questStore.updateQuestStatus(questStore.currentQuest._id, newStatus);
  // Update local state
  questStore.currentQuest.status = newStatus;
}
</script>

<template>
  <div>
    <!-- Back button -->
    <button @click="goBack" class="mb-4 text-strahd-red hover:underline">
      ← Back to Quests
    </button>

    <!-- Loading -->
    <div v-if="questStore.loading" class="text-center py-8">
      <p class="text-xl">Loading quest...</p>
    </div>

    <!-- Quest Details -->
    <div v-else-if="questStore.currentQuest" class="quest-detail">
      <div class="quest-header">
        <h2 class="text-3xl font-bold text-strahd-red mb-2">
          {{ questStore.currentQuest.title }}
        </h2>
        <div class="flex gap-4 mb-4">
          <span class="badge">{{ questStore.currentQuest.act }}</span>
          <span class="badge">{{
            questStore.currentQuest.location?.name || "Unknown"
          }}</span>
          <span
            class="status-badge cursor-pointer hover:opacity-80 transition-opacity"
            :class="getStatusClass(questStore.currentQuest.status)"
            @click="cycleStatus"
            title="Click to change status"
          >
            {{ questStore.currentQuest.status }}
          </span>
        </div>
      </div>

      <div class="quest-info">
        <p class="text-lg text-gray-300 mb-4">
          {{ questStore.currentQuest.description }}
        </p>

        <div v-if="questStore.currentQuest.levelRequirement" class="info-item">
          <span class="label">Level Requirement:</span>
          <span>{{ questStore.currentQuest.levelRequirement }}</span>
        </div>

        <div v-if="questStore.currentQuest.rewards?.length" class="info-item">
          <span class="label">Rewards:</span>
          <ul class="list-disc list-inside">
            <li
              v-for="(reward, index) in questStore.currentQuest.rewards"
              :key="index"
            >
              {{ reward }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Decision Flowchart Section -->
      <div class="flowchart-section">
        <h3 class="text-2xl font-bold text-strahd-red mb-4">Decision Paths</h3>
        <DecisionFlowchart :questId="questStore.currentQuest._id" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.quest-detail {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 32px;
}

.quest-header {
  border-bottom: 2px solid #ff6b6b;
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.badge {
  background: #16213e;
  color: #e0e0e0;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
}

.quest-info {
  margin-bottom: 32px;
}

.info-item {
  margin-bottom: 12px;
}

.label {
  font-weight: 600;
  color: #ff6b6b;
  margin-right: 8px;
}

.flowchart-section {
  background: #16213e;
  border-radius: 8px;
  padding: 24px;
  min-height: 400px;
}
</style>
