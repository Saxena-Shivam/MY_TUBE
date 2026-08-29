import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Playlist } from "../models/playlist.model.js";
import { Subscription } from "../models/subscription.model.js";
import { WatchHistory } from "../models/watchHistory.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { getVideoDuration } from "../utils/getVideoDuration.js";
import { withLikeStats } from "../utils/likeStats.js";

// Get all videos with pagination, search, sort, and filter by user
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;
  const filter = { isPublished: true };
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { discription: { $regex: query, $options: "i" } },
      { tags: { $regex: query, $options: "i" } },
    ];
  }
  if (userId && isValidObjectId(userId)) {
    filter.owner = userId;
  }
  const sort = { [sortBy]: sortType === "asc" ? 1 : -1 };

  const videos = await Video.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("owner", "username fullName avatar");
  const decoratedVideos = await withLikeStats(videos, {
    field: "video",
    userId: req.user?._id,
  });

  const total = await Video.countDocuments(filter);

  res.json(
    new ApiResponse(
      200,
      {
        videos: decoratedVideos,
        total,
        page: Number(page),
        limit: Number(limit),
      },
      "Videos fetched successfully"
    )
  );
});

// Publish a new video (upload video and thumbnail to Cloudinary)
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const tags = String(req.body.tags || "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20);
  const owner = req.user._id;
  const playlistIds = Array.isArray(req.body.playlistIds)
    ? req.body.playlistIds
    : req.body.playlistIds
      ? [req.body.playlistIds]
      : [];

  if (!req.files?.videoFile) throw new ApiError(400, "Video file is required");
  if (!req.files?.thumbnail) throw new ApiError(400, "Thumbnail is required");

  const videoFilePath = req.files.videoFile[0].path;
  const thumbnailPath = req.files.thumbnail[0].path;

  // Get video duration BEFORE uploading to Cloudinary
  const duration = await getVideoDuration(videoFilePath);

  // Upload video to Cloudinary
  const videoUpload = await uploadOnCloudinary(videoFilePath, "video");
  if (!videoUpload?.secure_url) throw new ApiError(500, "Video upload failed");

  // Upload thumbnail to Cloudinary
  const thumbnailUpload = await uploadOnCloudinary(thumbnailPath, "image");
  if (!thumbnailUpload?.secure_url)
    throw new ApiError(500, "Thumbnail upload failed");

  const video = await Video.create({
    title,
    discription: description,
    videofile: videoUpload.secure_url,
    thumbnail: thumbnailUpload.secure_url,
    duration,
    owner,
    tags,
  });

  if (playlistIds.length) {
    await Playlist.updateMany(
      { _id: { $in: playlistIds }, owner },
      { $addToSet: { videos: video._id } }
    );
  }
  const subscribers = await Subscription.find({ channel: owner }).select(
    "subscriber"
  );
  if (subscribers.length) {
    await Notification.insertMany(
      subscribers.map(({ subscriber }) => ({
        recipient: subscriber,
        actor: owner,
        type: "video-upload",
        video: video._id,
        message: "uploaded a new video",
      }))
    );
  }

  res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

// Get a video by ID without changing the view count.
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(videoId).populate(
    "owner",
    "username fullName avatar"
  );

  if (!video) throw new ApiError(404, "Video not found");

  const userId = req.user?._id;
  const ownerId = video.owner?._id || video.owner;
  const [
    likesCount,
    unlikesCount,
    reactionRecord,
    subscribersCount,
    isSubscribed,
  ] = await Promise.all([
    Like.countDocuments({
      video: videoId,
      $or: [{ reaction: "like" }, { reaction: { $exists: false } }],
    }),
    Like.countDocuments({ video: videoId, reaction: "unlike" }),
    userId
      ? Like.findOne({ video: videoId, likedBy: userId }).select("reaction")
      : null,
    ownerId ? Subscription.countDocuments({ channel: ownerId }) : 0,
    userId && ownerId
      ? Subscription.exists({ channel: ownerId, subscriber: userId })
      : false,
  ]);

  const payload = video.toObject();
  payload.duration =
    payload.duration == null ? 0 : Number(Number(payload.duration).toFixed(2));
  payload.likesCount = likesCount;
  payload.unlikesCount = unlikesCount;
  payload.reaction = reactionRecord?.reaction || null;
  payload.isLiked = payload.reaction === "like";
  if (payload.owner && typeof payload.owner === "object") {
    payload.owner.subscribersCount = subscribersCount;
    payload.owner.isSubscribed = Boolean(isSubscribed);
  }
  payload.subscribersCount = subscribersCount;
  payload.isSubscribed = Boolean(isSubscribed);

  res.json(new ApiResponse(200, payload, "Video fetched successfully"));
});

const recordVideoView = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");
  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!video) throw new ApiError(404, "Video not found");
  res.json(new ApiResponse(200, { views: video.views }, "Video view recorded"));
});

// Update video details
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const updateData = {};
  if (title) updateData.title = title;
  if (description) updateData.discription = description;

  if (req.file) {
    const thumbnailUpload = await uploadOnCloudinary(req.file.path);
    updateData.thumbnail = thumbnailUpload?.url || "";
  }

  const video = await Video.findByIdAndUpdate(videoId, updateData, {
    new: true,
  });
  if (!video) throw new ApiError(404, "Video not found");

  res.json(new ApiResponse(200, video, "Video updated successfully"));
});

// Delete a video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");
  if (req.user?._id && video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own videos");
  }
  const commentIds = await Comment.find({ video: videoId }).distinct("_id");
  await Promise.all([
    Video.deleteOne({ _id: videoId }),
    Playlist.updateMany({ videos: videoId }, { $pull: { videos: videoId } }),
    Like.deleteMany({ video: videoId }),
    Like.deleteMany({ comment: { $in: commentIds } }),
    WatchHistory.deleteMany({ video: videoId }),
    Comment.deleteMany({ video: videoId }),
  ]);

  res.json(new ApiResponse(200, {}, "Video deleted successfully"));
});

// Toggle publish status (published/unpublished)
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  video.isPublished = !video.isPublished;
  await video.save();

  res.json(new ApiResponse(200, video, "Video publish status toggled"));
});
const getVideosByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username: username?.toLowerCase() });
  if (!user)
    return res.status(404).json(new ApiResponse(404, [], "User not found"));

  const videos = await Video.find({ owner: user._id, isPublished: true })
    .sort({ createdAt: -1 })
    .populate("owner", "username fullName avatar");
  const decoratedVideos = await withLikeStats(videos, {
    field: "video",
    userId: req.user?._id,
  });
  res.json(
    new ApiResponse(200, decoratedVideos, "Videos fetched successfully")
  );
});
export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  recordVideoView,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getVideosByUsername,
};
