import Section from "../models/Section.js";

export const getSectionsByQuest = async (req, res) => {
  try {
    const { questId } = req.params;
    const sections = await Section.find({ questId }).sort({ order: 1 });
    res.status(200).json(sections);
  } catch (error) {
    console.error("Error fetching sections", error);
    res.status(500).json({
      message: "Error fetching sections",
      error: error.message,
    });
  }
};

export const createSection = async (req, res) => {
  try {
    const newSection = new Section(req.body);
    const savedSection = await newSection.save();
    res.status(201).json(savedSection);
  } catch (error) {
    console.error("Error creating section", error);
    res.status(500).json({
      message: "Error creating section",
      error: error.message,
    });
  }
};

export const updateSection = async (req, res) => {
  try {
    const updatedSection = await Section.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    );
    if (!updatedSection) {
      return res.status(404).json({ message: "Section not found" });
    }
    res.status(200).json(updatedSection);
  } catch (error) {
    console.error("Error updating section", error);
    res.status(500).json({
      message: "Error updating section",
      error: error.message,
    });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const deletedSection = await Section.findByIdAndDelete(req.params.id);
    if (!deletedSection) {
      return res.status(404).json({ message: "Section not found" });
    }
    res.status(200).json({ message: "Section deleted successfully" });
  } catch (error) {
    console.error("Error deleting section", error);
    res.status(500).json({
      message: "Error deleting section",
      error: error.message,
    });
  }
};
