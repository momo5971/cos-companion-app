import express from "express";
import {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  getLocationNodes,
} from "../controllers/locationController.js";

const router = express.Router();

router.get("/", getAllLocations);
router.get("/:id/nodes", getLocationNodes);
router.get("/:id", getLocationById);
router.post("/", createLocation);
router.put("/:id", updateLocation);
router.delete("/:id", deleteLocation);

export default router;
