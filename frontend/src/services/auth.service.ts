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
    );
    return response.data;
  },
  logout: async () => api.post("/users/logout"),
  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<User>>("/users/current-user");
    return response.data;
  },
  refreshToken: async () => api.post("/users/refresh-token"),
  getChannel: async (username: string) => {
    const response = await api.get<ApiResponse<User>>(`/users/c/${username}`);
    return response.data;
  },
  updateAccount: async (payload: { fullName: string; email: string }) => {
    const response = await api.patch<ApiResponse<User>>(
      "/users/update-account",
      payload,
    );
    return response.data;
  },
  changePassword: async (payload: {
    oldPassword: string;
    newPassword: string;
  }) => api.post("/users/change-password", payload),
};
