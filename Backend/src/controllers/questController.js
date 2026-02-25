import Quest from "../models/Quest.js";

export const getAllQuests = async (req, res) => {
  try {
    const quests = await Quest.find().populate("location");
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
    const quest = await Quest.findById(req.params.id).populate("location");
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
    const updatedQuest = await Quest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    ).populate("location");
    if (!updatedQuest) {
      return res.status(404).json({ message: "Quest not found" });
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
    const deletedQuest = await Quest.findByIdAndDelete(req.params.id);
    if (!deletedQuest) {
      return res.status(404).json({ message: "Quest not found" });
    }
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
    ).populate("location");
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
