import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Notification } from "../models/notification.model.js";
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
    const likesCount = await Like.countDocuments({ video: videoId });
    return res.json(
      new ApiResponse(200, { liked: false, likesCount }, "Video unliked")
    );
  } else {
    await Like.create({ video: videoId, likedBy: userId });
    const video = await Video.findById(videoId).select("owner title");
    if (video?.owner && video.owner.toString() !== userId.toString()) {
      await Notification.create({
        recipient: video.owner,
        actor: userId,
        type: "video-like",
        video: videoId,
        message: "liked your video",
      });
    }
    const likesCount = await Like.countDocuments({ video: videoId });
    return res.json(
      new ApiResponse(201, { liked: true, likesCount }, "Video liked")
    );
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
    const likesCount = await Like.countDocuments({ comment: commentId });
    return res.json(
      new ApiResponse(200, { liked: false, likesCount }, "Comment unliked")
    );
  } else {
    await Like.create({ comment: commentId, likedBy: userId });
    const likesCount = await Like.countDocuments({ comment: commentId });
    return res.json(
      new ApiResponse(201, { liked: true, likesCount }, "Comment liked")
    );
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
    const likesCount = await Like.countDocuments({ tweet: tweetId });
    return res.json(
      new ApiResponse(200, { liked: false, likesCount }, "Tweet unliked")
    );
  } else {
    await Like.create({ tweet: tweetId, likedBy: userId });
    const tweet = await Tweet.findById(tweetId).select("owner");
    if (tweet?.owner && tweet.owner.toString() !== userId.toString()) {
      await Notification.create({
        recipient: tweet.owner,
        actor: userId,
        type: "tweet-like",
        tweet: tweetId,
        message: "liked your post",
      });
    }
    const likesCount = await Like.countDocuments({ tweet: tweetId });
    return res.json(
      new ApiResponse(201, { liked: true, likesCount }, "Tweet liked")
    );
  }
});

// Get all liked videos for the current user
const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const likes = await Like.find({
    likedBy: userId,
    video: { $exists: true },
  }).populate({
    path: "video",
    populate: { path: "owner", select: "username fullName avatar" },
  });
  const videos = likes
    .map((like) => like.video)
    .filter((video) => video !== null && video !== undefined);

  res.json(new ApiResponse(200, videos, "Liked videos fetched successfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
