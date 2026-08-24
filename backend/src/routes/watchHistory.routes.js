import { Router } from "express";
import {
  addToWatchHistory,
  getWatchHistory,
} from "../controllers/watchHistory.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.post("/", addToWatchHistory); // POST /api/v1/history
router.get("/", getWatchHistory); // GET  /api/v1/history

export default router;
