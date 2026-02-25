import Location from "../models/Location.js";

const locations = [
  {
    name: "Death House",
    description: "A haunted mansion on the outskirts of Barovia",
    type: "dungeon",
    nodes: [
      {
        name: "Main Hall",
        position: { x: 200, y: 100 },
        defaultDescription: "A grand entrance hall with a sweeping staircase",
        questDescriptions: new Map(),
      },
      {
        name: "Dining Room",
        position: { x: 100, y: 200 },
        defaultDescription: "A dusty dining room with a long table",
        questDescriptions: new Map(),
      },
      {
        name: "Basement",
        position: { x: 300, y: 200 },
        defaultDescription: "A dark and damp basement with strange noises",
        questDescriptions: new Map(),
      },
      {
        name: "Attic",
        position: { x: 200, y: 300 },
        defaultDescription: "A cluttered attic filled with old furniture",
        questDescriptions: new Map(),
      },
    ],
  },
  {
    name: "Village of Barovia",
    description: "A gloomy village shrouded in mist",
    type: "city",
    nodes: [
      {
        name: "Town Square",
        position: { x: 200, y: 100 },
        defaultDescription: "The central square of the village",
        questDescriptions: new Map(),
      },
      {
        name: "Blood of the Vine Tavern",
        position: { x: 100, y: 200 },
        defaultDescription: "A dimly lit tavern",
        questDescriptions: new Map(),
      },
    ],
  },
  {
    name: "Tser Pool",
    description: "A Vistani encampment by a dark pool",
    type: "landmark",
    nodes: [
      {
        name: "Madam Eva's Tent",
        position: { x: 200, y: 100 },
        defaultDescription: "A colorful tent where fortunes are told",
        questDescriptions: new Map(),
      },
    ],
  },
  {
    name: "Old Bonegrinder",
    description: "An old windmill on a hill",
    type: "dungeon",
    nodes: [
      {
        name: "Ground Floor",
        position: { x: 200, y: 100 },
        defaultDescription: "The main floor of the windmill",
        questDescriptions: new Map(),
      },
      {
        name: "Upper Floor",
        position: { x: 200, y: 200 },
        defaultDescription: "The upper level with grinding stones",
        questDescriptions: new Map(),
      },
    ],
  },
  {
    name: "Vallaki",
    description: "A walled town with strict laws",
    type: "city",
    nodes: [
      {
        name: "Town Gates",
        position: { x: 200, y: 100 },
        defaultDescription: "The guarded entrance to Vallaki",
        questDescriptions: new Map(),
      },
      {
        name: "Blue Water Inn",
        position: { x: 100, y: 200 },
        defaultDescription: "A popular inn and tavern",
        questDescriptions: new Map(),
      },
    ],
  },
];

export const seedLocations = async () => {
  try {
    await Location.deleteMany({});
    const createdLocations = await Location.insertMany(locations);
    console.log("Locations seeded successfully");
    return createdLocations; // Return the created locations for further use
  } catch (error) {
    console.error("Error seeding locations:", error);
    throw error;
  }
};
