import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Users, Video } from "lucide-react";
import api from "../../api/axios";
import { subscriptionService } from "../../services/subscription.service";
import { videoService } from "../../services/video.service";
import { tweetService } from "../../services/tweet.service";
import type { ApiResponse, User, Video as VideoType, Tweet } from "../../types";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonBox } from "../../components/common/Loader";
import { useAuth } from "../../context/AuthContext";

export function ChannelPage() {
  const { username } = useParams();
  const [channel, setChannel] = useState<
    (User & { subscribersCount?: number; isSubscribed?: boolean }) | null
  >(null);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!username) return;

    const fetchChannel = async () => {
      setLoading(true);
      try {
        const channelData = await api.get<ApiResponse<any>>(
          `/users/c/${username}`,
        );
        setChannel(channelData.data.data);
        const videosData = await videoService.getByUsername(username);
        setVideos(videosData.data || []);
        const userResponse =
          await api.get<ApiResponse<{ _id: string }>>(`/users/current-user`);
        const currentUserId = userResponse.data.data._id;
        const tweetsData = await tweetService.getByUser(
          channelData.data.data._id || currentUserId,
        );
        setTweets(tweetsData.data || []);
      } catch {
        setChannel(null);
        setVideos([]);
        setTweets([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchChannel();
  }, [username]);

  const handleSubscribe = async () => {
    if (!channel?._id) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }
    await subscriptionService.toggle(channel._id);
    setChannel((prev) =>
      prev
        ? {
            ...prev,
            isSubscribed: !prev.isSubscribed,
            subscribersCount:
              (prev.subscribersCount ?? 0) + (prev.isSubscribed ? -1 : 1),
          }
        : prev,
    );
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <SkeletonBox className="h-64 rounded-3xl" />
        <SkeletonBox className="h-72 rounded-3xl" />
      </div>
    );
  }

  if (!channel) {
    return (
      <EmptyState
        title="Channel not found"
        description="This creator profile is unavailable."
      />
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div
          className="h-48 w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800"
          style={{
            backgroundImage: channel.coverImage
              ? `url(${channel.coverImage})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={channel.avatar || "https://ui-avatars.com/api/?name=U"}
                alt={channel.username}
                className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md dark:border-slate-900"
              />
              <div>
                <h1 className="text-3xl font-bold">{channel.fullName}</h1>
                <p className="text-sm text-slate-500">@{channel.username}</p>
              </div>
            </div>
            <button
              onClick={() => void handleSubscribe()}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
            >
              <UserPlus className="h-4 w-4" />{" "}
              {channel.isSubscribed ? "Subscribed" : "Subscribe"}
            </button>
          </div>
          <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" />{" "}
              {(channel.subscribersCount ?? 0).toLocaleString()} subscribers
            </span>
            <span className="inline-flex items-center gap-2">
              <Video className="h-4 w-4" /> {videos.length} videos
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold">Videos</h2>
          {videos.length === 0 ? (
            <EmptyState
              title="No videos yet"
              description="This channel has not published anything yet."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {videos.map((video) => (
                <motion.article
                  key={video._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                >
                  <img
                    src={video.thumbnail || "https://images.unsplash.com/..."}
                    alt={video.title}
                    className="h-36 w-full object-cover"
                  />
                  <div className="p-3">
                    <h3 className="line-clamp-2 text-sm font-semibold">
                      {video.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {video.views ?? 0} views
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold">Tweets</h2>
          {tweets.length === 0 ? (
            <EmptyState
              title="No tweets"
              description="This creator hasn’t posted anything yet."
            />
          ) : (
            <div className="space-y-3">
              {tweets.map((tweet) => (
                <div
                  key={tweet._id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
                >
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">
                    {tweet.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
