import api from "./api";

export const getAllEntries = (campaignId) => {
  const params = campaignId ? { campaignId } : {};
  return api.get("/compendium", { params });
};

export const getEntryById = (id) => {
  return api.get(`/compendium/${id}`);
};

export const searchEntries = (keyword) => {
  return api.get(`/compendium/search?query=${keyword}`);
};

export const getEntriesByCategory = (category) => {
  return api.get(`/compendium/category/${category}`);
};

export const createEntry = (entryData) => {
  return api.post(`/compendium/`, entryData);
};

export const updateEntry = (id, entryData) => {
  return api.put(`/compendium/${id}`, entryData);
};

export const deleteEntry = (id) => {
  return api.delete(`/compendium/${id}`);
};
