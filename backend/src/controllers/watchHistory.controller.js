import { WatchHistory } from "../models/watchHistory.model.js";

export const addToWatchHistory = async (req, res) => {
  const userId = req.user._id;
  const { videoId } = req.body;

  try {
    // Upsert: update watchedAt if already exists, else create new
    await WatchHistory.findOneAndUpdate(
      { user: userId, video: videoId },
      { watchedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ message: "Added to watch history" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add to watch history" });
  }
};

export const removeFromWatchHistory = async (req, res) => {
  await WatchHistory.deleteOne({
    user: req.user._id,
    video: req.params.videoId,
  });
  res.json({ message: "Removed from watch history" });
};

export const clearWatchHistory = async (req, res) => {
  await WatchHistory.deleteMany({ user: req.user._id });
  res.json({ message: "Watch history cleared" });
};

export const getWatchHistory = async (req, res) => {
  const userId = req.user._id;
  try {
    const history = await WatchHistory.find({ user: userId })
      .sort({ watchedAt: -1 })
      .populate({
        path: "video",
        populate: { path: "owner", select: "username fullName avatar" },
      });
    res.json({ data: history.map((h) => h.video).filter(Boolean) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch watch history" });
  }
};
