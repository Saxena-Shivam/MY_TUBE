import api from "../api/axios";
import type { ApiResponse, Notification } from "../types";

type NotificationPayload = { notifications: Notification[]; unread: number };

export const notificationService = {
  get: async () => {
    const response =
      await api.get<ApiResponse<NotificationPayload>>("/notifications");
    return response.data;
  },
  markRead: async (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: async () => api.patch("/notifications/read-all"),
  clear: async () => api.delete("/notifications"),
};
