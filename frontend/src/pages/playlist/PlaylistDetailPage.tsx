import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ListVideo, Trash2, Play } from "lucide-react";
import { playlistService } from "../../services/playlist.service";
import type { Playlist as PlaylistType, Video } from "../../types";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonBox } from "../../components/common/Loader";
import { useNavigate } from "react-router-dom";

export function PlaylistDetailPage() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<PlaylistType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playlistId) return;
    const fetchPlaylist = async () => {
      try {
        const response = await playlistService.getById(playlistId);
        setPlaylist(response.data || null);
      } finally {
        setLoading(false);
      }
    };
    void fetchPlaylist();
  }, [playlistId]);

  if (loading)
    return (
      <div className="space-y-4">
        <SkeletonBox className="h-32 rounded-3xl" />
        <SkeletonBox className="h-40 rounded-3xl" />
      </div>
    );
  if (!playlist)
    return (
      <EmptyState
        title="Playlist not found"
        description="This playlist may have been removed or is private."
      />
    );

  const videos = Array.isArray(playlist.videos)
    ? (playlist.videos.filter(Boolean) as Video[])
    : [];

  return (
    <div className="space-y-6 pb-20">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500">
            <ListVideo className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{playlist.name}</h1>
            <p className="text-sm text-slate-500">
              {playlist.description || "A curated playlist"}
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900">
            <Play className="h-4 w-4" /> Play all
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium dark:border-slate-700 dark:bg-slate-800">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      {videos.length === 0 ? (
        <EmptyState
          title="No videos in this playlist"
          description="Add videos from the watch page to build your queue."
        />
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <div
              key={video._id}
              className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row"
            >
              <button
                onClick={() => navigate(`/watch/${video._id}`)}
                className="contents"
              >
                <img
                  src={video.thumbnail || "https://images.unsplash.com/..."}
                  alt={video.title}
                  className="h-28 w-full rounded-2xl object-cover sm:w-44"
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
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>{video.views ?? 0} views</span>
                  <span>•</span>
                  <button className="font-medium text-red-500">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
