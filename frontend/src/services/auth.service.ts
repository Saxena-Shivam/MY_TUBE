import api from "../api/axios";
import type { ApiResponse, AuthResponse, User } from "../types";

export const authService = {
  login: async (payload: {
    email?: string;
    username?: string;
    password: string;
  }) => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/users/login",
      payload,
    );
    return response.data;
  },
  register: async (formData: FormData) => {
    const response = await api.post<ApiResponse<User>>(
      "/users/register",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },
  logout: async () => api.post("/users/logout"),
  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<User>>("/users/current-user");
    return response.data;
  },
  refreshToken: async () => api.post("/users/refresh-token"),
};
