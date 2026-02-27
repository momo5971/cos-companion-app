import Campaign from "../models/Campaign.js";
import Quest from "../models/Quest.js";
import Location from "../models/Location.js";
import DecisionNode from "../models/DecisionNode.js";
import Compendium from "../models/Compendium.js";
import StatBlock from "../models/StatBlock.js";
import Timeline from "../models/Timeline.js";
import Npc from "../models/Npc.js";
import Item from "../models/Item.js";
import Monster from "../models/Monster.js";

// Helper function to update node connections bidirectionally
async function updateNodeConnections(nodeId, nextNodeIds) {
  // Update this node's nextNodes
  await DecisionNode.findByIdAndUpdate(nodeId, { nextNodes: nextNodeIds });

  // Update each child node's previousNodes to include this node
  for (const childId of nextNodeIds) {
    await DecisionNode.findByIdAndUpdate(childId, {
      $addToSet: { previousNodes: nodeId },
    });
  }
}

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
    await Timeline.deleteMany({ campaignId });

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
    const createdDecisionNodeIds = [];
    const locationMap = {}; // Map location names to IDs

    // 2. Create Locations with campaignId FIRST
    if (campaignData.locations && campaignData.locations.length > 0) {
      for (const locationData of campaignData.locations) {
        const location = await Location.create({
          ...locationData,
          campaignId: campaignId,
        });
        locationMap[location.name] = location._id; // Store name -> ID mapping
      }
    }

    if (campaignData.timeline && campaignData.timeline.length > 0) {
      for (const timelineData of campaignData.timeline) {
        await Timeline.create({
          ...timelineData,
          campaignId: campaignId,
        });
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

        // Extract decision nodes from quest before creating quest
        const questDecisionNodes = questData.decisionNodes || [];
        const questDataWithoutNodes = { ...questData };
        delete questDataWithoutNodes.decisionNodes;

        const quest = await Quest.create({
          ...questDataWithoutNodes,
          location: locationId,
          campaignId: campaignId,
        });

        // 4. Create Decision Nodes for this quest
        // 4. Create Decision Nodes for this quest
        if (questDecisionNodes.length > 0) {
          // First pass: Create all nodes and build ID map
          const nodeIdMap = {}; // Maps string id -> MongoDB _id

          for (const nodeData of questDecisionNodes) {
            const nodeDataWithoutNext = { ...nodeData };
            delete nodeDataWithoutNext.nextNodes; // Remove nextNodes temporarily
            const stringId = nodeDataWithoutNext.id;
            delete nodeDataWithoutNext.id; // Remove string id

            const node = await DecisionNode.create({
              ...nodeDataWithoutNext,
              stringId: stringId,
              questId: quest._id,
              campaignId: campaignId,
            });

            // Map the string id to MongoDB _id
            if (stringId) {
              nodeIdMap[stringId] = node._id;
            }
            createdDecisionNodeIds.push(node._id);
          }

          // Second pass: Update nextNodes with MongoDB ObjectIds
          for (let i = 0; i < questDecisionNodes.length; i++) {
            const nodeData = questDecisionNodes[i];
            if (nodeData.nextNodes && nodeData.nextNodes.length > 0) {
              const mongoNextNodes = nodeData.nextNodes
                .map((stringId) => nodeIdMap[stringId])
                .filter((id) => id); // Remove any undefined IDs

              if (mongoNextNodes.length > 0) {
                await updateNodeConnections(
                  createdDecisionNodeIds[i],
                  mongoNextNodes,
                );
              }
            }
          }
        }
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

        // Use the appropriate discriminator model based on category
        const category = entryData.category;
        if (category === "NPC") {
          await Npc.create(compendiumEntry);
        } else if (category === "Item") {
          await Item.create(compendiumEntry);
        } else if (category === "Monster") {
          await Monster.create(compendiumEntry);
        } else {
          // Fallback to base Compendium for other categories
          await Compendium.create(compendiumEntry);
        }
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

export const batchImportCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { quests, locations, timeline, compendium } = req.body;

    // Verify campaign exists
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const summary = {
      questsImported: 0,
      locationsImported: 0,
      timelineImported: 0,
      compendiumImported: 0,
      decisionNodesImported: 0,
    };

    const createdQuestIds = [];
    const locationMap = {}; // Map location names to IDs

    // Import locations first (so quests can reference them)
    if (locations && locations.length > 0) {
      for (const locationData of locations) {
        const location = await Location.create({
          ...locationData,
          campaignId: campaignId,
        });

        locationMap[location.name] = location._id;
      }
      summary.locationsImported = locations.length;
    }

    // Import timeline
    if (timeline && timeline.length > 0) {
      for (const timelineData of timeline) {
        await Timeline.create({
          ...timelineData,
          campaignId: campaignId,
        });
      }
      summary.timelineImported = timeline.length;
    }

    // Import quests (with decision nodes)
    if (quests && quests.length > 0) {
      for (const questData of quests) {
        // Try to find matching location by name if quest has a location reference
        let locationId = null;
        if (questData.location && typeof questData.location === "string") {
          locationId = locationMap[questData.location];
        }

        // Extract decision nodes from quest before creating quest
        const questDecisionNodes = questData.decisionNodes || [];
        const questDataWithoutNodes = { ...questData };
        delete questDataWithoutNodes.decisionNodes;

        const quest = await Quest.create({
          ...questDataWithoutNodes,
          location: locationId,
          campaignId: campaignId,
        });

        createdQuestIds.push(quest._id);

        // Create Decision Nodes for this quest (two-pass approach)
        if (questDecisionNodes.length > 0) {
          const nodeIdMap = {}; // Maps string id -> MongoDB _id
          const createdDecisionNodeIds = [];

          // First pass: Create all nodes and build ID map
          for (const nodeData of questDecisionNodes) {
            const nodeDataWithoutNext = { ...nodeData };
            delete nodeDataWithoutNext.nextNodes;
            const stringId = nodeDataWithoutNext.id;
            delete nodeDataWithoutNext.id;

            const node = await DecisionNode.create({
              ...nodeDataWithoutNext,
              stringId: stringId,
              questId: quest._id,
              campaignId: campaignId,
            });

            if (stringId) {
              nodeIdMap[stringId] = node._id;
            }
            createdDecisionNodeIds.push(node._id);
          }

          // Second pass: Update nextNodes with MongoDB ObjectIds
          for (let i = 0; i < questDecisionNodes.length; i++) {
            const nodeData = questDecisionNodes[i];
            if (nodeData.nextNodes && nodeData.nextNodes.length > 0) {
              const mongoNextNodes = nodeData.nextNodes
                .map((stringId) => nodeIdMap[stringId])
                .filter((id) => id);

              if (mongoNextNodes.length > 0) {
                await updateNodeConnections(
                  createdDecisionNodeIds[i],
                  mongoNextNodes,
                );
              }
            }
          }

          summary.decisionNodesImported += questDecisionNodes.length;
        }
      }
      summary.questsImported = quests.length;
    }

    // Import compendium
    if (compendium && compendium.length > 0) {
      for (const entryData of compendium) {
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

        // Use the appropriate discriminator model based on category
        const category = entryData.category;
        if (category === "NPC") {
          await Npc.create(compendiumEntry);
        } else if (category === "Item") {
          await Item.create(compendiumEntry);
        } else if (category === "Monster") {
          await Monster.create(compendiumEntry);
        } else {
          await Compendium.create(compendiumEntry);
        }
      }
      summary.compendiumImported = compendium.length;
    }

    // Add created quests to campaign's activeQuests array
    if (createdQuestIds.length > 0) {
      campaign.activeQuests.push(...createdQuestIds);
      await campaign.save();
    }

    res.status(200).json(summary);
  } catch (error) {
    console.error("Error batch importing", error);
    res.status(500).json({
      message: "Error batch importing",
      error: error.message,
    });
  }
};

