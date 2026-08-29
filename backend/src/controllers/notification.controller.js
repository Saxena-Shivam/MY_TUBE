import { isValidObjectId } from "mongoose";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate("actor", "username fullName avatar")
    .sort({ createdAt: -1 })
    .limit(100);
  const unread = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });
  res.json(
    new ApiResponse(200, { notifications, unread }, "Notifications fetched")
  );
});

const markNotificationRead = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.notificationId))
    throw new ApiError(400, "Invalid notification ID");
  await Notification.updateOne(
    { _id: req.params.notificationId, recipient: req.user._id },
    { read: true }
  );
  res.json(new ApiResponse(200, {}, "Notification marked as read"));
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { read: true }
  );
  res.json(new ApiResponse(200, {}, "Notifications marked as read"));
});

const clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });
  res.json(new ApiResponse(200, {}, "Notifications cleared"));
});

export {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
};
