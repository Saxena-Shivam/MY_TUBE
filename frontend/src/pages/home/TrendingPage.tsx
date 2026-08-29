import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <div
              key={video._id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <button
                type="button"
                onClick={() => navigate(`/watch/${video._id}`)}
                className="block w-full"
              >
                <img
                  src={
                    video.thumbnail || "https://ui-avatars.com/api/?name=Video"
                  }
                  alt={video.title}
                  className="h-52 w-full object-cover"
                />
              </button>
              <div className="p-4">
                <button
                  type="button"
                  onClick={() => navigate(`/watch/${video._id}`)}
                  className="line-clamp-2 text-left text-sm font-semibold hover:text-red-600 dark:hover:text-red-400"
                >
                  {video.title}
                </button>
                <p className="mt-2 text-xs text-slate-500">
                  {video.views ?? 0} views
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
