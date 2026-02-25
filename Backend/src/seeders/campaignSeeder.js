import Campaign from "../models/Campaign.js";

export async function seedCampaigns() {
  try {
    // Clear existing campaigns
    await Campaign.deleteMany({});

    // Create default campaign
    const defaultCampaign = await Campaign.create({
      name: "My Curse of Strahd Campaign",
      description: "A journey through the mists of Barovia",
      isActive: true,
      lastPlayed: new Date(),
      sessionNumber: 1,
      completedQuests: [],
      activeQuests: [],
      completedDecisionNodes: [],
      completedLocationNodes: [],
      notes: "",
    });

    console.log("✓ Campaign seeded:", defaultCampaign.name);
    return defaultCampaign._id;
  } catch (error) {
    console.error("Error seeding campaigns:", error);
    throw error;
  }
}
