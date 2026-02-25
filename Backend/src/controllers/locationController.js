import Location from "../models/Location.js";

export const getAllLocations = async (req, res) => {
  try {
    const { campaignId } = req.query;

    if (!campaignId) {
      return res.status(200).json([]);
    }

    const locations = await Location.find({ campaignId });
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
    const deletedLocation = await Location.findByIdAndDelete(req.params.id);
    if (!deletedLocation) {
      return res.status(404).json({ message: "Location not found" });
    }
    res.status(200).json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("Error deleting location", error);
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
