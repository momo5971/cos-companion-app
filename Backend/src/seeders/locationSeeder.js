import Location from "../models/Location.js";

const getLocations = (campaignId) => [
  {
    campaignId,
    name: "Death House",
    description: "A haunted mansion on the outskirts of Barovia",
    type: "dungeon",
    mapImage: "/maps/Death-house.webp",
    nodes: [
      {
        name: "Main Entrance",
        position: { x: 400, y: 100 },
        defaultDescription:
          "The front door of the mansion. Dark and foreboding, with intricate carvings depicting scenes of revelry and death.",
        questDescriptions: new Map(),
      },
      {
        name: "Main Hall",
        position: { x: 400, y: 200 },
        defaultDescription:
          "A grand entrance hall with a sweeping staircase. Dust covers everything, and the air is thick with decay.",
        questDescriptions: new Map(),
      },
      {
        name: "Dining Room",
        position: { x: 250, y: 300 },
        defaultDescription:
          "A long dining table set for a feast that never happened. Cobwebs hang from the chandelier.",
        questDescriptions: new Map(),
      },
      {
        name: "Kitchen",
        position: { x: 150, y: 400 },
        defaultDescription:
          "An old kitchen with rusted utensils and moldy food. A dumbwaiter leads down to the basement.",
        questDescriptions: new Map(),
      },
      {
        name: "Library",
        position: { x: 550, y: 300 },
        defaultDescription:
          "Shelves of ancient books line the walls. Some contain dark secrets about the Durst family.",
        questDescriptions: new Map(),
      },
      {
        name: "Upper Landing",
        position: { x: 400, y: 400 },
        defaultDescription:
          "The second floor landing. Portraits of the Durst family watch your every move.",
        questDescriptions: new Map(),
      },
      {
        name: "Nursemaid's Room",
        position: { x: 250, y: 500 },
        defaultDescription:
          "A small bedroom. The nursemaid's specter still haunts this room.",
        questDescriptions: new Map(),
      },
      {
        name: "Children's Room",
        position: { x: 550, y: 500 },
        defaultDescription:
          "Two small beds and old toys. The spirits of Rose and Thorn linger here.",
        questDescriptions: new Map(),
      },
      {
        name: "Master Bedroom",
        position: { x: 400, y: 600 },
        defaultDescription:
          "The Durst parents' bedroom. A secret door leads to the attic.",
        questDescriptions: new Map(),
      },
      {
        name: "Attic",
        position: { x: 400, y: 700 },
        defaultDescription:
          "A cluttered attic filled with old furniture and family secrets. A hidden staircase leads down to the basement.",
        questDescriptions: new Map(),
      },
      {
        name: "Basement Entrance",
        position: { x: 150, y: 600 },
        defaultDescription:
          "Stone steps descend into darkness. The air grows cold and damp.",
        questDescriptions: new Map(),
      },
      {
        name: "Dungeon Corridor",
        position: { x: 150, y: 700 },
        defaultDescription:
          "A dark stone corridor. Water drips from the ceiling.",
        questDescriptions: new Map(),
      },
      {
        name: "Ritual Chamber",
        position: { x: 150, y: 800 },
        defaultDescription:
          "A horrifying chamber with a stone altar. This is where the Durst family performed their dark rituals.",
        questDescriptions: new Map(),
      },
    ],
  },
  {
    campaignId,
    name: "Village of Barovia",
    description: "A gloomy village shrouded in mist",
    type: "city",
    mapImage: "/maps/barovia-village.jpg",
    nodes: [
      {
        name: "Town Square",
        position: { x: 400, y: 300 },
        defaultDescription:
          "The central square of the village. A gallows stands in the center.",
        questDescriptions: new Map(),
      },
      {
        name: "Blood of the Vine Tavern",
        position: { x: 250, y: 400 },
        defaultDescription:
          "A dimly lit tavern. The locals drink in silence, avoiding eye contact.",
        questDescriptions: new Map(),
      },
      {
        name: "Bildrath's Mercantile",
        position: { x: 550, y: 400 },
        defaultDescription:
          "The only shop in town. Prices are outrageously high.",
        questDescriptions: new Map(),
      },
      {
        name: "Church",
        position: { x: 400, y: 500 },
        defaultDescription:
          "A small church. Father Donavich prays desperately in the basement.",
        questDescriptions: new Map(),
      },
      {
        name: "Burgomaster's Mansion",
        position: { x: 400, y: 200 },
        defaultDescription:
          "The home of the late Burgomaster Kolyan Indirovich. His daughter Ireena is here.",
        questDescriptions: new Map(),
      },
    ],
  },
  {
    campaignId,
    name: "Tser Pool",
    description: "A Vistani encampment by a dark pool",
    type: "landmark",
    mapImage: "/maps/tser-pool.jpg",
    nodes: [
      {
        name: "Vistani Camp",
        position: { x: 300, y: 300 },
        defaultDescription:
          "Colorful wagons circle a large campfire. Music and laughter fill the air.",
        questDescriptions: new Map(),
      },
      {
        name: "Madam Eva's Tent",
        position: { x: 500, y: 300 },
        defaultDescription:
          "A large, ornate tent. Madam Eva performs Tarokka readings here.",
        questDescriptions: new Map(),
      },
      {
        name: "The Pool",
        position: { x: 400, y: 450 },
        defaultDescription:
          "A dark, still pool of water. Some say it shows visions of the future.",
        questDescriptions: new Map(),
      },
    ],
  },
  {
    campaignId,
    name: "Old Bonegrinder",
    description: "An old windmill on a hill",
    type: "dungeon",
    mapImage: "/maps/bonegrinder.jpg",
    nodes: [
      {
        name: "Ground Floor",
        position: { x: 400, y: 400 },
        defaultDescription:
          "The main floor of the windmill. The smell of baking pastries is oddly unsettling.",
        questDescriptions: new Map(),
      },
      {
        name: "Upper Floor",
        position: { x: 400, y: 250 },
        defaultDescription:
          "The upper level with grinding stones. Children's cries can be heard from above.",
        questDescriptions: new Map(),
      },
      {
        name: "Attic",
        position: { x: 400, y: 100 },
        defaultDescription:
          "The night hags keep their captive children here in cages.",
        questDescriptions: new Map(),
      },
    ],
  },
  {
    campaignId,
    name: "Vallaki",
    description: "A walled town with strict laws",
    type: "city",
    mapImage: "/maps/vallaki.jpg",
    nodes: [
      {
        name: "Town Gates",
        position: { x: 400, y: 150 },
        defaultDescription:
          "The guarded entrance to Vallaki. Guards check all who enter.",
        questDescriptions: new Map(),
      },
      {
        name: "Town Square",
        position: { x: 400, y: 300 },
        defaultDescription:
          "The central square. Festival decorations are everywhere.",
        questDescriptions: new Map(),
      },
      {
        name: "Blue Water Inn",
        position: { x: 250, y: 400 },
        defaultDescription:
          "A popular inn and tavern run by the Martikov family.",
        questDescriptions: new Map(),
      },
      {
        name: "Burgomaster's Mansion",
        position: { x: 550, y: 400 },
        defaultDescription:
          "Baron Vallakovich's home. He is obsessed with festivals.",
        questDescriptions: new Map(),
      },
      {
        name: "Church of St. Andral",
        position: { x: 400, y: 500 },
        defaultDescription:
          "The town's church. Father Lucian tends to his flock.",
        questDescriptions: new Map(),
      },
    ],
  },
];

export const seedLocations = async (campaignId) => {
  try {
    await Location.deleteMany({});
    const locations = getLocations(campaignId);
    const createdLocations = await Location.insertMany(locations);
    console.log(
      `Locations seeded successfully: ${createdLocations.length} locations created`,
    );
    return createdLocations;
  } catch (error) {
    console.error("Error seeding locations:", error);
    throw error;
  }
};
