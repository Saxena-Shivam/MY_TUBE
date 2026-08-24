import api from "../api/axios";
import type { ApiResponse, Tweet } from "../types";

export const tweetService = {
  getByUser: async (userId: string) => {
    const response = await api.get<ApiResponse<Tweet[]>>(
      `/tweets/user/${userId}`,
    );
    return response.data;
  },
  create: async (content: string) => {
    const response = await api.post<ApiResponse<Tweet>>("/tweets", { content });
    return response.data;
  },
  update: async (tweetId: string, content: string) => {
    const response = await api.patch<ApiResponse<Tweet>>(`/tweets/${tweetId}`, {
      content,
    });
    return response.data;
  },
  delete: async (tweetId: string) => api.delete(`/tweets/${tweetId}`),
};
