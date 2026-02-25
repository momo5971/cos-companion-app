import Campaign from "../models/Campaign.js";
import Quest from "../models/Quest.js";
import Location from "../models/Location.js";
import DecisionNode from "../models/DecisionNode.js";
import Compendium from "../models/Compendium.js";
import StatBlock from "../models/StatBlock.js";

export const getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne()
      .populate("currentQuest")
      .populate("completedQuests")
      .populate("activeLocation");
    if (!campaign) {
      const newCampaign = await Campaign.create({ name: "Default Campaign" });
      return res.status(201).json(newCampaign);
    }
    res.status(200).json(campaign);
  } catch (error) {
    console.error("Error fetching campaign", error);
    res
      .status(500)
      .json({ message: "Error fetching campaign", error: error.message });
  }
};

export const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate("currentQuest")
      .populate("activeLocation")
      .sort({ lastPlayed: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns", error);
    res
      .status(500)
      .json({ message: "Error fetching campaigns", error: error.message });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate("currentQuest")
      .populate("completedQuests")
      .populate("activeQuests")
      .populate("activeLocation");
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.status(200).json(campaign);
  } catch (error) {
    console.error("Error fetching campaign", error);
    res
      .status(500)
      .json({ message: "Error fetching campaign", error: error.message });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const newCampaign = await Campaign.create(req.body);
    res.status(201).json(newCampaign);
  } catch (error) {
    console.error("Error creating campaign", error);
    res
      .status(500)
      .json({ message: "Error creating campaign", error: error.message });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    )
      .populate("currentQuest")
      .populate("activeLocation");
    if (!updatedCampaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.status(200).json(updatedCampaign);
  } catch (error) {
    console.error("Error updating campaign", error);
    res
      .status(500)
      .json({ message: "Error updating campaign", error: error.message });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;

    const deletedCampaign = await Campaign.findByIdAndDelete(campaignId);
    if (!deletedCampaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Delete all related data
    await Quest.deleteMany({ campaignId });
    await Location.deleteMany({ campaignId });
    await DecisionNode.deleteMany({ campaignId });
    await Compendium.deleteMany({ campaignId });

    res.status(200).json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting campaign", error);
    res
      .status(500)
      .json({ message: "Error deleting campaign", error: error.message });
  }
};
export const clearCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    campaign.completedQuests = [];
    campaign.currentQuest = null;
    campaign.sessionNumber = 1;
    campaign.notes = "";
    await campaign.save();
    await campaign.populate([
      "currentQuest",
      "completedQuests",
      "activeLocation",
    ]);
    res.status(200).json(campaign);
  } catch (error) {
    console.error("Error clearing campaign", error);
    res
      .status(500)
      .json({ message: "Error clearing campaign", error: error.message });
  }
};

export const importFullCampaign = async (req, res) => {
  try {
    const campaignData = req.body;

    // 1. Create Campaign FIRST (so we have the campaignId)
    const newCampaign = await Campaign.create({
      name: campaignData.name,
      description: campaignData.description || "",
      isActive: campaignData.isActive || false,
      sessionNumber: campaignData.sessionNumber || 1,
      notes: campaignData.notes || "",
      completedQuests: campaignData.completedQuests || [],
      activeQuests: campaignData.activeQuests || [],
      completedDecisionNodes: campaignData.completedDecisionNodes || [],
      completedLocationNodes: campaignData.completedLocationNodes || [],
    });

    const campaignId = newCampaign._id;

    // Arrays to store created IDs
    const createdQuestIds = [];
    const createdLocationIds = [];
    const createdDecisionNodeIds = [];
    const locationMap = {}; // Map location names to IDs

    // 2. Create Locations with campaignId FIRST
    if (campaignData.locations && campaignData.locations.length > 0) {
      for (const locationData of campaignData.locations) {
        const location = await Location.create({
          ...locationData,
          campaignId: campaignId,
        });
        createdLocationIds.push(location._id);
        locationMap[location.name] = location._id; // Store name -> ID mapping
      }
    }

    // 3. Create Quests with campaignId and link to locations
    if (campaignData.quests && campaignData.quests.length > 0) {
      for (const questData of campaignData.quests) {
        // Try to find matching location by name if quest has a location reference
        let locationId = null;
        if (questData.location && typeof questData.location === "string") {
          locationId = locationMap[questData.location];
        }

        const quest = await Quest.create({
          ...questData,
          location: locationId,
          campaignId: campaignId,
        });
        createdQuestIds.push(quest._id);
      }
    }

    // 4. Create Decision Nodes with campaignId and questId
    if (campaignData.decisionNodes && campaignData.decisionNodes.length > 0) {
      // Use the first created quest ID if available
      const questIdToUse =
        createdQuestIds.length > 0 ? createdQuestIds[0] : null;

      for (const nodeData of campaignData.decisionNodes) {
        const node = await DecisionNode.create({
          ...nodeData,
          questId: questIdToUse,
          campaignId: campaignId,
        });
        createdDecisionNodeIds.push(node._id);
      }
    }

    // 5. Create Compendium Entries with campaignId
    if (campaignData.compendium && campaignData.compendium.length > 0) {
      for (const entryData of campaignData.compendium) {
        // Handle stat block separately if it exists
        let statBlockId = null;
        if (entryData.statBlock) {
          const statBlock = await StatBlock.create(entryData.statBlock);
          statBlockId = statBlock._id;
        }

        // Create compendium entry with campaignId
        const compendiumEntry = {
          ...entryData,
          statBlock: statBlockId,
          campaignId: campaignId,
        };
        await Compendium.create(compendiumEntry);
      }
    }

    res.status(201).json(newCampaign);
  } catch (error) {
    console.error("Error importing full campaign", error);
    res.status(500).json({
      message: "Error importing full campaign",
      error: error.message,
    });
  }
};
