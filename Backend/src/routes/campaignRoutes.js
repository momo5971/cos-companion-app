import express from "express";
import {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  importFullCampaign,
  updateCampaign,
  deleteCampaign,
  clearCampaign,
  batchImportCampaign,
  importQuests,
  importLocations,
  importTimeline,
  importCompendium,
  appendDecisionNodes,
} from "../controllers/campaignController.js";

const router = express.Router();

router.get("/", getAllCampaigns);
router.post("/import-full", importFullCampaign);
router.post("/", createCampaign);
router.get("/:id", getCampaignById);
router.put("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);
router.post("/:id/clear", clearCampaign);
router.post("/:id/batch-import", batchImportCampaign);
router.post("/:id/import/quests", importQuests);
router.post("/:id/import/locations", importLocations);
router.post("/:id/import/timeline", importTimeline);
router.post("/:id/import/compendium", importCompendium);
router.post("/:id/quests/:questId/append-nodes", appendDecisionNodes);

export default router;
