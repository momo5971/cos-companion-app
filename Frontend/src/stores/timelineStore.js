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
  return {
    events,
    loading,
    error,
    fetchTimelineEvents,
  };
});
