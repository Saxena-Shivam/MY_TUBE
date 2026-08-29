import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Flame,
  Newspaper,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import { videoService } from "../../services/video.service";
import { newsService, type NewsItem } from "../../services/news.service";
import { tweetService } from "../../services/tweet.service";
import type { Tweet, Video } from "../../types";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonBox } from "../../components/common/Loader";
import { VideoCard } from "../../components/video/VideoCard";
import { SaveToPlaylistModal } from "../../components/playlist/SaveToPlaylistModal";
import { userService } from "../../services/user.service";
import type { User } from "../../types";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../api/axios";
import { TweetCard } from "../../components/tweet/TweetCard";
import { TweetComposer } from "../../components/tweet/TweetComposer";
import { useAuth } from "../../context/AuthContext";

export function HomePage() {
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState<Video[]>([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsIndex, setNewsIndex] = useState(0);
  const [channels, setChannels] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveVideo, setSaveVideo] = useState<Video | null>(null);
  const { isAuthenticated } = useAuth();
  const query = searchParams.get("query") ?? "";

  const refreshNews = async () => {
    setNewsLoading(true);
    try {
      const response = await newsService.get();
      const nextNews = Array.isArray(response.data) ? response.data : [];
      setNews(nextNews);
      setNewsIndex((current) =>
        nextNews.length ? (current + 1) % nextNews.length : 0,
      );
    } catch {
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      setError("");
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
            (videosRes.value.data?.videos || []).filter(
              (video): video is Video => Boolean(video?._id),
            ),
          );
        } else {
          setError(
            getApiErrorMessage(
              videosRes.reason,
              "Unable to load videos right now.",
            ),
          );
        }
        if (usersRes.status === "fulfilled")
          setChannels(usersRes.value.data || []);
        if (tweetsRes.status === "fulfilled") {
          setTweets(
            (tweetsRes.value.data || []).filter((tweet): tweet is Tweet =>
              Boolean(tweet?._id),
            ),
          );
        }
        void refreshNews();
      } catch (requestError) {
        setError(
          getApiErrorMessage(requestError, "Unable to load videos right now."),
        );
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
    <div className="flex flex-col gap-8 pb-16">
      <section className="order-2">
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

      <section className="order-1">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Newspaper className="h-5 w-5 text-red-600" /> News
            </h2>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label="Refresh news"
                onClick={() => void refreshNews()}
                disabled={newsLoading}
                className="rounded-full p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RefreshCw
                  className={`h-4 w-4 ${newsLoading ? "animate-spin" : ""}`}
                />
              </button>
              <button
                type="button"
                aria-label="Previous news"
                disabled={news.length === 0}
                onClick={() =>
                  setNewsIndex(
                    (current) => (current - 1 + news.length) % news.length,
                  )
                }
                className="rounded-full p-2 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next news"
                disabled={news.length === 0}
                onClick={() =>
                  setNewsIndex((current) => (current + 1) % news.length)
                }
                className="rounded-full p-2 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          {newsLoading && news.length === 0 ? (
            <p className="text-sm text-slate-500">Loading news...</p>
          ) : news.length > 0 ? (
            <a
              href={news[newsIndex].url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl bg-slate-50 p-4 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              <h3 className="font-semibold">{news[newsIndex].title}</h3>
              <p className="mt-2 text-xs text-slate-500">
                {news[newsIndex].by}
              </p>
            </a>
          ) : (
            <p className="text-sm text-slate-500">
              News is temporarily unavailable.
            </p>
          )}
        </div>
      </section>

      <section className="order-3">
        {isAuthenticated && (
          <TweetComposer
            onCreated={(tweet) => setTweets((current) => [tweet, ...current])}
          />
        )}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold">Community posts</h2>
          {tweets.length === 0 ? (
            <EmptyState
              title="No posts yet"
              description="Creators can share updates here."
            />
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {tweets.map((tweet) => (
                <TweetCard
                  key={tweet._id}
                  tweet={tweet}
                  onDeleted={(id) =>
                    setTweets((current) =>
                      current.filter((item) => item._id !== id),
                    )
                  }
                  onUpdated={(next) =>
                    setTweets((current) =>
                      current.map((item) =>
                        item._id === next._id ? next : item,
                      ),
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
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
      </section>

      <SaveToPlaylistModal
        video={saveVideo}
        open={Boolean(saveVideo)}
        onClose={() => setSaveVideo(null)}
      />
    </div>
  );
}
