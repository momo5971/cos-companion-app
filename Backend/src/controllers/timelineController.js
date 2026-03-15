import Timeline from "../models/Timeline.js";

export const getAllTimelineEvents = async (req, res) => {
  try {
    const { campaignId } = req.query;

    if (!campaignId) {
      return res.status(200).json([]);
    }

    const timelineEvents = await Timeline.find({ campaignId }).sort({
      year: 1,
      month: 1,
      day: 1,
      order: 1,
    });
    res.status(200).json(timelineEvents);
  } catch (error) {
    console.error("Error fetching timeline events", error);
    res.status(500).json({
      message: "Error fetching timeline events",
      error: error.message,
    });
  }
};

export const createTimelineEvent = async (req, res) => {
  try {
    const {
      campaignId,
      year,
      month,
      day,
      title,
      description,
      category,
      order,
    } = req.body;
    if (!campaignId || year == null || !title || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const count = order ?? (await Timeline.countDocuments({ campaignId }));
    const event = await Timeline.create({
      campaignId,
      year,
      month: month ?? null,
      day: day ?? null,
      title,
      description,
      category,
      order: count,
    });
    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating timeline event", error);
    res
      .status(500)
      .json({ message: "Error creating timeline event", error: error.message });
  }
};

export const updateTimelineEvent = async (req, res) => {
  try {
    const event = await Timeline.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!event)
      return res.status(404).json({ message: "Timeline event not found" });
    res.status(200).json(event);
  } catch (error) {
    console.error("Error updating timeline event", error);
    res
      .status(500)
      .json({ message: "Error updating timeline event", error: error.message });
  }
};

export const deleteTimelineEvent = async (req, res) => {
  try {
    const event = await Timeline.findByIdAndDelete(req.params.id);
    if (!event)
      return res.status(404).json({ message: "Timeline event not found" });
    res.status(200).json({ message: "Timeline event deleted" });
  } catch (error) {
    console.error("Error deleting timeline event", error);
    res
      .status(500)
      .json({ message: "Error deleting timeline event", error: error.message });
  }
};