export const importQuests = async (req, res) => {
  try {
    console.log("importQuests called with campaignId:", req.params.id);
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    const campaignId = req.params.id;
    const quests = req.body; // Expecting an array of quests

    if (!Array.isArray(quests)) {
      return res
        .status(400)
        .json({ message: "Request body must be an array of quests" });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const summary = {
      questsImported: 0,
      decisionNodesImported: 0,
    };

    const createdQuestIds = [];

    // Get existing locations to map quest locations
    const locations = await Location.find({ campaignId });
    const locationMap = {};
    locations.forEach((loc) => {
      locationMap[loc.name] = loc._id;
    });

    for (const questData of quests) {
      let locationId = null;
      if (questData.location && typeof questData.location === "string") {
        locationId = locationMap[questData.location];
        console.log(
          `Mapping location "${questData.location}" to ID:`,
          locationId,
        );
      }

      const questDecisionNodes = questData.decisionNodes || [];
      const questDataWithoutNodes = { ...questData };
      delete questDataWithoutNodes.decisionNodes;

      console.log("Creating quest with locationId:", locationId);
      const quest = await Quest.create({
        ...questDataWithoutNodes,
        location: locationId,
        campaignId: campaignId,
      });
      console.log(
        "Created quest:",
        quest._id,
        "with location:",
        quest.location,
      );

      createdQuestIds.push(quest._id);

      if (questDecisionNodes.length > 0) {
        const nodeIdMap = {};
        const createdDecisionNodeIds = [];

        for (const nodeData of questDecisionNodes) {
          const nodeDataWithoutNext = { ...nodeData };
          delete nodeDataWithoutNext.nextNodes;
          const stringId = nodeDataWithoutNext.id;
          delete nodeDataWithoutNext.id;

          const node = await DecisionNode.create({
            ...nodeDataWithoutNext,
            stringId: stringId,
            questId: quest._id,
            campaignId: campaignId,
          });

          if (stringId) {
            nodeIdMap[stringId] = node._id;
          }
          createdDecisionNodeIds.push(node._id);
        }

        for (let i = 0; i < questDecisionNodes.length; i++) {
          const nodeData = questDecisionNodes[i];
          if (nodeData.nextNodes && nodeData.nextNodes.length > 0) {
            const mongoNextNodes = nodeData.nextNodes
              .map((stringId) => nodeIdMap[stringId])
              .filter((id) => id);

            if (mongoNextNodes.length > 0) {
              await updateNodeConnections(
                createdDecisionNodeIds[i],
                mongoNextNodes,
              );
            }
          }
        }

        summary.decisionNodesImported += questDecisionNodes.length;
      }
    }
    summary.questsImported = quests.length;

    // Add created quests to campaign's activeQuests array
    console.log("Before push - activeQuests:", campaign.activeQuests);
    console.log("Created quest IDs:", createdQuestIds);
    campaign.activeQuests.push(...createdQuestIds);
    console.log("After push - activeQuests:", campaign.activeQuests);
    await campaign.save();
    console.log("After save - activeQuests:", campaign.activeQuests);

    res.status(200).json(summary);
  } catch (error) {
    console.error("Error importing quests", error);
    res.status(500).json({
      message: "Error importing quests",
      error: error.message,
    });
  }
};

export const importLocations = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const locations = req.body; // Expecting an array of locations

    if (!Array.isArray(locations)) {
      return res
        .status(400)
        .json({ message: "Request body must be an array of locations" });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const summary = {
      locationsImported: 0,
    };

    for (const locationData of locations) {
      await Location.create({
        ...locationData,
        campaignId: campaignId,
      });
    }
    summary.locationsImported = locations.length;

    res.status(200).json(summary);
  } catch (error) {
    console.error("Error importing locations", error);
    res.status(500).json({
      message: "Error importing locations",
      error: error.message,
    });
  }
};

