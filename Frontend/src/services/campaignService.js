import api from "./api";

export const getAllCampaigns = async () => {
  const response = await api.get("/campaigns");
  return response;
};

export const getCampaignById = async (id) => {
  const response = await api.get(`/campaigns/${id}`);
  return response;
};

export const createCampaign = async (campaignData) => {
  const response = await api.post("/campaigns", campaignData);
  return response;
};

export const importFullCampaign = async (campaignData) => {
  const response = await api.post("/campaigns/import-full", campaignData);
  return response;
};

export const updateCampaign = async (id, campaignData) => {
  const response = await api.put(`/campaigns/${id}`, campaignData);
  return response;
};

export const deleteCampaign = async (id) => {
  const response = await api.delete(`/campaigns/${id}`);
  return response;
};
