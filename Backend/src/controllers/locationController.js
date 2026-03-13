import Location from "../models/Location.js";

export const getAllLocations = async (req, res) => {
  try {
    const { campaignId } = req.query;

    if (!campaignId) {
      return res.status(200).json([]);
    }

    // Exclude map image data from list view to keep responses small
    const locations = await Location.find({ campaignId }).select(
      "-maps.image -mapImage",
    );
    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching locations", error);
    res
      .status(500)
      .json({ message: "Error fetching locations", error: error.message });
  }
};

export const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    res.status(200).json(location);
  } catch (error) {
    console.error("Error fetching location", error);
    res
      .status(500)
      .json({ message: "Error fetching location", error: error.message });
  }
};

export const createLocation = async (req, res) => {
  try {
    const newLocation = new Location(req.body);
    const savedLocation = await newLocation.save();
    res.status(201).json(savedLocation);
  } catch (error) {
    console.error("Error creating location", error);
    res
      .status(500)
      .json({ message: "Error creating location", error: error.message });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const updatedLocation = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    );
    if (!updatedLocation) {
      return res.status(404).json({ message: "Location not found" });
    }
    res.status(200).json(updatedLocation);
  } catch (error) {
    console.error("Error updating location", error);
    res
      .status(500)
      .json({ message: "Error updating location", error: error.message });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const locationId = req.params.id;
    const Quest = (await import("../models/Quest.js")).default;
    const Compendium = (await import("../models/Compendium.js")).default;

    console.log(
      `[DELETE LOCATION] Starting deletion for location: ${locationId}`,
    );

    // Recursive function to delete a location and its children
    async function deleteLocationRecursive(locId) {
      const location = await Location.findById(locId);
      if (!location) {
        console.log(`[DELETE LOCATION] Location ${locId} not found, skipping`);
        return;
      }

      console.log(
        `[DELETE LOCATION] Processing location: ${location.name} (${locId})`,
      );

      // Find quests that reference this location BEFORE updating
      const questsToUpdate = await Quest.find({ location: locId });
      console.log(
        `[DELETE LOCATION] Found ${questsToUpdate.length} quests referencing this location:`,
        questsToUpdate.map((q) => q.title),
      );

      // Update any quests that reference this location to set location to null
      const updateResult = await Quest.updateMany(
        { location: locId },
        { $set: { location: null } },
      );
      console.log(
        `[DELETE LOCATION] Updated ${updateResult.modifiedCount} quests, set location to null`,
      );

      // Verify the update
      const verifyQuests = await Quest.find({
        _id: { $in: questsToUpdate.map((q) => q._id) },
      });
      console.log(
        `[DELETE LOCATION] After update, quests still exist:`,
        verifyQuests.map((q) => ({ title: q.title, location: q.location })),
      );

      // Delete corresponding compendium entry
      const compendiumResult = await Compendium.deleteOne({
        category: "Location",
        title: location.name,
        campaignId: location.campaignId,
      });
      console.log(
        `[DELETE LOCATION] Deleted ${compendiumResult.deletedCount} compendium entries`,
      );

      // Find and delete all child locations recursively
      const childLocations = await Location.find({ parentLocationId: locId });
      console.log(
        `[DELETE LOCATION] Found ${childLocations.length} child locations`,
      );
      for (const child of childLocations) {
        await deleteLocationRecursive(child._id);
      }

      // Delete the location itself
      await Location.findByIdAndDelete(locId);
      console.log(`[DELETE LOCATION] Deleted location: ${location.name}`);
    }

    const deletedLocation = await Location.findById(locationId);

    if (!deletedLocation) {
      console.log(`[DELETE LOCATION] Location ${locationId} not found`);
      return res.status(404).json({ message: "Location not found" });
    }

    // If this location has a parent, remove any nodes in the parent that link to this location
    if (deletedLocation.parentLocationId) {
      await Location.findByIdAndUpdate(deletedLocation.parentLocationId, {
        $pull: {
          nodes: { linkedLocationId: locationId },
        },
      });
      console.log(
        `[DELETE LOCATION] Removed linking nodes from parent location`,
      );
    }

    // Delete the location and all its children recursively
    await deleteLocationRecursive(locationId);

    console.log(
      `[DELETE LOCATION] Deletion complete for location: ${locationId}`,
    );
    res.status(200).json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("[DELETE LOCATION] Error deleting location", error);
    res
      .status(500)
      .json({ message: "Error deleting location", error: error.message });
  }
};

export const getLocationNodes = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id).select("nodes");
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    res.status(200).json(location.nodes);
  } catch (error) {
    console.error("Error fetching location nodes", error);
    res
      .status(500)
      .json({ message: "Error fetching location nodes", error: error.message });
  }
};
