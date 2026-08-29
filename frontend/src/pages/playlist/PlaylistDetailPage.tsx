import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ListVideo, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { playlistService } from "../../services/playlist.service";
import type { Playlist as PlaylistType, Video } from "../../types";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonBox } from "../../components/common/Loader";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../api/axios";
import {
  btnPrimary,
  btnSecondary,
  formatDuration,
  getOwner,
  getOwnerId,
} from "../../lib/utils";

export function PlaylistDetailPage() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState<PlaylistType | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmPlaylist, setConfirmPlaylist] = useState(false);
  const [removeVideoId, setRemoveVideoId] = useState<string | null>(null);

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
    ? (playlist.videos.filter(
        (item): item is Video => typeof item === "object" && Boolean(item?._id),
      ) as Video[])
    : [];
  const isOwner = getOwnerId(playlist.owner) === user?._id;

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
          <button
            type="button"
            onClick={() => videos[0] && navigate(`/watch/${videos[0]._id}`)}
            className={btnPrimary}
          >
            <Play className="h-4 w-4" /> Play all
          </button>
          {isOwner && (
            <button
              type="button"
              onClick={() => setConfirmPlaylist(true)}
              className={`${btnSecondary} text-red-600 dark:text-red-400`}
            >
              <Trash2 className="h-4 w-4" /> Delete playlist
            </button>
          )}
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
                  src={
                    video.thumbnail ||
                    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400"
                  }
                  alt={video.title}
                  className="h-28 w-full rounded-2xl object-cover sm:w-44"
                />
              </button>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{video.title}</h2>
                  <p className="text-sm text-slate-500">
                    {getOwner(video.owner)?.username || "creator"}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>{video.views ?? 0} views</span>
                  <span>•</span>
                  <span>{formatDuration(video.duration)}</span>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => setRemoveVideoId(video._id)}
                      className="font-semibold text-red-600 dark:text-red-400"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmPlaylist}
        title="Delete this playlist?"
        description="The playlist will be removed. Videos themselves will not be deleted."
        onClose={() => setConfirmPlaylist(false)}
        onConfirm={async () => {
          if (!playlistId) return;
          try {
            await playlistService.delete(playlistId);
            toast.success("Playlist deleted");
            navigate("/playlists");
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Could not delete playlist"));
          }
        }}
      />
      <ConfirmDialog
        open={Boolean(removeVideoId)}
        title="Remove video from playlist?"
        description="This only removes the video from this playlist."
        confirmLabel="Remove"
        onClose={() => setRemoveVideoId(null)}
        onConfirm={async () => {
          if (!playlistId || !removeVideoId) return;
          try {
            await playlistService.removeVideo(playlistId, removeVideoId);
            setPlaylist((prev) =>
              prev
                ? {
                    ...prev,
                    videos: (prev.videos as Array<Video | string>).filter(
                      (item) =>
                        typeof item === "string"
                          ? item !== removeVideoId
                          : Boolean(item?._id && item._id !== removeVideoId),
                    ),
                  }
                : prev,
            );
            setRemoveVideoId(null);
            toast.success("Video removed from playlist");
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Could not remove video"));
          }
        }}
      />
    </div>
  );
}
