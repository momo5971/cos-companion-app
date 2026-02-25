import { defineStore } from "pinia";
import { ref } from "vue";
import * as questService from "../services/questService";

export const useQuestStore = defineStore("quest", () => {
  //state
  const quests = ref([]);
  const currentQuest = ref(null);
  const loading = ref(false);
  const error = ref(null);

  //actions
  async function fetchQuests() {
    loading.value = true;
    error.value = null;
    try {
      quests.value = await questService.getAllQuests();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchQuestById(id) {
    loading.value = true;
    error.value = null;
    try {
      currentQuest.value = await questService.getQuestById(id);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function createQuest(questData) {
    try {
      const newQuest = await questService.createQuest(questData);
      quests.value.push(newQuest);
      return newQuest;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function updateQuest(id, questData) {
    try {
      const updatedQuest = await questService.updateQuest(id, questData);
      const index = quests.value.findIndex((q) => q._id === id);
      if (index !== -1) {
        quests.value[index] = updatedQuest;
      }
      if (currentQuest.value?._id === id) {
        currentQuest.value = updatedQuest;
      }
      return updatedQuest;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function updateQuestStatus(id, status) {
    try {
      await questService.updateQuestStatus(id, status);
      const quest = quests.value.find((q) => q._id === id);
      if (quest) {
        quest.status = status;
      }
      if (currentQuest.value?._id === id) {
        currentQuest.value.status = status;
      }
    } catch (err) {
      error.value = err.message;
    }
  }

  async function deleteQuest(id) {
    try {
      await questService.deleteQuest(id);
      quests.value = quests.value.filter((q) => q._id !== id);
      if (currentQuest.value?._id === id) {
        currentQuest.value = null;
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  return {
    quests,
    currentQuest,
    loading,
    error,
    fetchQuests,
    fetchQuestById,
    createQuest,
    updateQuest,
    updateQuestStatus,
    deleteQuest,
  };
});