export const importTimeline = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const timeline = req.body; // Expecting an array of timeline events

    if (!Array.isArray(timeline)) {
      return res
        .status(400)
        .json({ message: "Request body must be an array of timeline events" });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const summary = {
      timelineImported: 0,
    };

    for (const timelineData of timeline) {
      await Timeline.create({
        ...timelineData,
        campaignId: campaignId,
      });
    }
    summary.timelineImported = timeline.length;

    res.status(200).json(summary);
  } catch (error) {
    console.error("Error importing timeline", error);
    res.status(500).json({
      message: "Error importing timeline",
      error: error.message,
    });
  }
};

export const importCompendium = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const compendium = req.body; // Expecting an array of compendium entries

    if (!Array.isArray(compendium)) {
      return res.status(400).json({
        message: "Request body must be an array of compendium entries",
      });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const summary = {
      compendiumImported: 0,
    };

    for (const entryData of compendium) {
      let statBlockId = null;
      if (entryData.statBlock) {
        const statBlock = await StatBlock.create(entryData.statBlock);
        statBlockId = statBlock._id;
      }

      const compendiumEntry = {
        ...entryData,
        statBlock: statBlockId,
        campaignId: campaignId,
      };

      const category = entryData.category;
      if (category === "NPC") {
        await Npc.create(compendiumEntry);
      } else if (category === "Item") {
        await Item.create(compendiumEntry);
      } else if (category === "Monster") {
        await Monster.create(compendiumEntry);
      } else {
        await Compendium.create(compendiumEntry);
      }
    }
    summary.compendiumImported = compendium.length;

    res.status(200).json(summary);
  } catch (error) {
    console.error("Error importing compendium", error);
    res.status(500).json({
      message: "Error importing compendium",
      error: error.message,
    });
  }
};

