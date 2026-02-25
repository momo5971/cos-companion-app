import api from "./api";

export const getAllLocations = () => {
  return api.get("/locations");
};

export const getLocationById = (id) => {
  return api.get(`/locations/${id}`);
};

export const getLocationNodes = (id) => {
  return api.get(`/locations/${id}/nodes`);
};

export const createLocation = (locationData) => {
  return api.post(`/locations`, locationData);
};

export const updateLocation = (id, locationData) => {
  return api.put(`/locations/${id}`, locationData);
};

export const deleteLocation = (id) => {
  return api.delete(`/locations/${id}`);
};
