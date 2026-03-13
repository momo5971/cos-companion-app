import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

// Auth middleware for API routes
const authMiddleware = (req, res, next) => {
  // Skip auth if no secret is configured
  if (!process.env.APP_SECRET) return next();

  const token = req.headers["x-app-token"];
  if (token === process.env.APP_SECRET) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Auth verification endpoint
app.post("/api/auth/verify", (req, res) => {
  if (!process.env.APP_SECRET) {
    return res.json({ valid: true });
  }
  const { token } = req.body;
  if (token === process.env.APP_SECRET) {
    return res.json({ valid: true });
  }
  return res.status(401).json({ valid: false, message: "Invalid password" });
});

// API Routes (protected)
app.use("/api/locations", authMiddleware, locationRoutes);
app.use("/api/campaigns", authMiddleware, campaignRoutes);
app.use("/api/quests", authMiddleware, questRoutes);
app.use("/api/quest-sections", authMiddleware, questSectionRoutes);
app.use("/api/compendium", authMiddleware, compendiumRoutes);
app.use("/api/decision-nodes", authMiddleware, decisionNodeRoutes);
app.use("/api/timeline", authMiddleware, timelineRoutes);
app.use("/api/sections", authMiddleware, sectionRoutes);

// Serve Vue frontend in production
const distPath = path.join(__dirname, "../../Frontend/dist");
app.use(express.static(distPath));

// Catch-all: send index.html for client-side routing
app.get("{*path}", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

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
