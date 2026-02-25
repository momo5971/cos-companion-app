import DecisionNode from "../models/DecisionNode.js";

// Get all decision nodes for a specific quest
export const getDecisionNodesByQuest = async (req, res) => {
  try {
    const nodes = await DecisionNode.find({ questId: req.params.questId });
    res.status(200).json(nodes);
  } catch (error) {
    console.error("Error fetching decision nodes", error);
    res.status(500).json({
      message: "Error fetching decision nodes",
      error: error.message,
    });
  }
};

// Get a single decision node by ID
export const getDecisionNodeById = async (req, res) => {
  try {
    const node = await DecisionNode.findById(req.params.id);
    if (!node) {
      return res.status(404).json({ message: "Decision node not found" });
    }
    res.status(200).json(node);
  } catch (error) {
    console.error("Error fetching decision node", error);
    res.status(500).json({
      message: "Error fetching decision node",
      error: error.message,
    });
  }
};

// Create a new decision node
export const createDecisionNode = async (req, res) => {
  try {
    const newNode = new DecisionNode(req.body);
    const savedNode = await newNode.save();
    res.status(201).json(savedNode);
  } catch (error) {
    console.error("Error creating decision node", error);
    res.status(500).json({
      message: "Error creating decision node",
      error: error.message,
    });
  }
};

// Update a decision node
export const updateDecisionNode = async (req, res) => {
  try {
    const updatedNode = await DecisionNode.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    );
    if (!updatedNode) {
      return res.status(404).json({ message: "Decision node not found" });
    }
    res.status(200).json(updatedNode);
  } catch (error) {
    console.error("Error updating decision node", error);
    res.status(500).json({
      message: "Error updating decision node",
      error: error.message,
    });
  }
};

export const updateDecisionNodeStatus = async (req, res) => {
  try {
    const { completed } = req.body;
    const updatedNode = await DecisionNode.findByIdAndUpdate(
      req.params.id,
      { completed },
      { returnDocument: "after" },
    );
    if (!updatedNode) {
      return res.status(404).json({ message: "Decision node not found" });
    }
    res.status(200).json(updatedNode);
  } catch (error) {
    console.error("Error updating decision node status", error);
    res.status(500).json({
      message: "Error updating decision node status",
      error: error.message,
    });
  }
};

// Delete a decision node
export const deleteDecisionNode = async (req, res) => {
  try {
    const deletedNode = await DecisionNode.findByIdAndDelete(req.params.id);
    if (!deletedNode) {
      return res.status(404).json({ message: "Decision node not found" });
    }
    res.status(200).json({ message: "Decision node deleted successfully" });
  } catch (error) {
    console.error("Error deleting decision node", error);
    res.status(500).json({
      message: "Error deleting decision node",
      error: error.message,
    });
  }
};
