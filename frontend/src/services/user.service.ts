import api from "../api/axios";
import type { ApiResponse, User } from "../types";

export const userService = {
  search: async (query: string) => {
    const response = await api.get<ApiResponse<User[]>>("/users/search", {
      params: { query },
    });
    return response.data;
  },
};
