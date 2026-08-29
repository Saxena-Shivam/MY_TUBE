import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ListVideo, UserPlus, Users, Video } from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";
import { getApiErrorMessage } from "../../api/axios";
import { subscriptionService } from "../../services/subscription.service";
import { videoService } from "../../services/video.service";
import { tweetService } from "../../services/tweet.service";
import { playlistService } from "../../services/playlist.service";
import type {
  ApiResponse,
  Playlist,
  User,
  Video as VideoType,
  Tweet,
} from "../../types";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonBox } from "../../components/common/Loader";
import { VideoCard } from "../../components/video/VideoCard";
import { TweetCard } from "../../components/tweet/TweetCard";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import { btnPrimary, btnSecondary, formatCount } from "../../lib/utils";

export function ChannelPage() {
  const { username } = useParams();
  const [channel, setChannel] = useState<
    (User & { subscribersCount?: number; isSubscribed?: boolean }) | null
  >(null);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [deleteVideo, setDeleteVideo] = useState<VideoType | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const subLock = useRef(false);

  useEffect(() => {
    if (!username) return;

    const fetchChannel = async () => {
      setLoading(true);
      try {
        const channelData = await api.get<ApiResponse<User>>(
          `/users/c/${username}`,
        );
        const profile = channelData.data.data;
        setChannel(profile);
        const videosData = await videoService.getByUsername(username);
        setVideos(videosData.data || []);
        const tweetsData = await tweetService.getByUser(profile._id);
        setTweets(tweetsData.data || []);
        const playlistsData = await playlistService.getByUser(profile._id);
        setPlaylists(playlistsData.data || []);
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
    if (channel._id === user._id || subLock.current) return;
    subLock.current = true;
    const next = !channel.isSubscribed;
    setChannel((prev) =>
      prev
        ? {
            ...prev,
            isSubscribed: next,
            subscribersCount: (prev.subscribersCount ?? 0) + (next ? 1 : -1),
          }
        : prev,
    );
    try {
      const response = await subscriptionService.toggle(channel._id);
      const data = response.data as {
        subscribed?: boolean;
        subscribersCount?: number;
      };
      setChannel((prev) =>
        prev
          ? {
              ...prev,
              isSubscribed: data?.subscribed ?? next,
              subscribersCount: data?.subscribersCount ?? prev.subscribersCount,
            }
          : prev,
      );
      toast.success(next ? "Subscribed" : "Unsubscribed");
    } catch (error) {
      setChannel((prev) =>
        prev
          ? {
              ...prev,
              isSubscribed: !next,
              subscribersCount: (prev.subscribersCount ?? 0) + (next ? -1 : 1),
            }
          : prev,
      );
      toast.error(getApiErrorMessage(error, "Could not update subscription"));
    } finally {
      subLock.current = false;
    }
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

  const isOwner = user?._id === channel._id;

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
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {channel.fullName}
                </h1>
                <p className="text-sm text-slate-500">@{channel.username}</p>
              </div>
            </div>
            {!isOwner && (
              <button
                onClick={() => void handleSubscribe()}
                className={channel.isSubscribed ? btnSecondary : btnPrimary}
              >
                <UserPlus className="h-4 w-4" />{" "}
                {channel.isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" />{" "}
              {formatCount(channel.subscribersCount)} subscribers
            </span>
            <span className="inline-flex items-center gap-2">
              <Video className="h-4 w-4" /> {videos.length} videos
            </span>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <ListVideo className="h-5 w-5 text-red-600" /> Playlists
        </h2>
        {playlists.length === 0 ? (
          <EmptyState
            title="No public playlists"
            description="This channel has not created any playlists yet."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist) => (
              <a
                key={playlist._id}
                href={`/playlist/${playlist._id}`}
                className="rounded-2xl border border-slate-200 p-4 hover:border-red-400 dark:border-slate-700"
              >
                <h3 className="font-semibold">{playlist.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {playlist.videos?.filter(
                    (video) => typeof video === "object" && video?._id,
                  ).length || 0}{" "}
                  videos
                </p>
              </a>
            ))}
          </div>
        )}
      </section>

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
                <VideoCard
                  key={video._id}
                  video={video}
                  onDelete={isOwner ? setDeleteVideo : undefined}
                />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold">Posts</h2>
          {tweets.length === 0 ? (
            <EmptyState
              title="No posts"
              description="This creator hasn’t posted anything yet."
            />
          ) : (
            <div className="space-y-3">
              {tweets.map((tweet) => (
                <TweetCard
                  key={tweet._id}
                  tweet={tweet}
                  onDeleted={(id) =>
                    setTweets((prev) => prev.filter((item) => item._id !== id))
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(deleteVideo)}
        title="Delete this video?"
        description="This video and its related references will be removed."
        onClose={() => setDeleteVideo(null)}
        onConfirm={async () => {
          if (!deleteVideo) return;
          try {
            await videoService.delete(deleteVideo._id);
            setVideos((current) =>
              current.filter((video) => video._id !== deleteVideo._id),
            );
            setDeleteVideo(null);
            toast.success("Video deleted");
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Could not delete video"));
          }
        }}
      />
    </div>
  );
}
