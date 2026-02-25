import Campaign from "../models/Campaign.js";

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

export const updateCampaign = async (req, res) => {
  try {
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    )
      .populate("currentQuest")
      .populate("completedQuests")
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
    const deletedCampaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!deletedCampaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
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
