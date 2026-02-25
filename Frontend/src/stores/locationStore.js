import { defineStore } from "pinia";
import { ref } from "vue";
import * as locationService from "../services/locationService";

export const useLocationStore = defineStore("location", () => {
  //state
  const locations = ref([]);
  const currentLocation = ref(null);
  const currentLocationNodes = ref(null);
  const loading = ref(false);
  const error = ref(null);

  //actions
  async function fetchLocations() {
    loading.value = true;
    error.value = null;
    try {
      locations.value = await locationService.getAllLocations();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchLocationById(id) {
    loading.value = true;
    error.value = null;
    try {
      currentLocation.value = await locationService.getLocationById(id);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchLocationNodes(id) {
    loading.value = true;
    error.value = null;
    try {
      currentLocationNodes.value = await locationService.getLocationNodes(id);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function createLocation(locationData) {
    try {
      const newLocation = await locationService.createLocation(locationData);
      locations.value.push(newLocation);
      return newLocation;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function updateLocation(id, locationData) {
    try {
      const updatedLocation = await locationService.updateLocation(id, locationData);
      const index = locations.value.findIndex((l) => l._id === id);
      if (index !== -1) {
        locations.value[index] = updatedLocation;
      }
      if (currentLocation.value?._id === id) {
        currentLocation.value = updatedLocation;
      }
      return updatedLocation;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function deleteLocation(id) {
    try {
      await locationService.deleteLocation(id);
      locations.value = locations.value.filter((l) => l._id !== id);
      if (currentLocation.value?._id === id) {
        currentLocation.value = null;
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  return {
    locations,
    currentLocation,
    currentLocationNodes,
    loading,
    error,
    fetchLocations,
    fetchLocationById,
    fetchLocationNodes,
    createLocation,
    updateLocation,
    deleteLocation,
  };
});
