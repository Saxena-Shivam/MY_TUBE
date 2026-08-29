import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user?._id;

  if (!name) throw new ApiError(400, "Playlist name is required");
  if (!userId) throw new ApiError(401, "Unauthorized");

  const playlist = await Playlist.create({
    name,
    description,
    owner: userId,
    videos: [],
  });

  res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");

  const playlists = await Playlist.find({ owner: userId }).populate({
    path: "videos",
    populate: { path: "owner", select: "username fullName avatar" },
  });
  res.json(
    new ApiResponse(200, playlists, "User playlists fetched successfully")
  );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist ID");

  const playlist = await Playlist.findById(playlistId)
    .populate({
      path: "videos",
      populate: { path: "owner", select: "username fullName avatar" },
    })
    .populate("owner", "username fullName avatar");
  if (!playlist) throw new ApiError(404, "Playlist not found");

  res.json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  if (req.user?._id && playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only modify your own playlists");
  }

  const alreadyAdded = playlist.videos.some(
    (vid) => vid.toString() === videoId.toString()
  );
  if (alreadyAdded) {
    throw new ApiError(400, "Video already in playlist");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  res.json(new ApiResponse(200, playlist, "Video added to playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  if (req.user?._id && playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only modify your own playlists");
  }

  playlist.videos = playlist.videos.filter((vid) => vid.toString() !== videoId);
  await playlist.save();

  res.json(new ApiResponse(200, playlist, "Video removed from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist ID");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");
  if (req.user?._id && playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own playlists");
  }
  await Playlist.findByIdAndDelete(playlistId);

  res.json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist ID");

  const updateData = {};
  if (name) updateData.name = name;
  if (description) updateData.description = description;

  const playlist = await Playlist.findByIdAndUpdate(playlistId, updateData, {
    new: true,
  });
  if (!playlist) throw new ApiError(404, "Playlist not found");

  res.json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
