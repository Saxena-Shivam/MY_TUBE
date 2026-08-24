import { useEffect, useState } from "react";
import { History, Trash2 } from "lucide-react";
import { watchHistoryService } from "../../services/watchHistory.service";
import type { Video } from "../../types";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonBox } from "../../components/common/Loader";

export function HistoryPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await watchHistoryService.get();
        setVideos(response.data || []);
      } catch {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonBox className="h-24 rounded-3xl" />
        <SkeletonBox className="h-24 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-500">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Watch history</h1>
            <p className="text-sm text-slate-500">
              Continue where you left off
            </p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium dark:border-slate-700 dark:bg-slate-800">
          <Trash2 className="h-4 w-4" /> Clear
        </button>
      </div>

      {videos.length === 0 ? (
        <EmptyState
          title="No watch history"
          description="Your recently watched videos will appear here."
        />
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <div
              key={video._id}
              className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row"
            >
              <img
                src={video.thumbnail || "https://images.unsplash.com/..."}
                alt={video.title}
                className="h-28 w-full rounded-2xl object-cover sm:w-44"
              />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{video.title}</h2>
                  <p className="text-sm text-slate-500">
                    {typeof video.owner === "object"
                      ? video.owner.username
                      : "creator"}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>{video.views ?? 0} views</span>
                  <span>•</span>
                  <span>watched recently</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
