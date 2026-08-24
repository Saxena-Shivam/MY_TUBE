import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!mongoose.isValidObjectId(videoId))
    throw new ApiError(400, "Invalid video ID");

  const comments = await Comment.find({ video: videoId })
    .populate("owner", "username avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Comment.countDocuments({ video: videoId });

  res.json(
    new ApiResponse(
      200,
      { comments, total, page: Number(page), limit: Number(limit) },
      "Comments fetched successfully"
    )
  );
});

// Add a comment to a video
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;
  const { content } = req.body;

  if (!mongoose.isValidObjectId(videoId))
    throw new ApiError(400, "Invalid video ID");
  if (!content) throw new ApiError(400, "Comment content is required");
  if (!userId) throw new ApiError(401, "Unauthorized");

  const comment = await Comment.create({
    video: videoId,
    owner: userId,
    content,
  });

  await comment.populate("owner", "username avatar");

  res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});

// Update a comment
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;
  const { content } = req.body;

  if (!mongoose.isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment ID");
  if (!content) throw new ApiError(400, "Comment content is required");
  if (!userId) throw new ApiError(401, "Unauthorized");

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, owner: userId },
    { content },
    { new: true }
  ).populate("owner", "username avatar");

  if (!comment) throw new ApiError(404, "Comment not found or unauthorized");

  res.json(new ApiResponse(200, comment, "Comment updated successfully"));
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment ID");
  if (!userId) throw new ApiError(401, "Unauthorized");

  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: userId,
  });
  if (!comment) throw new ApiError(404, "Comment not found or unauthorized");

  res.json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
