import api from "./api";

export const getSectionsByQuest = (questId) => {
  return api.get(`/sections/quest/${questId}`);
};

export const createSection = (sectionData) => {
  return api.post("/sections", sectionData);
};

export const updateSection = (id, sectionData) => {
  return api.put(`/sections/${id}`, sectionData);
};

export const deleteSection = (id) => {
  return api.delete(`/sections/${id}`);
};
