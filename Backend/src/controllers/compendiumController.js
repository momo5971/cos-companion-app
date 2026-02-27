import Compendium from "../models/Compendium.js";
import StatBlock from "../models/StatBlock.js";

export const getAllEntries = async (req, res) => {
  try {
    const { campaignId } = req.query;

    if (!campaignId) {
      return res.status(200).json([]);
    }

    const entries = await Compendium.find({ campaignId }).lean();

    for (let entry of entries) {
      if (entry.statBlock) {
        entry.statBlock = await StatBlock.findById(entry.statBlock);
      }
    }

    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching compendium entries", error);
    res.status(500).json({
      message: "Error fetching compendium entries",
      error: error.message,
    });
  }
};

export const getEntryById = async (req, res) => {
  try {
    const entry = await Compendium.findById(req.params.id).lean();

    // Manually populate statBlock if it exists
    if (entry && entry.statBlock) {
      entry.statBlock = await StatBlock.findById(entry.statBlock);
    }

    res.status(200).json(entry);
  } catch (error) {
    console.error("Error fetching compendium entry", error);
    res.status(500).json({
      message: "Error fetching compendium entry",
      error: error.message,
    });
  }
};

export const createEntry = async (req, res) => {
  try {
    let statBlockId = null;

    // If statBlock data is provided (as an object), create it first
    if (
      req.body.statBlock &&
      typeof req.body.statBlock === "object" &&
      !req.body.statBlock._id
    ) {
      const statBlock = new StatBlock(req.body.statBlock);
      const savedStatBlock = await statBlock.save();
      statBlockId = savedStatBlock._id;
    } else if (req.body.statBlock) {
      // If it's already an ID, use it
      statBlockId = req.body.statBlock;
    }

    // Create the compendium entry with the statBlock ID
    const entryData = { ...req.body };
    if (statBlockId) {
      entryData.statBlock = statBlockId;
    } else {
      delete entryData.statBlock;
    }

    const newEntry = new Compendium(entryData);
    const savedEntry = await newEntry.save();

    if (savedEntry.statBlock) {
      await savedEntry.populate("statBlock");
    }

    res.status(201).json(savedEntry);
  } catch (error) {
    console.error("Error creating compendium entry", error);
    res.status(500).json({
      message: "Error creating compendium entry",
      error: error.message,
    });
  }
};

export const updateEntry = async (req, res) => {
  try {
    const updatedEntry = await Compendium.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    );
    if (!updatedEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }
    if (updatedEntry.statBlock) {
      await updatedEntry.populate("statBlock");
    }
    res.status(200).json(updatedEntry);
  } catch (error) {
    console.error("Error updating compendium entry", error);
    res.status(500).json({
      message: "Error updating compendium entry",
      error: error.message,
    });
  }
};

export const deleteEntry = async (req, res) => {
  try {
    const entryId = req.params.id;
    const deletedEntry = await Compendium.findById(entryId);

    if (!deletedEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    // If deleting a Quest, also delete the corresponding Quest
    if (deletedEntry.category === "Quest") {
      const Quest = (await import("../models/Quest.js")).default;
      await Quest.deleteOne({
        title: deletedEntry.title,
        campaignId: deletedEntry.campaignId,
      });
    }

    // If deleting a Location entry, also delete the corresponding Location
    if (deletedEntry.category === "Location") {
      const Location = (await import("../models/Location.js")).default;
      await Location.deleteOne({
        name: deletedEntry.title,
        campaignId: deletedEntry.campaignId,
      });
    }

    // Delete the compendium entry
    await Compendium.findByIdAndDelete(entryId);

    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting compendium entry", error);
    res.status(500).json({
      message: "Error deleting compendium entry",
      error: error.message,
    });
  }
};

export const searchEntries = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    const entries = await Compendium.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    }).lean();

    // Manually populate statBlock for entries that have it
    for (let entry of entries) {
      if (entry.statBlock) {
        entry.statBlock = await StatBlock.findById(entry.statBlock);
      }
    }

    res.status(200).json(entries);
  } catch (error) {
    console.error("Error searching compendium entries", error);
    res.status(500).json({
      message: "Error searching compendium entries",
      error: error.message,
    });
  }
};

export const getEntriesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { campaignId } = req.query;

    // Build filter
    const filter = { category };
    if (campaignId) {
      filter.campaignId = campaignId;
    }

    const entries = await Compendium.find(filter).lean();

    // Manually populate statBlock for NPCs and Monsters
    if (category === "NPC" || category === "Monster") {
      for (let entry of entries) {
        if (entry.statBlock) {
          entry.statBlock = await StatBlock.findById(entry.statBlock);
        }
      }
    }

    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching compendium entries by category", error);
    res.status(500).json({
      message: "Error fetching compendium entries by category",
      error: error.message,
    });
  }
};
