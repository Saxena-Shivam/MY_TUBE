import api from "../api/axios";
import type { ApiResponse, Subscription, User } from "../types";

export const subscriptionService = {
  getMySubscriptions: async () => {
    const response = await api.get<ApiResponse<User[]>>("/subscriptions/me");
    return response.data;
  },
  toggle: async (channelId: string) => {
    const response = await api.post<ApiResponse<unknown>>(
      `/subscriptions/c/${channelId}`,
    );
    return response.data;
  },
  getSubscribers: async (channelId: string) => {
    const response = await api.get<ApiResponse<Subscription[]>>(
      `/subscriptions/u/${channelId}`,
    );
    return response.data;
  },
  getSubscribedChannels: async (subscriberId: string) => {
    const response = await api.get<ApiResponse<Subscription[]>>(
      `/subscriptions/c/${subscriberId}`,
    );
    return response.data;
  },
};
