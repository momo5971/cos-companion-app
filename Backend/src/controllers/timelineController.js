import Timeline from "../models/Timeline.js";

export const getAllTimelineEvents = async (req, res) => {
  try {
    const { campaignId } = req.query;

    if (!campaignId) {
      return res.status(200).json([]);
    }

    const timelineEvents = await Timeline.find({ campaignId }).sort({
      year: 1,
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
