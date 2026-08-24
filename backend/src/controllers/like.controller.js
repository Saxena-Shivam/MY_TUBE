import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");
  if (!userId) throw new ApiError(401, "Unauthorized");

  const existing = await Like.findOne({ video: videoId, likedBy: userId });
  if (existing) {
    await Like.deleteOne({ _id: existing._id });
    return res.json(new ApiResponse(200, {}, "Video unliked"));
  } else {
    await Like.create({ video: videoId, likedBy: userId });
    return res.json(new ApiResponse(201, {}, "Video liked"));
  }
});

// Toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;
  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment ID");
  if (!userId) throw new ApiError(401, "Unauthorized");

  const existing = await Like.findOne({ comment: commentId, likedBy: userId });
  if (existing) {
    await Like.deleteOne({ _id: existing._id });
    return res.json(new ApiResponse(200, {}, "Comment unliked"));
  } else {
    await Like.create({ comment: commentId, likedBy: userId });
    return res.json(new ApiResponse(201, {}, "Comment liked"));
  }
});

// Toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user?._id;
  if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet ID");
  if (!userId) throw new ApiError(401, "Unauthorized");

  const existing = await Like.findOne({ tweet: tweetId, likedBy: userId });
  if (existing) {
    await Like.deleteOne({ _id: existing._id });
    return res.json(new ApiResponse(200, {}, "Tweet unliked"));
  } else {
    await Like.create({ tweet: tweetId, likedBy: userId });
    return res.json(new ApiResponse(201, {}, "Tweet liked"));
  }
});

// Get all liked videos for the current user
const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const likes = await Like.find({
    likedBy: userId,
    video: { $exists: true },
  }).populate("video");
  const videos = likes.map((like) => like.video);

  res.json(new ApiResponse(200, videos, "Liked videos fetched successfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
