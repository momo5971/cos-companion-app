<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useTimelineStore } from "../stores/timelineStore";
import { useCampaignStore } from "../stores/campaignStore";

const timelineStore = useTimelineStore();
const campaignStore = useCampaignStore();

const searchQuery = ref("");
const showModal = ref(false);
const editingEvent = ref(null);

// Form fields
const formYear = ref(0);
const formMonth = ref(null);
const formDay = ref(null);
const formTitle = ref("");
const formDescription = ref("");
const formCategory = ref("");

const categories = [
  "The Ancient Era",
  "The Founding Era",
  "The Era of Blood",
  "The Dark Era",
  "The Dormant Era",
  "Strahd's Awakening",
];

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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
      formatDate(event).toLowerCase().includes(query) ||
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      (event.category && event.category.toLowerCase().includes(query)),
  );
});

function formatDate(event) {
  const year = event.year;
  let yearStr;
  if (year < 0) {
    yearStr = `${Math.abs(year)} BC`;
  } else if (year === 0) {
    yearStr = "Year 0";
  } else {
    yearStr = `Year ${year}`;
  }

  const parts = [];
  if (event.day) parts.push(event.day);
  if (event.month && event.month >= 1 && event.month <= 12) {
    parts.push(monthNames[event.month - 1]);
  }
  parts.push(yearStr);
  return parts.join(" ");
}

