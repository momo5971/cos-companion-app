import Quest from "../models/Quest.js";
import Location from "../models/Location.js";

export const seedQuests = async () => {
  try {
    // First, get all locations from the database
    const locations = await Location.find({});

    // Create a map for easy lookup
    const locationMap = {};
    locations.forEach((loc) => {
      locationMap[loc.name] = loc._id;
    });

    // Now create quests with proper location references
    const quests = [
      {
        title: "Death House",
        description: "Explore the haunted mansion on the outskirts of Barovia",
        act: "Act I",
        location: locationMap["Death House"], // Use ObjectId instead of string
        status: "available",
        levelRequirement: 1,
        rewards: ["Letter from Strahd", "200 XP"],
        connections: [],
      },
      {
        title: "Welcome to Barovia",
        description: "Arrive in the village and meet Ismark and Ireena",
        act: "Act I",
        location: locationMap["Village of Barovia"], // Use ObjectId
        status: "available",
        levelRequirement: 2,
        rewards: ["Ireena as ally"],
        connections: [],
      },
      {
        title: "Tser Pool Encampment",
        description: "Meet Madam Eva and receive the Tarokka reading",
        act: "Act I",
        location: locationMap["Tser Pool"], // Use ObjectId
        status: "locked",
        levelRequirement: 3,
        rewards: ["Tarokka reading", "fortune told"],
        connections: [],
      },
      {
        title: "Old Bonegrinder",
        description: "Investigate the windmill and the hags",
        act: "Act I",
        location: locationMap["Old Bonegrinder"], // Use ObjectId
        status: "locked",
        levelRequirement: 4,
        rewards: ["Save children", "magic items"],
        connections: [],
      },
      {
        title: "The Town of Vallaki",
        description: "Enter the town of Vallaki and navigate its politics",
        act: "Act II",
        location: locationMap["Vallaki"], // Use ObjectId
        status: "locked",
        levelRequirement: 5,
        rewards: ["Multiple quest hooks"],
        connections: [],
      },
    ];

    await Quest.deleteMany({});
    const createdQuests = await Quest.insertMany(quests);
    console.log("Quests seeded successfully");
    return createdQuests;
  } catch (error) {
    console.error("Error seeding quests:", error);
    throw error;
  }
};
