import { defineStore } from "pinia";
import { ref } from "vue";
import * as compendiumService from "../services/compendiumService";

export const useCompendiumStore = defineStore("compendium", () => {
  //state
  const entries = ref([]);
  const currentEntry = ref(null);
  const loading = ref(false);
  const error = ref(null);

  //actions
  async function fetchEntries() {
    loading.value = true;
    error.value = null;
    try {
      entries.value = await compendiumService.getAllEntries();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchEntryById(id) {
    loading.value = true;
    error.value = null;
    try {
      currentEntry.value = await compendiumService.getEntryById(id);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchEntriesByCategory(category) {
    loading.value = true;
    error.value = null;
    try {
      entries.value = await compendiumService.getEntriesByCategory(category);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function searchEntries(query) {
    loading.value = true;
    error.value = null;
    try {
      entries.value = await compendiumService.searchEntries(query);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function createEntry(entryData) {
    try {
      const newEntry = await compendiumService.createEntry(entryData);
      entries.value.push(newEntry);
      return newEntry;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function updateEntry(id, entryData) {
    try {
      const updatedEntry = await compendiumService.updateEntry(id, entryData);
      const index = entries.value.findIndex((e) => e._id === id);
      if (index !== -1) {
        entries.value[index] = updatedEntry;
      }
      if (currentEntry.value?._id === id) {
        currentEntry.value = updatedEntry;
      }
      return updatedEntry;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function deleteEntry(id) {
    try {
      await compendiumService.deleteEntry(id);
      entries.value = entries.value.filter((e) => e._id !== id);
      if (currentEntry.value?._id === id) {
        currentEntry.value = null;
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  return {
    entries,
    currentEntry,
    loading,
    error,
    fetchEntries,
    fetchEntryById,
    fetchEntriesByCategory,
    searchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
  };
});
