import { defineStore } from "pinia";
import { ref } from "vue";
import * as locationService from "../services/locationService";
import { useCompendiumStore } from "./compendiumStore";

export const useLocationStore = defineStore("location", () => {
  //state
  const locations = ref([]);
  const currentLocation = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Viewport state per map (persists in memory)
  const mapViewports = ref({});

  // Last selected map per location (persists in memory)
  const lastSelectedMaps = ref({});

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

  function saveMapViewport(locationId, mapId, viewport) {
    const key = `${locationId}_${mapId}`;
    mapViewports.value[key] = viewport;
  }

  function getMapViewport(locationId, mapId) {
    const key = `${locationId}_${mapId}`;
    return mapViewports.value[key] || null;
  }

  function setLastSelectedMap(locationId, mapId) {
    lastSelectedMaps.value[locationId] = mapId;
  }

  function getLastSelectedMap(locationId) {
    return lastSelectedMaps.value[locationId] || null;
  }

  async function fetchLocationById(id) {
    try {
      const fullLocation = await locationService.getLocationById(id);
      // Update in the locations array if present
      const index = locations.value.findIndex((l) => l._id === id);
      if (index !== -1) {
        locations.value[index] = fullLocation;
      } else {
        locations.value.push(fullLocation);
      }
      return fullLocation;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function createLocation(locationData) {
    try {
      const newLocation = await locationService.createLocation(locationData);
      locations.value.push(newLocation);

      // Automatically create compendium entry
      const compendiumStore = useCompendiumStore();
      try {
        await compendiumStore.createEntry({
          title: newLocation.name,
          description:
            newLocation.description || `A ${newLocation.type} in the campaign.`,
          tags: ["location", newLocation.type],
          location: newLocation.parentLocationId
            ? "Sub-location"
            : "Main location",
          details: newLocation.description || "",
          campaignId: newLocation.campaignId,
          category: "Location",
          locationType: newLocation.type,
          parentLocation: newLocation.parentLocationId || null,
        });
      } catch (compendiumError) {
        console.error("Failed to create compendium entry:", compendiumError);
        // Don't fail the location creation if compendium fails
      }

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

  async function updateLocationNodePosition(locationId, nodeId, position) {
    try {
      const locationIndex = locations.value.findIndex(
        (loc) => loc._id === locationId,
      );
      if (locationIndex === -1) return;

      const location = locations.value[locationIndex];
      const nodeIndex = location.nodes.findIndex((n) => n.id === nodeId);

      if (nodeIndex !== -1) {
        // Create new nodes array with updated position
        const updatedNodes = [...location.nodes];
        updatedNodes[nodeIndex] = {
          ...updatedNodes[nodeIndex],
          position: { ...position },
        };

        // Update location with new nodes array
        locations.value[locationIndex] = {
          ...location,
          nodes: updatedNodes,
        };

        // Only send nodes, not the full location with maps
        await locationService.updateLocation(locationId, {
          nodes: updatedNodes,
        });
      }
    } catch (error) {
      // Silent fail
    }
  }

  async function deleteLocation(id) {
    console.log("[FRONTEND] deleteLocation called with id:", id);
    try {
      console.log("[FRONTEND] Calling backend API to delete location");
      await locationService.deleteLocation(id);
      console.log("[FRONTEND] Backend API call successful");
      locations.value = locations.value.filter((l) => l._id !== id);
      if (currentLocation.value?._id === id) {
        currentLocation.value = null;
      }
      console.log("[FRONTEND] Location removed from store");
    } catch (err) {
      console.error("[FRONTEND] Error deleting location:", err);
      error.value = err.message;
      throw err;
    }
  }

  async function toggleNodeCompleted(locationId, nodeId) {
    try {
      const location = locations.value.find((loc) => loc._id === locationId);
      if (!location) return;

      const node = location.nodes.find((n) => n.id === nodeId);
      if (node) {
        node.completed = !node.completed;
        // Only send nodes, not the full location with maps
        await locationService.updateLocation(locationId, {
          nodes: location.nodes,
        });
      }
    } catch (error) {
      // Silent fail
    }
  }

  async function createNode(locationId, nodeData) {
    try {
      const locationIndex = locations.value.findIndex(
        (loc) => loc._id === locationId,
      );
      if (locationIndex === -1) return;

      const location = locations.value[locationIndex];

      // Generate unique ID for the node
      const nodeWithId = {
        ...nodeData,
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      // Create a new nodes array to trigger reactivity
      const updatedNodes = [...(location.nodes || []), nodeWithId];

      // Only send nodes, not the full location with maps
      const updatedLocation = await locationService.updateLocation(locationId, {
        nodes: updatedNodes,
      });

      // Update with the response from backend
      locations.value[locationIndex] = updatedLocation;

      return updatedLocation;
    } catch (error) {
      throw error;
    }
  }

  async function updateNode(locationId, nodeId, updates) {
    try {
      const locationIndex = locations.value.findIndex(
        (loc) => loc._id === locationId,
      );
      if (locationIndex === -1) return;

      const location = locations.value[locationIndex];
      const nodeIndex = location.nodes.findIndex((n) => n.id === nodeId);

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

        // Only send nodes, not the full location with maps
        await locationService.updateLocation(locationId, {
          nodes: updatedNodes,
        });
      }
    } catch (error) {
      // Silent fail
    }
  }

  async function deleteNode(locationId, nodeId) {
    try {
      const location = locations.value.find((loc) => loc._id === locationId);
      if (!location) return;

      const updatedNodes = location.nodes.filter((n) => n.id !== nodeId);
      location.nodes = updatedNodes;

      // Only send nodes, not the full location with maps
      await locationService.updateLocation(locationId, { nodes: updatedNodes });
    } catch (error) {
      // Silent fail
    }
  }

  return {
    locations,
    currentLocation,
    loading,
    error,
    mapViewports,
    lastSelectedMaps,
    fetchLocations,
    fetchLocationById,
    createLocation,
    updateLocation,
    updateLocationNodePosition,
    toggleNodeCompleted,
    createNode,
    updateNode,
    deleteNode,
    deleteLocation,
    saveMapViewport,
    getMapViewport,
    setLastSelectedMap,
    getLastSelectedMap,
  };
});
