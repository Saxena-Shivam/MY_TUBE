import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Flame } from "lucide-react";
import { videoService } from "../../services/video.service";
import { tweetService } from "../../services/tweet.service";
import type { Tweet, Video } from "../../types";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonBox } from "../../components/common/Loader";
import { VideoCard } from "../../components/video/VideoCard";
import { TweetCard } from "../../components/tweet/TweetCard";
import { TweetComposer } from "../../components/tweet/TweetComposer";
import { SaveToPlaylistModal } from "../../components/playlist/SaveToPlaylistModal";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/user.service";
import type { User } from "../../types";
import { Link } from "react-router-dom";

export function HomePage() {
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState<Video[]>([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [channels, setChannels] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveVideo, setSaveVideo] = useState<Video | null>(null);
  const { isAuthenticated } = useAuth();

  const query = searchParams.get("query") ?? "";

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        const [videosRes, tweetsRes, usersRes] = await Promise.allSettled([
          videoService.getAll({
            limit: 12,
            query: query || undefined,
          }),
          tweetService.getAll(),
          query
            ? userService.search(query)
            : Promise.resolve({ data: [] as User[] }),
        ]);
        if (videosRes.status === "fulfilled") {
          setVideos(
            (videosRes.value.data.videos || []).filter(
              (video): video is Video => Boolean(video?._id),
            ),
          );
        } else {
          setError("Unable to load videos right now.");
        }
        if (tweetsRes.status === "fulfilled") {
          setTweets(
            (tweetsRes.value.data || []).filter((tweet): tweet is Tweet =>
              Boolean(tweet?._id),
            ),
          );
        }
        if (usersRes.status === "fulfilled")
          setChannels(usersRes.value.data || []);
      } catch {
        setError("Unable to load videos right now.");
      } finally {
        setLoading(false);
      }
    };

    void fetchFeed();
  }, [query]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {isAuthenticated && (
        <TweetComposer
          onCreated={(tweet) => setTweets((prev) => [tweet, ...prev])}
        />
      )}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Latest videos
          </h2>
        </div>
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBox key={index} className="h-72 rounded-3xl" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <EmptyState
            title="No videos found"
            description={
              query
                ? "Try a different search term or browse recent uploads."
                : "No public videos yet."
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                onSave={(item) => setSaveVideo(item)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        {query && channels.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold">Channels</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {channels.map((channel) => (
                <Link
                  key={channel._id}
                  to={`/channel/${channel.username}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 hover:border-red-400 dark:border-slate-800 dark:bg-slate-900"
                >
                  <img
                    src={channel.avatar}
                    alt={channel.username}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <span>
                    <strong className="block">{channel.fullName}</strong>
                    <span className="text-sm text-slate-500">
                      @{channel.username}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
          Community posts
        </h2>
        {tweets.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description="Creators can share updates, and they will appear here."
          />
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {tweets.map((tweet) => (
              <TweetCard
                key={tweet._id}
                tweet={tweet}
                onDeleted={(id) =>
                  setTweets((prev) => prev.filter((item) => item._id !== id))
                }
                onUpdated={(next) =>
                  setTweets((prev) =>
                    prev.map((item) => (item._id === next._id ? next : item)),
                  )
                }
              />
            ))}
          </div>
        )}
      </section>

      <SaveToPlaylistModal
        video={saveVideo}
        open={Boolean(saveVideo)}
        onClose={() => setSaveVideo(null)}
      />
    </div>
  );
}
