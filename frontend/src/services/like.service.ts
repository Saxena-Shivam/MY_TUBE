import api from "../api/axios";
import type { ApiResponse, Video } from "../types";

export const likeService = {
  toggleVideo: async (videoId: string, reaction: "like" | "unlike") => {
    const response = await api.post<ApiResponse<unknown>>(
      `/likes/toggle/v/${videoId}`,
      { reaction },
    );
    return response.data;
  },
  toggleComment: async (commentId: string) => {
    const response = await api.post<ApiResponse<unknown>>(
      `/likes/toggle/c/${commentId}`,
    );
    return response.data;
  },
  toggleTweet: async (tweetId: string, reaction: "like" | "unlike") => {
    const response = await api.post<ApiResponse<unknown>>(
      `/likes/toggle/t/${tweetId}`,
      { reaction },
    );
    return response.data;
  },
  getLikedVideos: async () => {
    const response = await api.get<ApiResponse<Video[]>>("/likes/videos");
    return response.data;
  },
};
