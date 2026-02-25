import api from "./api";

export const getAllQuests = (campaignId) => {
  const params = campaignId ? { campaignId } : {};
  return api.get("/quests", { params });
};

export const getQuestById = (id) => {
  return api.get(`/quests/${id}`);
};

export const createQuest = (questData) => {
  return api.post("/quests", questData);
};

export const updateQuest = (id, questData) => {
  return api.put(`/quests/${id}`, questData);
};

export const deleteQuest = (id) => {
  return api.delete(`/quests/${id}`);
};

export const updateQuestStatus = (id, status) => {
  return api.patch(`/quests/${id}/status`, { status });
};
