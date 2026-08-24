import api from "../api/axios";
import type { ApiResponse, Video } from "../types";

export const watchHistoryService = {
  add: async (videoId: string) => api.post("/history", { videoId }),
  get: async () => {
    const response = await api.get<ApiResponse<Video[]>>("/history");
    return response.data;
  },
};
