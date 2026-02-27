<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { useCompendiumStore } from "../stores/compendiumStore";
import { useCampaignStore } from "../stores/campaignStore";
import CompendiumModal from "../components/Compendium/CompendiumModal.vue";
import CreateCompendiumEntryModal from "../components/Compendium/CreateCompendiumEntryModal.vue";
import Fuse from "fuse.js";
import { useRoute, useRouter } from "vue-router";

const compendiumStore = useCompendiumStore();
const campaignStore = useCampaignStore();
const route = useRoute();
const router = useRouter();

const searchQuery = ref("");
const selectedCategory = ref("all");
const selectedEntry = ref(null);
const isModalOpen = ref(false);
const showCreateModal = ref(false);

onMounted(async () => {
  const campaignId = campaignStore.activeCampaign?._id;
  if (campaignId) {
    await compendiumStore.fetchEntries(campaignId);
  } else {
    compendiumStore.$patch({ entries: [] });
  }

  // Check if there's an entry to open from query parameters
  if (route.query.openEntry && route.query.category) {
    const entry = compendiumStore.entries.find(
      e => e.title === route.query.openEntry && e.category === route.query.category
    );
    
    if (entry) {
      // Open the modal after a short delay to ensure everything is rendered
      setTimeout(() => {
        viewDetails(entry);
        // Clean up query parameters
        router.replace({ name: 'Compendium' });
      }, 100);
    }
  }

  // Listen for custom event to open specific entry
  window.addEventListener('open-compendium-entry', handleOpenEntry);
});

// Cleanup event listener
onUnmounted(() => {
  window.removeEventListener('open-compendium-entry', handleOpenEntry);
});

function handleOpenEntry(event) {
  const entry = event.detail;
  if (entry) {
    viewDetails(entry);
  }
}

watch(
  () => campaignStore.activeCampaign,
  async (newCampaign) => {
    if (newCampaign?._id) {
      await compendiumStore.fetchEntries(newCampaign._id);
    } else {
      compendiumStore.$patch({ entries: [] });
    }
  },
);

const categories = [
  { value: "all", label: "All" },
  { value: "NPC", label: "NPCs" },
  { value: "Monster", label: "Monsters" },
  { value: "Item", label: "Items" },
  { value: "Quest", label: "Quests" },
  { value: "Location", label: "Locations" },
];

// Fuse.js configuration for fuzzy search
const fuseOptions = {
  keys: ["title", "description", "tags"],
  threshold: 0.3,
  includeScore: true,
};

function viewDetails(entry) {
  selectedEntry.value = entry;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  selectedEntry.value = null;
}

// Filtered and searched entries
const displayedEntries = computed(() => {
  let filtered = compendiumStore.entries;

  // Filter by category
  if (selectedCategory.value !== "all") {
    filtered = filtered.filter(
      (entry) => entry.category === selectedCategory.value,
    );
  }

  // Search
  if (searchQuery.value.trim()) {
    const fuse = new Fuse(filtered, fuseOptions);
    const results = fuse.search(searchQuery.value);
    return results.map((result) => result.item);
  }

  return filtered;
});

// Get category color
function getCategoryColor(category) {
  const colors = {
    NPC: "bg-blue-500",
    Monster: "bg-red-500",
    Item: "bg-purple-500",
    Quest: "bg-green-500",
    Location: "bg-yellow-500",
  };
  return colors[category] || "bg-gray-500";
}

// Get category icon
function getCategoryIcon(category) {
  const icons = {
    all: "📚",
    NPC: "👤",
    Monster: "🐉",
    Item: "⚔️",
    Quest: "📜",
    Location: "🗺️",
  };
  return icons[category] || "📖";
}

async function deleteEntry(entryId, event) {
  event.stopPropagation();
  
  try {
    await compendiumStore.deleteEntry(entryId);
    if (campaignStore.activeCampaign?._id) {
      await compendiumStore.fetchEntries(campaignStore.activeCampaign._id);
    }
  } catch (error) {
    console.error('Error deleting entry:', error);
  }
}

async function handleEntryCreated() {
  showCreateModal.value = false;
  if (campaignStore.activeCampaign?._id) {
    await compendiumStore.fetchEntries(campaignStore.activeCampaign._id);
  }
}
</script>

