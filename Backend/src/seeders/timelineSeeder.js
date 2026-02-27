import Timeline from "../models/Timeline.js";

export const seedTimeline = async (campaignId) => {
  try {
    const timelineEvents = [
      {
        campaignId,
        year: -1000,
        title: "The Mists Form",
        description:
          "The Dark Powers create the Domains of Dread, trapping evil souls in pocket dimensions surrounded by deadly mists.",
        category: "The Dark Powers",
        order: 1,
      },
      {
        campaignId,
        year: -346,
        title: "Strahd von Zarovich is Born",
        description:
          "Born to King Barov and Queen Ravenovia von Zarovich in the kingdom of Zarovia.",
        category: "Strahd's History",
        order: 2,
      },
      {
        campaignId,
        year: -320,
        title: "Strahd Becomes a Warrior",
        description:
          "Strahd leads his family's armies to countless victories, becoming a legendary military commander.",
        category: "Strahd's History",
        order: 3,
      },
      {
        campaignId,
        year: 0,
        title: "Conquest of Barovia",
        description:
          "Strahd conquers the valley of Barovia and names it after his fallen father, King Barov.",
        category: "Barovia",
        order: 4,
      },
      {
        campaignId,
        year: 0,
        title: "Castle Ravenloft Construction Begins",
        description:
          "Strahd orders the construction of Castle Ravenloft on the pillar stone overlooking Barovia.",
        category: "Barovia",
        order: 5,
      },
      {
        campaignId,
        year: 5,
        title: "Sergei Arrives",
        description:
          "Strahd's younger brother Sergei comes to Barovia. Young, handsome, and full of life - everything Strahd is not.",
        category: "Strahd's History",
        order: 6,
      },
      {
        campaignId,
        year: 6,
        title: "Tatyana Arrives",
        description:
          "A young woman named Tatyana comes to Castle Ravenloft. Strahd falls deeply in love with her.",
        category: "Strahd's History",
        order: 7,
      },
      {
        campaignId,
        year: 7,
        title: "Sergei and Tatyana's Engagement",
        description:
          "Tatyana falls in love with Sergei instead of Strahd. They become engaged, devastating Strahd.",
        category: "Strahd's History",
        order: 8,
      },
      {
        campaignId,
        year: 8,
        title: "The Pact with Darkness",
        description:
          "Desperate for youth and Tatyana's love, Strahd makes a pact with dark powers. He murders Sergei on his wedding day.",
        category: "Strahd's History",
        order: 9,
      },
      {
        campaignId,
        year: 8,
        title: "Tatyana's Death",
        description:
          "Horrified by Strahd's actions, Tatyana throws herself from the castle walls. Strahd becomes a vampire.",
        category: "Strahd's History",
        order: 10,
      },
      {
        campaignId,
        year: 8,
        title: "The Mists Descend",
        description:
          "The Dark Powers claim Strahd and Barovia. The valley is surrounded by deadly mists, becoming a Domain of Dread.",
        category: "The Dark Powers",
        order: 11,
      },
      {
        campaignId,
        year: 400,
        title: "The Curse Continues",
        description:
          "Strahd rules Barovia as its dark lord. Tatyana is reincarnated repeatedly, but always dies before Strahd can claim her.",
        category: "Strahd's History",
        order: 12,
      },
      {
        campaignId,
        year: 735,
        title: "Ireena Kolyana",
        description:
          "Tatyana's latest reincarnation. Strahd has already bitten her twice. The adventurers arrive in Barovia.",
        category: "Current Events",
        order: 13,
      },
    ];

    await Timeline.insertMany(timelineEvents);
    console.log("Timeline events seeded successfully");
  } catch (error) {
    console.error("Error seeding timeline events:", error);
    throw error;
  }
};
