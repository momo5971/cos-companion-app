import QuestSection from "../models/QuestSection.js";

export const getAllQuestSections = async (req, res) => {
  try {
    const { campaignId } = req.query;

    if (!campaignId) {
      return res.status(200).json([]);
    }

    const sections = await QuestSection.find({ campaignId }).sort({ order: 1 });
    res.status(200).json(sections);
  } catch (error) {
    console.error("Error fetching quest sections", error);
    res
      .status(500)
      .json({ message: "Error fetching quest sections", error: error.message });
  }
};

export const getQuestSectionById = async (req, res) => {
  try {
    const section = await QuestSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: "Quest section not found" });
    }
    res.status(200).json(section);
  } catch (error) {
    console.error("Error fetching quest section", error);
    res
      .status(500)
      .json({ message: "Error fetching quest section", error: error.message });
  }
};

export const createQuestSection = async (req, res) => {
  try {
    const newSection = new QuestSection(req.body);
    const savedSection = await newSection.save();
    res.status(201).json(savedSection);
  } catch (error) {
    console.error("Error creating quest section", error);
    res
      .status(500)
      .json({ message: "Error creating quest section", error: error.message });
  }
};

export const updateQuestSection = async (req, res) => {
  try {
    const updatedSection = await QuestSection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    );
    if (!updatedSection) {
      return res.status(404).json({ message: "Quest section not found" });
    }
    res.status(200).json(updatedSection);
  } catch (error) {
    console.error("Error updating quest section", error);
    res
      .status(500)
      .json({ message: "Error updating quest section", error: error.message });
  }
};

export const deleteQuestSection = async (req, res) => {
  try {
    const sectionId = req.params.id;
    const deletedSection = await QuestSection.findByIdAndDelete(sectionId);

    if (!deletedSection) {
      return res.status(404).json({ message: "Quest section not found" });
    }

    // Update any quests that reference this section to set section to null
    const Quest = (await import("../models/Quest.js")).default;
    await Quest.updateMany({ section: sectionId }, { $set: { section: null } });

    res.status(200).json({ message: "Quest section deleted successfully" });
  } catch (error) {
    console.error("Error deleting quest section", error);
    res
      .status(500)
      .json({ message: "Error deleting quest section", error: error.message });
  }
};
