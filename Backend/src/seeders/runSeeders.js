import dotenv from "dotenv";
import connectDB from "../config/database.js";
import { seedQuests } from "./questSeeder.js";
import { seedLocations } from "./locationSeeder.js";
import { seedCompendium } from "./compendiumSeeder.js";
import { seedDecisionNodes } from "./decisionNodeSeeder.js";

dotenv.config();
const runSeeders = async () => {
  try {
    await connectDB();

    console.log("🌱 Starting database seeding...\n");
    await seedLocations();
    await seedQuests();
    await seedCompendium();
    await seedDecisionNodes();
    console.log("\n✅ All seeders completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

runSeeders();
