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
  email?: string;
  avatar: string;
  coverImage?: string;
  subscribersCount?: number;
  channelsSubscribedToCount?: number;
  isSubscribed?: boolean;
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
  likesCount?: number;
  unlikesCount?: number;
  reaction?: "like" | "unlike" | null;
  isLiked?: boolean;
  subscribersCount?: number;
  isSubscribed?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Comment = {
  _id: string;
  content: string;
  video?: string;
  tweet?: string;
  parent?: string | null;
  owner?: User;
  likesCount?: number;
  isLiked?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Playlist = {
  _id: string;
  name: string;
  description?: string;
  videos: Array<Video | string>;
  owner?: User | string;
  createdAt?: string;
  updatedAt?: string;
};

export type Tweet = {
  _id: string;
  content: string;
  owner?: User | string;
  likesCount?: number;
  unlikesCount?: number;
  reaction?: "like" | "unlike" | null;
  isLiked?: boolean;
  commentsCount?: number;
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

export type Notification = {
  _id: string;
  actor?: User;
  type: string;
  message: string;
  video?: string;
  tweet?: string;
  read: boolean;
  createdAt?: string;
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
