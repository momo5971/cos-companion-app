import api from "./api";

export const getAllQuestSections = (campaignId) => {
  const params = campaignId ? { campaignId } : {};
  return api.get("/quest-sections", { params });
};

export const getQuestSectionById = (id) => {
  return api.get(`/quest-sections/${id}`);
};

export const createQuestSection = (sectionData) => {
  return api.post("/quest-sections", sectionData);
};

export const updateQuestSection = (id, sectionData) => {
  return api.put(`/quest-sections/${id}`, sectionData);
};

export const deleteQuestSection = (id) => {
  return api.delete(`/quest-sections/${id}`);
};