function handleSearch() {
  if (filteredEvents.value.length > 0 && searchQuery.value) {
    const firstEvent = document.getElementById(`event-${filteredEvents.value[0]._id}`);
    if (firstEvent) {
      firstEvent.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}

function getCategoryColor(category) {
  const colors = {
    "The Ancient Era": "bg-amber-900/50 text-amber-300 border-amber-700/50",
    "The Founding Era": "bg-emerald-900/50 text-emerald-300 border-emerald-700/50",
    "The Era of Blood": "bg-red-900/50 text-red-300 border-red-700/50",
    "The Dark Era": "bg-purple-900/50 text-purple-300 border-purple-700/50",
    "The Dormant Era": "bg-slate-700/50 text-slate-300 border-slate-600/50",
    "Strahd's Awakening": "bg-rose-900/50 text-rose-300 border-rose-700/50",
    // Legacy categories
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
    formatDate(event).toLowerCase().includes(query) ||
    event.title.toLowerCase().includes(query) ||
    event.description.toLowerCase().includes(query)
  );
}

function openCreateModal() {
  editingEvent.value = null;
  formYear.value = 0;
  formMonth.value = null;
  formDay.value = null;
  formTitle.value = "";
  formDescription.value = "";
  formCategory.value = "";
  showModal.value = true;
}

function openEditModal(event) {
  editingEvent.value = event;
  formYear.value = event.year;
  formMonth.value = event.month || null;
  formDay.value = event.day || null;
  formTitle.value = event.title;
  formDescription.value = event.description;
  formCategory.value = event.category || "";
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingEvent.value = null;
}

async function handleSubmit() {
  if (!formTitle.value.trim() || !formDescription.value.trim()) return;
  const payload = {
    year: formYear.value,
    month: formMonth.value || null,
    day: formDay.value || null,
    title: formTitle.value,
    description: formDescription.value,
    category: formCategory.value || undefined,
  };
  try {
    if (editingEvent.value) {
      await timelineStore.updateEvent(editingEvent.value._id, payload);
    } else {
      await timelineStore.createEvent({
        ...payload,
        campaignId: campaignStore.activeCampaign._id,
      });
    }
    closeModal();
  } catch (error) {
    console.error("Error saving timeline event:", error);
  }
}

async function deleteEvent(eventId, e) {
  e.stopPropagation();
  try {
    await timelineStore.deleteEvent(eventId);
  } catch (error) {
    console.error("Error deleting timeline event:", error);
  }
}
</script>

<template>
  <div class="animate-fade-in">
    <!-- Page Header -->
    <div class="relative mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
      <div>
        <h2 class="text-3xl sm:text-4xl font-bold text-strahd-red text-glow-red">
          Lore Timeline
        </h2>
        <div class="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-strahd-red to-transparent"></div>
        <p class="text-strahd-gold text-sm mt-3 opacity-80">
          The history of Barovia and Strahd von Zarovich
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="create-btn"
        :disabled="!campaignStore.hasActiveCampaign"
        title="Add timeline event"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        <span>Add Event</span>
      </button>
    </div>

    <!-- Search Bar -->
    <div class="sticky top-0 z-10 bg-strahd-dark/95 backdrop-blur-sm border-2 border-strahd-gold/30 rounded-lg p-4 mb-8 shadow-xl">
      <div class="flex gap-3">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search timeline events..."
          class="flex-1 bg-strahd-darker border-2 border-strahd-gold/30 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-strahd-gold transition-colors"
          @keyup.enter="handleSearch"
          autocomplete="off"
        >
        <button
          @click="handleSearch"
          class="px-6 py-2 bg-strahd-red hover:bg-strahd-red/80 text-white rounded-lg transition-colors font-semibold"
        >
          Search
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="timelineStore.loading" class="flex flex-col items-center justify-center py-16">
      <svg class="w-12 h-12 text-strahd-red animate-spin mb-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-xl text-strahd-gold">Loading timeline...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!timelineStore.loading && filteredEvents.length === 0" class="text-center py-16">
      <svg class="w-16 h-16 text-strahd-gold/50 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
      </svg>
      <p class="text-xl text-strahd-gold">
        {{ searchQuery ? "No matching events found" : "No timeline events available" }}
      </p>
    </div>

    <!-- Timeline -->
    <div v-else class="relative">
      <div class="absolute left-4 sm:left-24 top-0 bottom-0 w-0.5 bg-strahd-gold/30"></div>

      <div class="space-y-8">
        <div
          v-for="event in filteredEvents"
          :key="event._id"
          :id="`event-${event._id}`"
          class="timeline-event relative pl-10 sm:pl-28 animate-slide-up group"
          :class="{ highlighted: isHighlighted(event) }"
        >
          <!-- Date on the left (desktop) -->
          <div class="hidden sm:block absolute left-0 w-20 text-right text-strahd-gold font-bold text-xs leading-tight">
            {{ formatDate(event) }}
          </div>

          <!-- Timeline dot -->
          <div class="absolute left-[0.875rem] sm:left-[5.625rem] w-4 h-4 sm:w-5 sm:h-5 bg-strahd-red border-4 border-strahd-dark rounded-full shadow-glow-red"></div>

          <!-- Event card -->
          <div class="event-card bg-strahd-darker border-2 border-strahd-red/30 rounded-lg p-4 sm:p-6 shadow-xl transition-all duration-300 ml-4 sm:ml-8 relative">
            <!-- Date (mobile only) -->
            <div class="sm:hidden text-strahd-gold font-bold text-xs mb-2">
              {{ formatDate(event) }}
            </div>

            <!-- Action buttons -->
            <div class="event-actions">
              <button @click="openEditModal(event)" class="event-action-btn" title="Edit event">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button @click="deleteEvent(event._id, $event)" class="event-action-btn delete" title="Delete event">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>

            <h3 class="text-xl sm:text-2xl font-bold text-strahd-red mb-3 pr-16">{{ event.title }}</h3>
            <p class="text-gray-300 mb-4">{{ event.description }}</p>

            <div v-if="event.category" class="inline-block">
              <span class="category-badge px-3 py-1 rounded-full text-xs font-semibold border" :class="getCategoryColor(event.category)">
                {{ event.category }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="text-2xl font-bold text-strahd-red">
            {{ editingEvent ? "Edit Event" : "Add Timeline Event" }}
          </h2>
          <button @click="closeModal" class="close-btn">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <!-- Date fields row -->
          <div class="form-group">
            <label>Date *</label>
            <div class="date-row">
              <div class="date-field">
                <span class="date-label">Year</span>
                <input v-model.number="formYear" type="number" placeholder="-346" autocomplete="off">
              </div>
              <div class="date-field">
                <span class="date-label">Month</span>
                <select v-model="formMonth">
                  <option :value="null">—</option>
                  <option v-for="(name, idx) in monthNames" :key="idx" :value="idx + 1">{{ name }}</option>
                </select>
              </div>
              <div class="date-field">
                <span class="date-label">Day</span>
                <input v-model.number="formDay" type="number" min="1" max="31" placeholder="—" autocomplete="off">
              </div>
            </div>
            <p class="date-hint">Use negative years for BC (e.g. -346 = 346 BC)</p>
          </div>
          <div class="form-group">
            <label>Title *</label>
            <input v-model="formTitle" type="text" placeholder="Event title" autocomplete="off">
          </div>
          <div class="form-group">
            <label>Description *</label>
            <textarea v-model="formDescription" placeholder="What happened?" rows="4" autocomplete="off"></textarea>
          </div>
          <div class="form-group">
            <label>Era</label>
            <select v-model="formCategory">
              <option value="">None</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="modal-footer">
            <button @click="closeModal" class="btn-cancel">Cancel</button>
            <button @click="handleSubmit" :disabled="!formTitle.trim() || !formDescription.trim()" class="btn-submit">
              {{ editingEvent ? "Save Changes" : "Add Event" }}
            </button>
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

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #8b0000;
  border: 2px solid #d4af37;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 0 15px rgba(139, 0, 0, 0.3);
}

.create-btn:hover {
  background: #a00000;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
  transform: translateY(-2px);
}

.create-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.create-btn:disabled:hover {
  background: #8b0000;
  box-shadow: 0 0 15px rgba(139, 0, 0, 0.3);
  transform: none;
}

.event-actions {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.event-card:hover .event-actions {
  opacity: 1;
}

@media (hover: none) {
  .event-actions {
    opacity: 1;
  }
}

.event-action-btn {
  padding: 0.4rem;
  background: rgba(139, 0, 0, 0.8);
  border: 1px solid #8b0000;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.event-action-btn:hover {
  background: #a00000;
  box-shadow: 0 0 10px rgba(139, 0, 0, 0.6);
  transform: scale(1.1);
}

.event-action-btn.delete:hover {
  background: #dc2626;
  border-color: #dc2626;
}

/* Date fields */
.date-row {
  display: flex;
  gap: 0.75rem;
}

.date-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-field:first-child {
  flex: 1.2;
}

.date-label {
  font-size: 0.7rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.date-hint {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}

/* Modal styles */
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
  padding: 1rem;
}

.modal-content {
  background: linear-gradient(to bottom right, #1a1a1a, #0d0d0d);
  border: 2px solid #8b0000;
  border-radius: 12px;
  width: 100%;
  max-width: 550px;
  box-shadow: 0 0 30px rgba(139, 0, 0, 0.5);
  max-height: 90vh;
  overflow-y: auto;
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
.form-group textarea,
.form-group select {
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
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #8b0000;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-group select {
  cursor: pointer;
}

.form-group select option {
  background: #0d0d0d;
  color: #e0e0e0;
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
</style>
