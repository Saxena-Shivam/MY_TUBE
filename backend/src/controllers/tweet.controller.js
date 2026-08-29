import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { withCommentCounts, withLikeStats } from "../utils/likeStats.js";
import { Subscription } from "../models/subscription.model.js";
import { Notification } from "../models/notification.model.js";

async function decorateTweets(tweets, userId) {
  const withLikes = await withLikeStats(tweets, { field: "tweet", userId });
  return withCommentCounts(withLikes, "tweet");
}

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user?._id;

  if (!content) throw new ApiError(400, "Tweet content is required");
  if (!userId) throw new ApiError(401, "Unauthorized");

  const tweet = await Tweet.create({
    content,
    owner: userId,
  });

  await tweet.populate("owner", "username fullName avatar");
  const subscribers = await Subscription.find({ channel: userId }).select(
    "subscriber"
  );
  if (subscribers.length) {
    await Notification.insertMany(
      subscribers.map(({ subscriber }) => ({
        recipient: subscriber,
        actor: userId,
        type: "tweet-upload",
        tweet: tweet._id,
        message: "shared a new post",
      }))
    );
  }
  const [decorated] = await decorateTweets([tweet], userId);

  res
    .status(201)
    .json(new ApiResponse(201, decorated, "Tweet created successfully"));
});

const getAllTweets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const tweets = await Tweet.find()
    .populate("owner", "username fullName avatar")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const decorated = await decorateTweets(tweets, req.user?._id);
  res.json(new ApiResponse(200, decorated, "Tweets fetched successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");

  const tweets = await Tweet.find({ owner: userId })
    .populate("owner", "username fullName avatar")
    .sort({ createdAt: -1 });
  const decorated = await decorateTweets(tweets, req.user?._id);
  res.json(new ApiResponse(200, decorated, "User tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;

  if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet ID");
  if (!content) throw new ApiError(400, "Tweet content is required");

  const tweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: userId },
    { content },
    { new: true }
  ).populate("owner", "username fullName avatar");

  if (!tweet) throw new ApiError(404, "Tweet not found or unauthorized");
  const [decorated] = await decorateTweets([tweet], userId);

  res.json(new ApiResponse(200, decorated, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet ID");

  const tweet = await Tweet.findOneAndDelete({ _id: tweetId, owner: userId });

  if (!tweet) throw new ApiError(404, "Tweet not found or unauthorized");

  const commentIds = await Comment.find({ tweet: tweetId }).distinct("_id");
  await Promise.all([
    Like.deleteMany({ tweet: tweetId }),
    Like.deleteMany({ comment: { $in: commentIds } }),
    Comment.deleteMany({ tweet: tweetId }),
  ]);

  res.json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getAllTweets, getUserTweets, updateTweet, deleteTweet };
