import { defineStore } from "pinia";
import { ref } from "vue";
import * as timelineService from "../services/timelineService";

export const useTimelineStore = defineStore("timeline", () => {
  //state
  const events = ref([]);
  const loading = ref(false);
  const error = ref(null);

  //actions
  async function fetchTimelineEvents(campaignId) {
    events.value = [];
    loading.value = true;
    error.value = null;
    if (!campaignId) return;
    try {
      events.value = await timelineService.getAllTimelineEvents(campaignId);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function createEvent(data) {
    const created = await timelineService.createTimelineEvent(data);
    // Insert in sorted position by year
    events.value.push(created);
    events.value.sort((a, b) => a.year - b.year);
    return created;
  }

  async function updateEvent(id, data) {
    const updated = await timelineService.updateTimelineEvent(id, data);
    const idx = events.value.findIndex((e) => e._id === id);
    if (idx !== -1) events.value[idx] = updated;
    events.value.sort((a, b) => a.year - b.year);
    return updated;
  }

  async function deleteEvent(id) {
    await timelineService.deleteTimelineEvent(id);
    events.value = events.value.filter((e) => e._id !== id);
  }

  return {
    events,
    loading,
    error,
    fetchTimelineEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
});
