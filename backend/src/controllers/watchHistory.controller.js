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

export const getWatchHistory = async (req, res) => {
  const userId = req.user._id;
  try {
    const history = await WatchHistory.find({ user: userId })
      .sort({ watchedAt: -1 })
      .populate("video");
    res.json({ data: history.map((h) => h.video) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch watch history" });
  }
};
