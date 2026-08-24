import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get channel stats: total video views, subscribers, videos, likes
const getChannelStats = asyncHandler(async (req, res) => {
  const channelId = req.user?._id;
  if (!channelId) throw new ApiError(401, "Unauthorized");

  // Total videos uploaded by the channel
  const totalVideos = await Video.countDocuments({ owner: channelId });

  // Total subscribers
  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  // Total likes on all videos by this channel
  const videoIds = await Video.find({ owner: channelId }).distinct("_id");
  const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

  // Total views on all videos by this channel
  const videos = await Video.find({ owner: channelId }, "views");
  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);

  res.json(
    new ApiResponse(
      200,
      {
        totalVideos,
        totalSubscribers,
        totalLikes,
        totalViews,
      },
      "Channel stats fetched successfully"
    )
  );
});

// Get all videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req, res) => {
  const channelId = req.user?._id;
  if (!channelId) throw new ApiError(401, "Unauthorized");

  const videos = await Video.find({ owner: channelId }).sort({ createdAt: -1 });

  res.json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