export const appendDecisionNodes = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const questId = req.params.questId;
    const decisionNodes = req.body; // Expecting an array of decision nodes

    if (!Array.isArray(decisionNodes)) {
      return res
        .status(400)
        .json({ message: "Request body must be an array of decision nodes" });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const quest = await Quest.findById(questId);
    if (!quest) {
      return res.status(404).json({ message: "Quest not found" });
    }

    if (quest.campaignId.toString() !== campaignId) {
      return res
        .status(400)
        .json({ message: "Quest does not belong to this campaign" });
    }

    const summary = {
      decisionNodesImported: 0,
      nodesUpdated: 0,
    };

    // Get existing nodes
    const existingNodes = await DecisionNode.find({ questId });

    // Build map: stringId -> MongoDB ObjectId for existing nodes
    const stringIdToMongoId = {};
    existingNodes.forEach((node) => {
      if (node.stringId) {
        stringIdToMongoId[node.stringId] = node._id;
      }
    });

    // First pass: Create all new nodes with stringId field
    const createdNodes = [];
    for (const nodeData of decisionNodes) {
      const nodeDataWithoutNext = { ...nodeData };
      delete nodeDataWithoutNext.nextNodes;
      const stringId = nodeDataWithoutNext.id;
      delete nodeDataWithoutNext.id;

      const node = await DecisionNode.create({
        ...nodeDataWithoutNext,
        stringId: stringId, // Store the original string ID
        questId: questId,
        campaignId: campaignId,
      });

      if (stringId) {
        stringIdToMongoId[stringId] = node._id;
      }
      createdNodes.push({ node, originalData: nodeData });
    }

    // Second pass: Update nextNodes for newly created nodes
    for (const { node, originalData } of createdNodes) {
      if (originalData.nextNodes && originalData.nextNodes.length > 0) {
        const mongoNextNodes = originalData.nextNodes
          .map((stringId) => stringIdToMongoId[stringId])
          .filter((id) => id);

        if (mongoNextNodes.length > 0) {
          await updateNodeConnections(node._id, mongoNextNodes);
        }
      }
    }

    // Third pass: Update existing nodes that have string IDs in nextNodes pointing to new nodes
    for (const existingNode of existingNodes) {
      // Check if this node's nextNodes array contains references that should be updated
      // We need to find nodes where nextNodes contains string IDs that now exist
      const updatedNextNodes = [...(existingNode.nextNodes || [])];
      let needsUpdate = false;

      // Check if any of the new nodes should be added to this node's nextNodes
      // This happens when the existing node was created with a string ID reference
      // that couldn't be resolved at creation time

      // We'll query the node again to check if it has unresolved references
      // For now, we'll skip this complex logic and require manual connection
    }

    summary.decisionNodesImported = createdNodes.length;

    res.status(200).json(summary);
  } catch (error) {
    console.error("Error appending decision nodes", error);
    res.status(500).json({
      message: "Error appending decision nodes",
      error: error.message,
    });
  }
};
