import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { likeService } from "../../services/like.service";
import type { Video } from "../../types";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonBox } from "../../components/common/Loader";

export function LikedPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLiked = async () => {
      try {
        const response = await likeService.getLikedVideos();
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

    void fetchLiked();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonBox className="h-52 rounded-3xl" />
        <SkeletonBox className="h-52 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="rounded-xl bg-rose-500/10 p-2 text-rose-500">
          <Heart className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Liked videos</h1>
          <p className="text-sm text-slate-500">Your saved favorites</p>
        </div>
      </div>

      {videos.length === 0 ? (
        <EmptyState
          title="No liked videos yet"
          description="The videos you like will show up here."
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
                  src={video.thumbnail || "https://images.unsplash.com/..."}
                  alt={video.title}
                  className="h-52 w-full object-cover"
                />
              </button>
              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-semibold">
                  {video.title}
                </h3>
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
