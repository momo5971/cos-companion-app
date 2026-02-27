<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useTimelineStore } from "../stores/timelineStore";
import { useCampaignStore } from "../stores/campaignStore";

const timelineStore = useTimelineStore();
const campaignStore = useCampaignStore();

const searchQuery = ref("");
const eventRefs = ref([]);

onMounted(() => {
  const campaignId = campaignStore.activeCampaign?._id;
  if (campaignId) {
    timelineStore.fetchTimelineEvents(campaignId);
  } else {
    timelineStore.$patch({ events: [] });
  }
});

watch(
  () => campaignStore.activeCampaign,
  (newCampaign) => {
    if (newCampaign?._id) {
      timelineStore.fetchTimelineEvents(newCampaign._id);
    } else {
      timelineStore.$patch({ events: [] });
    }
  },
);

const filteredEvents = computed(() => {
  if (!searchQuery.value) return timelineStore.events;

  const query = searchQuery.value.toLowerCase();
  return timelineStore.events.filter(
    (event) =>
      String(event.year).toLowerCase().includes(query) ||
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query),
  );
});

function formatYear(year) {
  if (year < 0) {
    return `${Math.abs(year)} BC`;
  } else if (year === 0) {
    return "Year 0";
  } else {
    return `Year ${year}`;
  }
}

function handleSearch() {
  if (filteredEvents.value.length > 0 && searchQuery.value) {
    // Scroll to first match
    const firstEvent = document.getElementById(
      `event-${filteredEvents.value[0]._id}`,
    );
    if (firstEvent) {
      firstEvent.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}

function getCategoryColor(category) {
  const colors = {
    "The Dark Powers": "bg-purple-900/50 text-purple-300 border-purple-700/50",
    "Strahd's History": "bg-red-900/50 text-red-300 border-red-700/50",
    Barovia: "bg-amber-900/50 text-amber-300 border-amber-700/50",
    "Current Events": "bg-blue-900/50 text-blue-300 border-blue-700/50",
  };
  return colors[category] || "bg-gray-700/50 text-gray-300 border-gray-600/50";
}

function isHighlighted(event) {
  if (!searchQuery.value) return false;
  const query = searchQuery.value.toLowerCase();
  return (
    String(event.year).toLowerCase().includes(query) ||
    event.title.toLowerCase().includes(query) ||
    event.description.toLowerCase().includes(query)
  );
}
</script>

<template>
  <div class="animate-fade-in">
    <!-- Page Header -->
    <div class="relative mb-8">
      <h2 class="text-4xl font-bold text-strahd-red text-glow-red">
        Lore Timeline
      </h2>
      <div
        class="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-strahd-red to-transparent"
      ></div>
      <p class="text-strahd-gold text-sm mt-3 opacity-80">
        The history of Barovia and Strahd von Zarovich
      </p>
    </div>

    <!-- Search Bar (Sticky) -->
    <div
      class="sticky top-0 z-10 bg-strahd-dark/95 backdrop-blur-sm border-2 border-strahd-gold/30 rounded-lg p-4 mb-8 shadow-xl"
    >
      <div class="flex gap-3">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search timeline events..."
          class="flex-1 bg-strahd-darker border-2 border-strahd-gold/30 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-strahd-gold transition-colors"
          @keyup.enter="handleSearch" autocomplete="off">
        <button
          @click="handleSearch"
          class="px-6 py-2 bg-strahd-red hover:bg-strahd-red/80 text-white rounded-lg transition-colors font-semibold"
        >
          Search
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="timelineStore.loading"
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
      <p class="text-xl text-strahd-gold">Loading timeline...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!timelineStore.loading && filteredEvents.length === 0"
      class="text-center py-16"
    >
      <svg
        class="w-16 h-16 text-strahd-gold/50 mx-auto mb-4"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
          clip-rule="evenodd"
        />
      </svg>
      <p class="text-xl text-strahd-gold">
        {{
          searchQuery
            ? "No matching events found"
            : "No timeline events available"
        }}
      </p>
    </div>

    <!-- Timeline -->
    <div v-else class="relative">
      <!-- Vertical line -->
      <div
        class="absolute left-20 top-0 bottom-0 w-0.5 bg-strahd-gold/30"
      ></div>

      <!-- Events -->
      <div class="space-y-8">
        <div
          v-for="event in filteredEvents"
          :key="event._id"
          :id="`event-${event._id}`"
          class="timeline-event relative pl-24 animate-slide-up"
          :class="{ highlighted: isHighlighted(event) }"
        >
          <!-- Year on the left -->
          <div
            class="absolute left-0 w-16 text-right text-strahd-gold font-bold text-sm"
          >
            {{ formatYear(event.year) }}
          </div>

          <!-- Timeline dot -->
          <div
            class="absolute left-[4.625rem] w-5 h-5 bg-strahd-red border-4 border-strahd-dark rounded-full shadow-glow-red"
          ></div>

          <!-- Event card -->
          <div
            class="event-card bg-strahd-darker border-2 border-strahd-red/30 rounded-lg p-6 shadow-xl transition-all duration-300 ml-8"
          >
            <!-- Title -->
            <h3 class="text-2xl font-bold text-strahd-red mb-3">
              {{ event.title }}
            </h3>

            <!-- Description -->
            <p class="text-gray-300 mb-4">{{ event.description }}</p>

            <!-- Category Badge -->
            <div v-if="event.category" class="inline-block">
              <span
                class="category-badge px-3 py-1 rounded-full text-xs font-semibold border"
                :class="getCategoryColor(event.category)"
              >
                {{ event.category }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-event {
  transition: all 0.3s ease;
}

.timeline-event.highlighted .event-card {
  border-color: rgba(220, 38, 38, 0.8);
  box-shadow: 0 0 30px rgba(220, 38, 38, 0.5);
  transform: scale(1.02);
}

.event-card:hover {
  border-color: rgba(220, 38, 38, 0.6);
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
}

.category-badge {
  transition: all 0.2s ease;
}
</style>
