import Quest from "../models/Quest.js";

export const getAllQuests = async (req, res) => {
  try {
    const { campaignId } = req.query;

    if (!campaignId) {
      return res.status(200).json([]);
    }

    const quests = await Quest.find({ campaignId })
      .populate("location")
      .populate("section");
    res.status(200).json(quests);
  } catch (error) {
    console.error("Error fetching quests", error);
    res
      .status(500)
      .json({ message: "Error fetching quests", error: error.message });
  }
};

export const getQuestById = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id)
      .populate("location")
      .populate("section");
    if (!quest) {
      return res.status(404).json({ message: "Quest not found" });
    }
    res.status(200).json(quest);
  } catch (error) {
    console.error("Error fetching quest", error);
    res
      .status(500)
      .json({ message: "Error fetching quest", error: error.message });
  }
};

export const createQuest = async (req, res) => {
  try {
    const newQuest = new Quest(req.body);
    const savedQuest = await newQuest.save();
    await savedQuest.populate("location");
    await savedQuest.populate("section");
    res.status(201).json(savedQuest);
  } catch (error) {
    console.error("Error creating quest", error);
    res
      .status(500)
      .json({ message: "Error creating quest", error: error.message });
  }
};

export const updateQuest = async (req, res) => {
  try {
    const questId = req.params.id;
    const updatedQuest = await Quest.findByIdAndUpdate(questId, req.body, {
      returnDocument: "after",
    })
      .populate("location")
      .populate("section");

    if (!updatedQuest) {
      return res.status(404).json({ message: "Quest not found" });
    }

    // Update corresponding compendium entry using questId
    const Compendium = (await import("../models/Compendium.js")).default;

    // First try to find by questId
    let updateResult = await Compendium.updateOne(
      {
        category: "Quest",
        questId: questId,
      },
      {
        $set: {
          title: updatedQuest.title,
          description: updatedQuest.description || "A quest in the campaign.",
          tags: ["quest", updatedQuest.status || "available"],
          location: updatedQuest.location?.name || "No Location",
          details: updatedQuest.description || "",
          questStatus: updatedQuest.status || "available",
          questObjectives: updatedQuest.rewards || [],
          questId: questId, // Also set questId for future updates
        },
      },
    );

    // If no match found, try to find by campaignId (for old entries without questId)
    if (updateResult.matchedCount === 0) {
      updateResult = await Compendium.updateOne(
        {
          category: "Quest",
          campaignId: updatedQuest.campaignId,
          questId: { $exists: false },
        },
        {
          $set: {
            title: updatedQuest.title,
            description: updatedQuest.description || "A quest in the campaign.",
            tags: ["quest", updatedQuest.status || "available"],
            location: updatedQuest.location?.name || "No Location",
            details: updatedQuest.description || "",
            questStatus: updatedQuest.status || "available",
            questObjectives: updatedQuest.rewards || [],
            questId: questId, // Set questId for future updates
          },
        },
      );
    }

    res.status(200).json(updatedQuest);
  } catch (error) {
    console.error("Error updating quest", error);
    res
      .status(500)
      .json({ message: "Error updating quest", error: error.message });
  }
};

export const deleteQuest = async (req, res) => {
  try {
    const questId = req.params.id;
    const deletedQuest = await Quest.findById(questId);

    if (!deletedQuest) {
      return res.status(404).json({ message: "Quest not found" });
    }

    // Delete the quest
    await Quest.findByIdAndDelete(questId);

    // Delete corresponding compendium entry
    const Compendium = (await import("../models/Compendium.js")).default;
    await Compendium.deleteOne({
      category: "Quest",
      title: deletedQuest.title,
      campaignId: deletedQuest.campaignId,
    });

    res.status(200).json({ message: "Quest deleted successfully" });
  } catch (error) {
    console.error("Error deleting quest", error);
    res
      .status(500)
      .json({ message: "Error deleting quest", error: error.message });
  }
};

export const updateQuestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["available", "in-progress", "completed", "locked"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const updatedQuest = await Quest.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after" },
    )
      .populate("location")
      .populate("section");
    if (!updatedQuest) {
      return res.status(404).json({ message: "Quest not found" });
    }
    res.status(200).json(updatedQuest);
  } catch (error) {
    console.error("Error updating quest status", error);
    res
      .status(500)
      .json({ message: "Error updating quest status", error: error.message });
  }
};