<template>
  <div class="compendium-view animate-fade-in">
    <!-- Header -->
    <div class="relative mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-4xl font-bold text-strahd-red text-glow-red">
            Compendium
          </h2>
          <div
            class="absolute -bottom-2 left-0 w-32 h-1 bg-gradient-to-r from-strahd-red to-transparent"
          ></div>
          <p class="text-strahd-gold text-sm mt-3 opacity-80">
            Browse NPCs, monsters, items, quests, and locations of Barovia
          </p>
        </div>
        <button
          @click="showCreateModal = true"
          class="create-entry-btn"
          :disabled="!campaignStore.hasActiveCampaign"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Create Entry
        </button>
      </div>
    </div>

    <!-- Search and Filter Bar -->
    <div class="search-bar">
      <!-- Search Input -->
      <div class="search-input-wrapper group">
        <svg
          class="search-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search the dark archives..."
          class="search-input"
          autocomplete="off"
        />
        <div v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>

      <!-- Category Filter -->
      <div class="category-filter">
        <button
          v-for="category in categories"
          :key="category.value"
          :class="[
            'category-btn',
            { active: selectedCategory === category.value },
          ]"
          @click="selectedCategory = category.value"
        >
          <span class="category-icon">{{
            getCategoryIcon(category.value)
          }}</span>
          {{ category.label }}
        </button>
      </div>
    </div>

    <!-- Results Count -->
    <div
      v-if="!compendiumStore.loading && displayedEntries.length > 0"
      class="results-count"
    >
      <span class="text-strahd-gold">{{ displayedEntries.length }}</span>
      <span class="text-gray-400"
        >{{ displayedEntries.length === 1 ? "entry" : "entries" }} found</span
      >
    </div>

    <!-- Loading State -->
    <div
      v-if="compendiumStore.loading"
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
      <p class="text-xl text-strahd-gold">Loading compendium...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="displayedEntries.length === 0" class="empty-state">
      <svg
        class="w-20 h-20 text-strahd-red/30 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      <p class="text-xl text-gray-400">
        {{
          searchQuery
            ? "No entries found matching your search"
            : "No compendium entries available"
        }}
      </p>
      <p v-if="searchQuery" class="text-sm text-gray-500 mt-2">
        Try adjusting your search terms
      </p>
    </div>

    <!-- Entries Grid -->
    <div v-else class="entries-grid">
      <div
        v-for="entry in displayedEntries"
        :key="entry._id"
        class="entry-card group"
        @click="viewDetails(entry)"
      >
        <!-- Category Badge -->
        <div class="card-header">
          <span
            class="category-badge"
            :class="getCategoryColor(entry.category)"
          >
            <span class="text-lg">{{ getCategoryIcon(entry.category) }}</span>
            {{ entry.category }}
          </span>
        </div>

        <!-- Delete Button -->
        <button
          @click="deleteEntry(entry._id, $event)"
          class="delete-entry-btn"
          title="Delete entry"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>

        <!-- Entry Image -->
        <div v-if="entry.imageUrl" class="entry-image">
          <img :src="entry.imageUrl" :alt="entry.title" />
          <div class="image-overlay"></div>
        </div>

        <!-- Entry Content -->
        <h3 class="entry-title group-hover:text-strahd-gold transition-colors">
          {{ entry.title }}
        </h3>
        <p class="entry-description">{{ entry.description }}</p>

        <!-- Tags -->
        <div v-if="entry.tags && entry.tags.length > 0" class="tags">
          <span v-for="tag in entry.tags.slice(0, 3)" :key="tag" class="tag">
            #{{ tag }}
          </span>
          <span v-if="entry.tags.length > 3" class="tag">
            +{{ entry.tags.length - 3 }}
          </span>
        </div>

        <!-- Hover indicator -->
        <div
          class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg
            class="w-6 h-6 text-strahd-gold"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Compendium Modal -->
    <CompendiumModal
      v-if="selectedEntry"
      :is-open="isModalOpen"
      :entry="selectedEntry"
      @close="closeModal"
    />

    <!-- Create Entry Modal -->
    <CreateCompendiumEntryModal
      :show="showCreateModal"
      @close="showCreateModal = false"
      @created="handleEntryCreated"
    />
  </div>
</template>

<style scoped>
.compendium-view {
  @apply p-6 max-w-7xl mx-auto;
}

