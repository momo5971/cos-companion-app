import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as campaignService from "../services/campaignService";
import { useQuestStore } from "./questStore";
import { useLocationStore } from "./locationStore";
import { useCompendiumStore } from "./compendiumStore";

export const useCampaignStore = defineStore("campaign", () => {
  // State
  const campaigns = ref([]);
  const activeCampaign = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const saveStatus = ref("saved"); // 'saved', 'saving', 'error'

  // Auto-save debounce timer
  let autoSaveTimer = null;

  // Computed
  const hasActiveCampaign = computed(() => activeCampaign.value !== null);

  // Actions
  async function fetchCampaigns() {
    loading.value = true;
    error.value = null;
    try {
      campaigns.value = await campaignService.getAllCampaigns();

      // First, check if there's an active campaign in the database
      const activeCampaignFromDb = campaigns.value.find((c) => c.isActive);

      if (activeCampaignFromDb) {
        activeCampaign.value = activeCampaignFromDb;
        localStorage.setItem("activeCampaignId", activeCampaignFromDb._id);

        const questStore = useQuestStore();
        const locationStore = useLocationStore();
        const compendiumStore = useCompendiumStore();

        await Promise.all([
          questStore.fetchQuests(activeCampaignFromDb._id),
          locationStore.fetchLocations(activeCampaignFromDb._id),
          compendiumStore.fetchEntries(activeCampaignFromDb._id),
        ]).catch((err) => {
          console.error("Error loading campaign data:", err);
        });
      } else {
        // Fallback to localStorage
        const savedActiveCampaignId = localStorage.getItem("activeCampaignId");
        if (savedActiveCampaignId) {
          const campaign = campaigns.value.find(
            (c) => c._id === savedActiveCampaignId,
          );
          if (campaign) {
            activeCampaign.value = campaign;
          }
        }
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCampaignById(id) {
    loading.value = true;
    error.value = null;
    try {
      const campaign = await campaignService.getCampaignById(id);
      return campaign;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createCampaign(campaignData) {
    try {
      const newCampaign = await campaignService.createCampaign(campaignData);
      campaigns.value.push(newCampaign);
      return newCampaign;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function updateCampaign(id, campaignData) {
    try {
      const updatedCampaign = await campaignService.updateCampaign(
        id,
        campaignData,
      );
      const index = campaigns.value.findIndex((c) => c._id === id);
      if (index !== -1) {
        campaigns.value[index] = updatedCampaign;
      }
      if (activeCampaign.value?._id === id) {
        activeCampaign.value = updatedCampaign;
      }
      return updatedCampaign;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function deleteCampaign(id) {
    try {
      await campaignService.deleteCampaign(id);
      campaigns.value = campaigns.value.filter((c) => c._id !== id);
      if (activeCampaign.value?._id === id) {
        activeCampaign.value = null;
        localStorage.removeItem("activeCampaignId");
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function setActiveCampaign(campaignId) {
    if (!campaignId) {
      activeCampaign.value = null;
      localStorage.removeItem("activeCampaignId");

      const questStore = useQuestStore();
      const locationStore = useLocationStore();
      const compendiumStore = useCompendiumStore();

      questStore.quests = [];
      locationStore.locations = [];
      compendiumStore.entries = [];
      return;
    }

    try {
      // Deactivate all campaigns first
      for (const campaign of campaigns.value) {
        if (campaign.isActive && campaign._id !== campaignId) {
          await campaignService.updateCampaign(campaign._id, {
            isActive: false,
          });
        }
      }

      // Activate the selected campaign
      const updatedCampaign = await campaignService.updateCampaign(campaignId, {
        isActive: true,
        lastPlayed: new Date(),
      });

      activeCampaign.value = updatedCampaign;
      localStorage.setItem("activeCampaignId", campaignId);

      // Update the campaigns array with the new active campaign
      const index = campaigns.value.findIndex((c) => c._id === campaignId);
      if (index !== -1) {
        campaigns.value[index] = updatedCampaign;
      }

      // Refresh all stores with the new campaign's data
      const questStore = useQuestStore();
      const locationStore = useLocationStore();
      const compendiumStore = useCompendiumStore();

      await Promise.all([
        questStore.fetchQuests(campaignId),
        locationStore.fetchLocations(campaignId),
        compendiumStore.fetchEntries(campaignId),
      ]);
    } catch (err) {
      console.error("Error setting active campaign:", err);
      // Clear invalid campaign from localStorage
      localStorage.removeItem("activeCampaignId");
      activeCampaign.value = null;
      throw err;
    }
  }

  // Auto-save with debouncing
  function autoSave() {
    if (!activeCampaign.value) return;

    saveStatus.value = "saving";

    // Clear existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    // Set new timer
    autoSaveTimer = setTimeout(async () => {
      try {
        const updatedData = {
          ...activeCampaign.value,
          lastPlayed: new Date(),
        };
        await updateCampaign(activeCampaign.value._id, updatedData);
        saveStatus.value = "saved";
      } catch (err) {
        saveStatus.value = "error";
        console.error("Auto-save failed:", err);
      }
    }, 1000); // 1 second debounce
  }

  // Quest tracking
  async function addActiveQuest(questId) {
    if (!activeCampaign.value) return;

    // Ensure we only have IDs, not objects
    const currentActiveQuests = (activeCampaign.value.activeQuests || []).map(
      (q) => (typeof q === "string" ? q : q._id),
    );

    // Remove from completed quests if it's there
    const currentCompletedQuests = (activeCampaign.value.completedQuests || [])
      .map((q) => (typeof q === "string" ? q : q._id))
      .filter((id) => id !== questId);

    if (!currentActiveQuests.includes(questId)) {
      currentActiveQuests.push(questId);
    }

    const result = await updateCampaign(activeCampaign.value._id, {
      activeQuests: currentActiveQuests,
      completedQuests: currentCompletedQuests,
    });
  }

  async function removeActiveQuest(questId) {
    if (!activeCampaign.value) return;

    const activeQuests = (activeCampaign.value.activeQuests || []).filter(
      (id) => id !== questId,
    );
    await updateCampaign(activeCampaign.value._id, { activeQuests });
  }

  async function addCompletedQuest(questId) {
    if (!activeCampaign.value) return;

    // Ensure we only have IDs, not objects
    const currentActiveQuests = (activeCampaign.value.activeQuests || [])
      .map((q) => (typeof q === "string" ? q : q._id))
      .filter((id) => id !== questId);

    const currentCompletedQuests = (
      activeCampaign.value.completedQuests || []
    ).map((q) => (typeof q === "string" ? q : q._id));

    if (!currentCompletedQuests.includes(questId)) {
      currentCompletedQuests.push(questId);
    }

    const result = await updateCampaign(activeCampaign.value._id, {
      activeQuests: currentActiveQuests,
      completedQuests: currentCompletedQuests,
    });
  }

  // Decision node tracking
  async function toggleDecisionNodeCompletion(nodeId) {
    if (!activeCampaign.value) return;

    const completedNodes = [
      ...(activeCampaign.value.completedDecisionNodes || []),
    ];
    const index = completedNodes.indexOf(nodeId);

    if (index > -1) {
      completedNodes.splice(index, 1);
    } else {
      completedNodes.push(nodeId);
    }

    await updateCampaign(activeCampaign.value._id, {
      completedDecisionNodes: completedNodes,
    });
  }

  function isDecisionNodeCompleted(nodeId) {
    if (!activeCampaign.value) return false;
    return (activeCampaign.value.completedDecisionNodes || []).includes(nodeId);
  }

  // Location node tracking
  async function toggleLocationNodeCompletion(locationId, nodeName) {
    if (!activeCampaign.value) return;

    const completedNodes = [
      ...(activeCampaign.value.completedLocationNodes || []),
    ];
    const index = completedNodes.findIndex(
      (n) => n.locationId === locationId && n.nodeName === nodeName,
    );

    if (index > -1) {
      completedNodes.splice(index, 1);
    } else {
      completedNodes.push({ locationId, nodeName });
    }

    await updateCampaign(activeCampaign.value._id, {
      completedLocationNodes: completedNodes,
    });
  }

  function isLocationNodeCompleted(locationId, nodeName) {
    if (!activeCampaign.value) return false;
    return (activeCampaign.value.completedLocationNodes || []).some(
      (n) => n.locationId === locationId && n.nodeName === nodeName,
    );
  }

  // Export/Import
  function exportCampaign() {
    if (!activeCampaign.value) return;

    const dataStr = JSON.stringify(activeCampaign.value, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeCampaign.value.name.replace(/\s+/g, "_")}_campaign.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importCampaign(file) {
    try {
      const text = await file.text();
      const campaignData = JSON.parse(text);

      // Use the new import-full endpoint instead of create
      const newCampaign =
        await campaignService.importFullCampaign(campaignData);

      // Add to campaigns array
      campaigns.value.push(newCampaign);

      return newCampaign;
    } catch (err) {
      error.value = "Failed to import campaign: " + err.message;
      throw err;
    }
  }
  return {
    campaigns,
    activeCampaign,
    loading,
    error,
    saveStatus,
    hasActiveCampaign,
    fetchCampaigns,
    fetchCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    setActiveCampaign,
    autoSave,
    addActiveQuest,
    removeActiveQuest,
    addCompletedQuest,
    toggleDecisionNodeCompletion,
    isDecisionNodeCompleted,
    toggleLocationNodeCompletion,
    isLocationNodeCompleted,
    exportCampaign,
    importCampaign,
  };
});
