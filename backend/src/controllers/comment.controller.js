import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { withLikeStats } from "../utils/likeStats.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Notification } from "../models/notification.model.js";

async function listComments(filter, userId, page, limit) {
  const comments = await Comment.find(filter)
    .populate("owner", "username fullName avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Comment.countDocuments(filter);
  const decorated = await withLikeStats(comments, {
    field: "comment",
    userId,
  });

  return {
    comments: decorated,
    total,
    page: Number(page),
    limit: Number(limit),
  };
}

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  if (!mongoose.isValidObjectId(videoId))
    throw new ApiError(400, "Invalid video ID");

  const data = await listComments(
    { video: videoId },
    req.user?._id,
    page,
    limit
  );
  res.json(new ApiResponse(200, data, "Comments fetched successfully"));
});

const getTweetComments = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  if (!mongoose.isValidObjectId(tweetId))
    throw new ApiError(400, "Invalid tweet ID");

  const data = await listComments(
    { tweet: tweetId },
    req.user?._id,
    page,
    limit
  );
  res.json(new ApiResponse(200, data, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;
  const { content, parentId } = req.body;

  if (!mongoose.isValidObjectId(videoId))
    throw new ApiError(400, "Invalid video ID");
  if (!content) throw new ApiError(400, "Comment content is required");
  if (!userId) throw new ApiError(401, "Unauthorized");

  const comment = await Comment.create({
    video: videoId,
    owner: userId,
    content,
    parent: parentId || undefined,
  });
  const target = await Video.findById(videoId).select("owner");
  if (target?.owner && target.owner.toString() !== userId.toString()) {
    await Notification.create({
      recipient: target.owner,
      actor: userId,
      type: "video-comment",
      video: videoId,
      comment: comment._id,
      message: "commented on your video",
    });
  }
  if (parentId) {
    const parent = await Comment.findById(parentId).select("owner");
    if (parent?.owner && parent.owner.toString() !== userId.toString()) {
      await Notification.create({
        recipient: parent.owner,
        actor: userId,
        type: "comment-reply",
        video: videoId,
        comment: comment._id,
        message: "replied to your comment",
      });
    }
  }

  await comment.populate("owner", "username fullName avatar");
  const [decorated] = await withLikeStats([comment], {
    field: "comment",
    userId,
  });

  res
    .status(201)
    .json(new ApiResponse(201, decorated, "Comment added successfully"));
});

const addTweetComment = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user?._id;
  const { content, parentId } = req.body;

  if (!mongoose.isValidObjectId(tweetId))
    throw new ApiError(400, "Invalid tweet ID");
  if (!content) throw new ApiError(400, "Comment content is required");
  if (!userId) throw new ApiError(401, "Unauthorized");

  const comment = await Comment.create({
    tweet: tweetId,
    owner: userId,
    content,
    parent: parentId || undefined,
  });
  const target = await Tweet.findById(tweetId).select("owner");
  if (target?.owner && target.owner.toString() !== userId.toString()) {
    await Notification.create({
      recipient: target.owner,
      actor: userId,
      type: "tweet-comment",
      tweet: tweetId,
      comment: comment._id,
      message: "commented on your post",
    });
  }
  if (parentId) {
    const parent = await Comment.findById(parentId).select("owner");
    if (parent?.owner && parent.owner.toString() !== userId.toString()) {
      await Notification.create({
        recipient: parent.owner,
        actor: userId,
        type: "comment-reply",
        tweet: tweetId,
        comment: comment._id,
        message: "replied to your comment",
      });
    }
  }

  await comment.populate("owner", "username fullName avatar");
  const [decorated] = await withLikeStats([comment], {
    field: "comment",
    userId,
  });

  res
    .status(201)
    .json(new ApiResponse(201, decorated, "Comment added successfully"));
});

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
  ).populate("owner", "username fullName avatar");

  if (!comment) throw new ApiError(404, "Comment not found or unauthorized");

  res.json(new ApiResponse(200, comment, "Comment updated successfully"));
});

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
  await Comment.deleteMany({ parent: commentId });

  res.json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export {
  getVideoComments,
  getTweetComments,
  addComment,
  addTweetComment,
  updateComment,
  deleteComment,
};
