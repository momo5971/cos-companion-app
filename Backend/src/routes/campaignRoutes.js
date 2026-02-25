import express from "express";
import {
  getCampaign,
  updateCampaign,
  deleteCampaign,
  clearCampaign,
} from "../controllers/campaignController.js";

const router = express.Router();

router.get("/", getCampaign);
router.put("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);
router.post("/:id/clear", clearCampaign);

export default router;
