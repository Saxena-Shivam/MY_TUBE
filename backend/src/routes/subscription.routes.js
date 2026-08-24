import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Subscription } from "../models/subscription.model.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.get("/me", async (req, res) => {
  try {
    // req.user._id is set by verifyJWT middleware
    const subscriptions = await Subscription.find({
      subscriber: req.user._id,
    }).populate("channel");
    const channels = subscriptions.map((sub) => sub.channel);
    res.json({ data: channels });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subscriptions" });
  }
});
router
  .route("/c/:channelId")
  .get(getSubscribedChannels)
  .post(toggleSubscription);

router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router;
