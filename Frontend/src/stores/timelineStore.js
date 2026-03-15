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

  function sortEvents() {
    events.value.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      const am = a.month ?? 0;
      const bm = b.month ?? 0;
      if (am !== bm) return am - bm;
      const ad = a.day ?? 0;
      const bd = b.day ?? 0;
      return ad - bd;
    });
  }

  async function createEvent(data) {
    const created = await timelineService.createTimelineEvent(data);
    events.value.push(created);
    sortEvents();
    return created;
  }

  async function updateEvent(id, data) {
    const updated = await timelineService.updateTimelineEvent(id, data);
    const idx = events.value.findIndex((e) => e._id === id);
    if (idx !== -1) events.value[idx] = updated;
    sortEvents();
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
