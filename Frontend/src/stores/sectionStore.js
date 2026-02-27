import { defineStore } from "pinia";
import { ref } from "vue";
import * as sectionService from "../services/sectionService";

export const useSectionStore = defineStore("section", () => {
  const sections = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchSectionsByQuest(questId) {
    loading.value = true;
    error.value = null;
    try {
      sections.value = await sectionService.getSectionsByQuest(questId);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function createSection(sectionData) {
    try {
      const newSection = await sectionService.createSection(sectionData);
      sections.value.push(newSection);
      return newSection;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function updateSection(id, sectionData) {
    try {
      const updatedSection = await sectionService.updateSection(
        id,
        sectionData,
      );
      const index = sections.value.findIndex((s) => s._id === id);
      if (index !== -1) {
        sections.value[index] = updatedSection;
      }
      return updatedSection;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function deleteSection(id) {
    try {
      await sectionService.deleteSection(id);
      sections.value = sections.value.filter((s) => s._id !== id);
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  return {
    sections,
    loading,
    error,
    fetchSectionsByQuest,
    createSection,
    updateSection,
    deleteSection,
  };
});
