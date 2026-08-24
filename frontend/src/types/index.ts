export type ApiResponse<T> = {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
};

export type User = {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  avatar: string;
  coverImage?: string;
  refreshToken?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Video = {
  _id: string;
  title: string;
  description?: string;
  videoFile?: string;
  videofile?: string;
  videoUrl?: string;
  discription?: string;
  thumbnail?: string;
  duration?: number;
  views?: number;
  owner?: User | string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Comment = {
  _id: string;
  content: string;
  video?: string;
  owner?: User;
  createdAt?: string;
  updatedAt?: string;
};

export type Playlist = {
  _id: string;
  name: string;
  description?: string;
  videos: Video[] | string[];
  owner?: User | string;
  createdAt?: string;
  updatedAt?: string;
};

export type Tweet = {
  _id: string;
  content: string;
  owner?: User | string;
  createdAt?: string;
  updatedAt?: string;
};

export type Subscription = {
  _id: string;
  subscriber?: User | string;
  channel?: User | string;
  createdAt?: string;
  updatedAt?: string;
};

export type WatchHistoryItem = Video & {
  watchedAt?: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type ChannelStats = {
  totalVideos: number;
  totalSubscribers: number;
  totalLikes: number;
  totalViews: number;
};
