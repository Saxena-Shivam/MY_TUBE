import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { getVideoDuration } from "../utils/getVideoDuration.js";

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
  const filter = {};
  if (query) {
    filter.title = { $regex: query, $options: "i" };
  }
  if (userId && isValidObjectId(userId)) {
    filter.owner = userId;
  }
  const sort = { [sortBy]: sortType === "asc" ? 1 : -1 };

  const videos = await Video.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("owner", "username avatar");

  const total = await Video.countDocuments(filter);

  res.json(
    new ApiResponse(
      200,
      { videos, total, page: Number(page), limit: Number(limit) },
      "Videos fetched successfully"
    )
  );
});

// Publish a new video (upload video and thumbnail to Cloudinary)
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const owner = req.user._id;

  if (!req.files?.videoFile) throw new ApiError(400, "Video file is required");
  if (!req.files?.thumbnail) throw new ApiError(400, "Thumbnail is required");

  const videoFilePath = req.files.videoFile[0].path;
  const thumbnailPath = req.files.thumbnail[0].path;

  // Get video duration BEFORE uploading to Cloudinary
  const duration = await getVideoDuration(videoFilePath);

  // Upload video to Cloudinary
  const videoUpload = await uploadOnCloudinary(videoFilePath, "video");
  if (!videoUpload?.url) throw new ApiError(500, "Video upload failed");

  // Upload thumbnail to Cloudinary
  const thumbnailUpload = await uploadOnCloudinary(thumbnailPath);
  if (!thumbnailUpload?.url) throw new ApiError(500, "Thumbnail upload failed");

  const video = await Video.create({
    title,
    discription: description,
    videofile: videoUpload.url,
    thumbnail: thumbnailUpload.url,
    duration,
    owner,
  });

  res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

// Get a video by ID and increment views
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  // Increment views and return the updated video
  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  ).populate("owner", "username avatar");

  if (!video) throw new ApiError(404, "Video not found");

  res.json(new ApiResponse(200, video, "Video fetched successfully"));
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

  const video = await Video.findByIdAndDelete(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  res.json(new ApiResponse(200, {}, "Video deleted successfully"));
});

// Toggle publish status (published/unpublished)
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  video.published = !video.published;
  await video.save();

  res.json(new ApiResponse(200, video, "Video publish status toggled"));
});
const getVideosByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user)
    return res.status(404).json(new ApiResponse(404, [], "User not found"));

  const videos = await Video.find({ owner: user._id, isPublished: true });
  res.json(new ApiResponse(200, videos, "Videos fetched successfully"));
});
export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getVideosByUsername,
};
