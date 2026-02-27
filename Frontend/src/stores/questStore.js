import { defineStore } from "pinia";
import { ref } from "vue";
import * as questService from "../services/questService";
import { useCompendiumStore } from "./compendiumStore";

export const useQuestStore = defineStore("quest", () => {
  //state
  const quests = ref([]);
  const currentQuest = ref(null);
  const loading = ref(false);
  const error = ref(null);

  //actions
  async function fetchQuests(campaignId) {
    loading.value = true;
    error.value = null;
    quests.value = []; // Clear existing data first
    try {
      quests.value = await questService.getAllQuests(campaignId);
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

      // Automatically create compendium entry
      const compendiumStore = useCompendiumStore();
      try {
        const locationValue = newQuest.location?.name || "No Location";

        await compendiumStore.createEntry({
          title: newQuest.title,
          description: newQuest.description || "A quest in the campaign.",
          tags: ["quest", newQuest.status || "available"],
          location: locationValue,
          details: newQuest.description || "",
          campaignId: newQuest.campaignId,
          category: "Quest",
          questId: newQuest._id,
          questStatus: newQuest.status || "available",
          questObjectives: newQuest.rewards || [],
        });
      } catch (compendiumError) {
        console.error("Failed to create compendium entry:", compendiumError);
        // Don't fail the quest creation if compendium fails
      }

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
