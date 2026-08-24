import api from "../api/axios";
import type { ApiResponse, Video } from "../types";

export const videoService = {
  getAll: async (params?: Record<string, string | number | undefined>) => {
    const response = await api.get<
      ApiResponse<{
        videos: Video[];
        total: number;
        page: number;
        limit: number;
      }>
    >("/videos", { params });
    return response.data;
  },
  getTrending: async () => {
    const response = await api.get<{ data: Video[] }>("/videos/trending");
    return response.data.data;
  },
  getById: async (videoId: string) => {
    const response = await api.get<ApiResponse<Video>>(`/videos/${videoId}`);
    return response.data;
  },
  getByUsername: async (username: string) => {
    const response = await api.get<ApiResponse<Video[]>>(
      `/videos/user/${username}`,
    );
    return response.data;
  },
  upload: async (formData: FormData) => {
    const response = await api.post<ApiResponse<Video>>("/videos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  update: async (videoId: string, payload: FormData) => {
    const response = await api.patch<ApiResponse<Video>>(
      `/videos/${videoId}`,
      payload,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },
  delete: async (videoId: string) => api.delete(`/videos/${videoId}`),
};
