import express from "express";
import { getPlants, getPlantById } from "../controllers/plantController.js";
const router = express.Router();
router.get("/", getPlants);
router.get("/:id", getPlantById);
export default router;
