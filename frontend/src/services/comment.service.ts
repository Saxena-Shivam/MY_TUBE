import api from "../api/axios";
import type { ApiResponse, Comment } from "../types";

export const commentService = {
  getByVideo: async (videoId: string) => {
    const response = await api.get<
      ApiResponse<{
        comments: Comment[];
        total: number;
        page: number;
        limit: number;
      }>
    >(`/comments/${videoId}`);
    return response.data;
  },
  create: async (videoId: string, content: string) => {
    const response = await api.post<ApiResponse<Comment>>(
      `/comments/${videoId}`,
      { content },
    );
    return response.data;
  },
  update: async (commentId: string, content: string) => {
    const response = await api.patch<ApiResponse<Comment>>(
      `/comments/c/${commentId}`,
      { content },
    );
    return response.data;
  },
  delete: async (commentId: string) => api.delete(`/comments/c/${commentId}`),
};
