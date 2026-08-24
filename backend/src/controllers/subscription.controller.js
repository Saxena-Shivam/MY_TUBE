import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user?._id;

  if (!isValidObjectId(channelId)) throw new ApiError(400, "Invalid channel ID");
  if (!subscriberId) throw new ApiError(401, "Unauthorized");

  if (subscriberId.toString() === channelId) {
    throw new ApiError(400, "You cannot subscribe to yourself");
  }

  const existing = await Subscription.findOne({ channel: channelId, subscriber: subscriberId });

  if (existing) {
    await Subscription.deleteOne({ _id: existing._id });
    return res.json(new ApiResponse(200, {}, "Unsubscribed successfully"));
  } else {
    await Subscription.create({ channel: channelId, subscriber: subscriberId });
    return res.json(new ApiResponse(201, {}, "Subscribed successfully"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) throw new ApiError(400, "Invalid channel ID");

  const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber", "username avatar");
  res.json(new ApiResponse(200, subscribers, "Channel subscribers fetched successfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) throw new ApiError(400, "Invalid subscriber ID");

  const channels = await Subscription.find({ subscriber: subscriberId }).populate("channel", "username avatar");
  res.json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };