import api from "./api";

export const getAllTimelineEvents = (campaignId) => {
  const params = campaignId ? { campaignId } : {};
  return api.get("/timeline", { params });
};

export const createTimelineEvent = (data) => {
  return api.post("/timeline", data);
};

export const updateTimelineEvent = (id, data) => {
  return api.put(`/timeline/${id}`, data);
};

export const deleteTimelineEvent = (id) => {
  return api.delete(`/timeline/${id}`);
};
