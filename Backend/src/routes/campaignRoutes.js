import express from "express";
import {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  importFullCampaign,
  updateCampaign,
  deleteCampaign,
  clearCampaign,
} from "../controllers/campaignController.js";

const router = express.Router();

router.get("/", getAllCampaigns);
router.get("/:id", getCampaignById);
router.post("/import-full", importFullCampaign);
router.post("/", createCampaign);
router.put("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);
router.post("/:id/clear", clearCampaign);

export default router;
