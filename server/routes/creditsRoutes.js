// routes/creditsRouter.js
import express from "express";
import { protect } from "../middlewares/auth.js";
import { purchaseCredits } from "../controllers/creditsController.js";

const router = express.Router();

// POST /api/credits/purchase
router.post("/purchase", protect, purchaseCredits);

export default router;