.create-entry-btn {
  @apply flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm;
  @apply bg-strahd-red border-2 border-strahd-red text-white;
  @apply transition-all duration-200 shadow-lg;
}

.create-entry-btn:hover:not(:disabled) {
  @apply bg-strahd-blood;
  box-shadow: 0 0 20px rgba(139, 0, 0, 0.6);
  transform: translateY(-2px);
}

.create-entry-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.search-bar {
  @apply flex gap-4 mb-8 flex-wrap items-center;
}

.search-input-wrapper {
  @apply relative flex-1 min-w-[300px];
}

.search-icon {
  @apply absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-strahd-gold/50;
  @apply group-focus-within:text-strahd-gold transition-colors;
}

.search-input {
  @apply w-full pl-12 pr-12 py-3 bg-strahd-dark border-2 border-strahd-red/30 rounded-lg;
  @apply text-white placeholder-gray-500 transition-all duration-200;
}

.search-input:focus {
  @apply outline-none border-strahd-gold ring-2 ring-strahd-gold/20;
}

.clear-btn {
  @apply absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-strahd-red;
  @apply cursor-pointer transition-colors p-1;
}

.category-filter {
  @apply flex gap-2 flex-wrap;
}

.category-btn {
  @apply px-4 py-2 bg-strahd-dark border-2 border-strahd-red/30 rounded-lg;
  @apply text-gray-400 font-semibold cursor-pointer transition-all duration-200;
  @apply hover:border-strahd-gold hover:text-strahd-gold;
  @apply flex items-center gap-2;
}

.category-btn.active {
  @apply bg-strahd-red border-strahd-red text-white shadow-glow-red;
}

.category-icon {
  @apply text-lg;
}

.results-count {
  @apply mb-4 text-sm flex items-center gap-2;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-20;
}

.entries-grid {
  @apply grid gap-6;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.entry-card {
  @apply relative bg-gradient-to-br from-strahd-dark to-strahd-darker;
  @apply border-2 border-strahd-red/30 rounded-xl p-6 cursor-pointer;
  @apply transition-all duration-300 flex flex-col shadow-xl;
  min-height: 400px;
}

.entry-card:hover {
  @apply border-strahd-gold shadow-glow-gold;
  transform: translateY(-4px);
}

.card-header {
  @apply mb-4;
}

.category-badge {
  @apply inline-flex items-center gap-2 px-3 py-1.5 rounded-full;
  @apply text-xs font-bold text-white shadow-lg;
}

.category-badge.bg-blue-500 {
  @apply bg-blue-600/80 border-2 border-blue-400/50;
}

.category-badge.bg-red-500 {
  @apply bg-red-600/80 border-2 border-red-400/50;
}

.category-badge.bg-purple-500 {
  @apply bg-purple-600/80 border-2 border-purple-400/50;
}

.category-badge.bg-green-500 {
  @apply bg-green-600/80 border-2 border-green-400/50;
}

.category-badge.bg-yellow-500 {
  @apply bg-yellow-600/80 border-2 border-yellow-400/50;
}

.entry-image {
  @apply relative w-full h-48 overflow-hidden rounded-lg mb-4;
  @apply bg-strahd-darker border border-strahd-red/20;
}

.entry-image img {
  @apply w-full h-full object-contain transition-transform duration-300;
}

.entry-card:hover .entry-image img {
  transform: scale(1.05);
}

.image-overlay {
  @apply absolute inset-0 bg-gradient-to-t from-strahd-darker/80 to-transparent;
  @apply opacity-0 group-hover:opacity-100 transition-opacity;
}

.entry-title {
  @apply text-xl font-bold text-white mb-3;
}

.entry-description {
  @apply text-gray-300 text-sm leading-relaxed mb-4 flex-1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags {
  @apply flex flex-wrap gap-2 mt-auto;
}

.tag {
  @apply px-2 py-1 bg-strahd-darker/50 border border-strahd-red/20 rounded-md;
  @apply text-xs text-strahd-gold font-medium;
}

.delete-entry-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
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

.entry-card:hover .delete-entry-btn {
  opacity: 1;
}

.delete-entry-btn:hover {
  background: #a00000;
  box-shadow: 0 0 15px rgba(139, 0, 0, 0.6);
  transform: scale(1.1);
}
</style>
