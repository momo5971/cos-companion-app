import { defineStore } from "pinia";
import { ref } from "vue";
import * as questSectionService from "../services/questSectionService";

export const useQuestSectionStore = defineStore("questSection", () => {
  //state
  const sections = ref([]);
  const currentSection = ref(null);
  const loading = ref(false);
  const error = ref(null);

  //actions
  async function fetchSections(campaignId) {
    loading.value = true;
    error.value = null;
    sections.value = [];
    try {
      sections.value =
        await questSectionService.getAllQuestSections(campaignId);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchSectionById(id) {
    loading.value = true;
    error.value = null;
    try {
      currentSection.value = await questSectionService.getQuestSectionById(id);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function createSection(sectionData) {
    try {
      const newSection =
        await questSectionService.createQuestSection(sectionData);
      sections.value.push(newSection);
      return newSection;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function updateSection(id, sectionData) {
    try {
      const updatedSection = await questSectionService.updateQuestSection(
        id,
        sectionData,
      );
      const index = sections.value.findIndex((s) => s._id === id);
      if (index !== -1) {
        sections.value[index] = updatedSection;
      }
      if (currentSection.value?._id === id) {
        currentSection.value = updatedSection;
      }
      return updatedSection;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function deleteSection(id) {
    try {
      await questSectionService.deleteQuestSection(id);
      sections.value = sections.value.filter((s) => s._id !== id);
      if (currentSection.value?._id === id) {
        currentSection.value = null;
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  return {
    sections,
    currentSection,
    loading,
    error,
    fetchSections,
    fetchSectionById,
    createSection,
    updateSection,
    deleteSection,
  };
});
