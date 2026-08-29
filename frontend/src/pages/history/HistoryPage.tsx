import { useEffect, useState } from "react";
import { History, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { watchHistoryService } from "../../services/watchHistory.service";
import type { Video } from "../../types";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonBox } from "../../components/common/Loader";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { getApiErrorMessage } from "../../api/axios";
import { VideoCard } from "../../components/video/VideoCard";

export function HistoryPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await watchHistoryService.get();
        setVideos(
          (response.data || []).filter((video): video is Video =>
            Boolean(video?._id),
          ),
        );
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
        <button
          type="button"
          onClick={() => setConfirmClear(true)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >
          <Trash2 className="h-4 w-4" /> Clear
        </button>
      </div>

      {videos.length === 0 ? (
        <EmptyState
          title="No watch history"
          description="Your recently watched videos will appear here."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <div key={video._id} className="relative">
              <VideoCard video={video} />
              <button
                type="button"
                onClick={() =>
                  void watchHistoryService
                    .remove(video._id)
                    .then(() => {
                      setVideos((prev) =>
                        prev.filter((item) => item._id !== video._id),
                      );
                      toast.success("Removed from history");
                    })
                    .catch((error) =>
                      toast.error(
                        getApiErrorMessage(
                          error,
                          "Could not remove from history",
                        ),
                      ),
                    )
                }
                className="absolute right-2 top-2 z-10 rounded-full border border-white/30 bg-white p-2 text-slate-600 shadow-lg hover:bg-red-50 hover:text-red-600 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label="Remove from history"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={confirmClear}
        title="Clear watch history?"
        description="All watched videos will be removed from your history."
        onClose={() => setConfirmClear(false)}
        onConfirm={async () => {
          try {
            await watchHistoryService.clear();
            setVideos([]);
            setConfirmClear(false);
            toast.success("Watch history cleared");
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Could not clear history"));
          }
        }}
      />
    </div>
  );
}
