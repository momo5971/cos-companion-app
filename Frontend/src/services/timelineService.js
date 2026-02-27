import api from "./api";

export const getAllTimelineEvents = (campaignId) => {
  const params = campaignId ? { campaignId } : {};
  return api.get("/timeline", { params });
};
