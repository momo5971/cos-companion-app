import { defineStore } from "pinia";
import { ref } from "vue";
import * as locationService from "../services/locationService";

export const useLocationStore = defineStore("location", () => {
  //state
  const locations = ref([]);
  const currentLocation = ref(null);
  const loading = ref(false);
  const error = ref(null);

  //actions
  async function fetchLocations(campaignId) {
    loading.value = true;
    error.value = null;
    locations.value = []; // Clear existing data first

    if (!campaignId) {
      loading.value = false;
      return; // Don't fetch if no campaign
    }

    try {
      locations.value = await locationService.getAllLocations(campaignId);
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
      const updatedLocation = await locationService.updateLocation(
        id,
        locationData,
      );
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

  async function updateLocationNodePosition(locationId, nodeName, position) {
    try {
      // Find the location
      const location = this.locations.find((loc) => loc._id === locationId);
      if (!location) return;

      // Find and update the node
      const node = location.nodes.find((n) => n.name === nodeName);
      if (node) {
        node.position = position;
      }

      await locationService.updateLocation(locationId, location);
    } catch (error) {
      console.error("Error updating node position:", error);
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

  async function toggleNodeCompleted(locationId, nodeName) {
    try {
      const location = this.locations.find((loc) => loc._id === locationId);
      if (!location) return;

      const node = location.nodes.find((n) => n.name === nodeName);
      if (node) {
        node.completed = !node.completed;
        await locationService.updateLocation(locationId, location);
      }
    } catch (error) {
      console.error("Error toggling node completed:", error);
    }
  }

  async function createNode(locationId, nodeData) {
    try {
      const location = this.locations.find((loc) => loc._id === locationId);
      if (!location) return;

      // Add the new node
      location.nodes.push(nodeData);

      await locationService.updateLocation(locationId, location);
    } catch (error) {
      console.error("Error creating node:", error);
    }
  }

  async function updateNode(locationId, nodeName, updates) {
    try {
      const locationIndex = locations.value.findIndex(
        (loc) => loc._id === locationId,
      );
      if (locationIndex === -1) return;

      const location = locations.value[locationIndex];
      const nodeIndex = location.nodes.findIndex((n) => n.name === nodeName);

      if (nodeIndex !== -1) {
        // Create a new nodes array to trigger reactivity
        const updatedNodes = [...location.nodes];
        updatedNodes[nodeIndex] = {
          ...updatedNodes[nodeIndex],
          ...updates,
        };

        // Update the location with new nodes array
        locations.value[locationIndex] = {
          ...location,
          nodes: updatedNodes,
        };

        await locationService.updateLocation(
          locationId,
          locations.value[locationIndex],
        );
      }
    } catch (error) {
      console.error("Error updating node:", error);
    }
  }

  async function deleteNode(locationId, nodeName) {
    try {
      const location = this.locations.find((loc) => loc._id === locationId);
      if (!location) return;

      // Remove the node
      location.nodes = location.nodes.filter((n) => n.name !== nodeName);

      await locationService.updateLocation(locationId, location);
    } catch (error) {
      console.error("Error deleting node:", error);
    }
  }

  async function clearAllNodes(locationId) {
    try {
      const locationIndex = locations.value.findIndex(
        (loc) => loc._id === locationId,
      );
      if (locationIndex === -1) return;

      // Create a new location object with empty nodes array to trigger reactivity
      locations.value[locationIndex] = {
        ...locations.value[locationIndex],
        nodes: [],
      };

      await locationService.updateLocation(
        locationId,
        locations.value[locationIndex],
      );
    } catch (error) {
      console.error("Error clearing nodes:", error);
    }
  }

  return {
    locations,
    currentLocation,
    loading,
    error,
    fetchLocations,
    createLocation,
    updateLocation,
    updateLocationNodePosition,
    toggleNodeCompleted,
    createNode,
    updateNode,
    deleteNode,
    deleteLocation,
    clearAllNodes,
  };
});
