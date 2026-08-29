import api from "../api/axios";
import type { ApiResponse } from "../types";

export type NewsItem = {
  title: string;
  url: string;
  by: string;
  time: number;
};

export const newsService = {
  get: async () => {
    const response = await api.get<ApiResponse<NewsItem[]>>("/news");
    return response.data;
  },
};
