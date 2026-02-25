import api from "./api";

export const getDecisionNodesByQuest = (questId) => {
  return api.get(`/decision-nodes/quest/${questId}`);
};

export const getDecisionNodeById = (id) => {
  return api.get(`/decision-nodes/${id}`);
};

export const createDecisionNode = (nodeData) => {
  return api.post(`/decision-nodes`, nodeData);
};

export const updateDecisionNode = (id, nodeData) => {
  return api.put(`/decision-nodes/${id}`, nodeData);
};

export const updateDecisionNodeStatus = (id, completed) => {
  return api.patch(`/decision-nodes/${id}/status`, { completed });
};

export const deleteDecisionNode = (id) => {
  return api.delete(`/decision-nodes/${id}`);
};
