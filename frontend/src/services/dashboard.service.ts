import api from "../api/axios";
import type { ApiResponse, ChannelStats, Video } from "../types";

export const dashboardService = {
  getStats: async () => {
    const response =
      await api.get<ApiResponse<ChannelStats>>("/dashboard/stats");
    return response.data;
  },
  getVideos: async () => {
    const response = await api.get<ApiResponse<Video[]>>("/dashboard/videos");
    return response.data;
  },
};
