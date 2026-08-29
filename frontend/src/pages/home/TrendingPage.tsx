import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Eye, Clock3 } from "lucide-react";
import { videoService } from "../../services/video.service";
import type { Video } from "../../types";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonBox } from "../../components/common/Loader";

export function TrendingPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await videoService.getTrending();
        setVideos(data);
      } catch {
        setError("Trending feed is unavailable.");
      } finally {
        setLoading(false);
      }
    };

    void fetchTrending();
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="rounded-xl bg-orange-500/10 p-2 text-orange-500">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Trending</h1>
          <p className="text-sm text-slate-500">
            What’s booming in the last two months
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBox key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <EmptyState
          title="No trending videos"
          description="The trend queue is empty right now."
        />
      ) : (
        <div className="space-y-4">
          {videos.map((video, index) => (
            <motion.article
              key={video._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row"
            >
              <div className="flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-2xl font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                #{index + 1}
              </div>
              <button
                type="button"
                onClick={() => navigate(`/watch/${video._id}`)}
                className="shrink-0"
              >
                <img
                  src={video.thumbnail || "https://images.unsplash.com/..."}
                  alt={video.title}
                  className="h-32 w-full rounded-2xl object-cover sm:w-52"
                />
              </button>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{video.title}</h2>
                  <p className="text-sm text-slate-500">
                    {typeof video.owner === "object"
                      ? video.owner.username
                      : "creator"}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {video.views ?? 0}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" /> fresh upload
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
