import api from "../api/axios";
import type { ApiResponse, Playlist } from "../types";

export const playlistService = {
  getByUser: async (userId: string) => {
    const response = await api.get<ApiResponse<Playlist[]>>(
      `/playlists/user/${userId}`,
    );
    return response.data;
  },
  getById: async (playlistId: string) => {
    const response = await api.get<ApiResponse<Playlist>>(
      `/playlists/${playlistId}`,
    );
    return response.data;
  },
  create: async (payload: { name: string; description: string }) => {
    const response = await api.post<ApiResponse<Playlist>>(
      "/playlists",
      payload,
    );
    return response.data;
  },
  update: async (
    playlistId: string,
    payload: { name?: string; description?: string },
  ) => {
    const response = await api.patch<ApiResponse<Playlist>>(
      `/playlists/${playlistId}`,
      payload,
    );
    return response.data;
  },
  delete: async (playlistId: string) => api.delete(`/playlists/${playlistId}`),
  addVideo: async (playlistId: string, videoId: string) => {
    const response = await api.patch<ApiResponse<Playlist>>(
      `/playlists/add/${videoId}/${playlistId}`,
    );
    return response.data;
  },
  removeVideo: async (playlistId: string, videoId: string) => {
    const response = await api.patch<ApiResponse<Playlist>>(
      `/playlists/remove/${videoId}/${playlistId}`,
    );
    return response.data;
  },
};
