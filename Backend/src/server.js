import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import locationRoutes from "./routes/locationRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import questRoutes from "./routes/questRoutes.js";
import questSectionRoutes from "./routes/questSectionRoutes.js";
import compendiumRoutes from "./routes/compendiumRoutes.js";
import decisionNodeRoutes from "./routes/decisionNodeRoutes.js";
import timelineRoutes from "./routes/timelineRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/locations", locationRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/quests", questRoutes);
app.use("/api/quest-sections", questSectionRoutes);
app.use("/api/compendium", compendiumRoutes);
app.use("/api/decision-nodes", decisionNodeRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/sections", sectionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
