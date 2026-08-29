import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  recordVideoView,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
  getVideosByUsername, // <-- Import the new controller
} from "../controllers/video.controller.js";
import { optionalJWT, verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { Video } from "../models/video.model.js";
import { withLikeStats } from "../utils/likeStats.js";

const router = Router();

// PUBLIC ROUTES

// Trending Route
router.get("/trending", optionalJWT, async (req, res) => {
  try {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const trendingVideos = await Video.find({
      createdAt: { $gte: twoMonthsAgo },
      isPublished: true,
    })
      .sort({ views: -1 })
      .limit(40)
      .populate("owner", "username fullName avatar");

    const decoratedVideos = await withLikeStats(trendingVideos, {
      field: "video",
      userId: req.user?._id,
    });
    res.json({ data: decoratedVideos });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch trending videos" });
  }
});

// Get videos by channel username
router.get("/user/:username", getVideosByUsername);

router.route("/").get(getAllVideos);
router.route("/:videoId").get(optionalJWT, getVideoById);
router.route("/view/:videoId").post(recordVideoView);

// PROTECTED ROUTES
router.use(verifyJWT);

router.route("/").post(
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);

router
  .route("/:videoId")
  .delete(deleteVideo)
  .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
