import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Library, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { playlistService } from "../../services/playlist.service";
import { useAuth } from "../../context/AuthContext";
import type { Playlist } from "../../types";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonBox } from "../../components/common/Loader";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { getApiErrorMessage } from "../../api/axios";
import { btnPrimary, inputClass } from "../../lib/utils";

export function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!user?._id) return;
      try {
        const response = await playlistService.getByUser(user._id);
        setPlaylists(response.data || []);
      } finally {
        setLoading(false);
      }
    };

    void fetchPlaylists();
  }, [user?._id]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const response = await playlistService.create({
        name: name.trim(),
        description: description.trim() || "No description",
      });
      setPlaylists((prev) => [response.data, ...prev]);
      setName("");
      setDescription("");
      toast.success("Playlist created");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create playlist"));
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonBox className="h-48 rounded-3xl" />
        <SkeletonBox className="h-48 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
            <Library className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold">Your playlists</h1>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1.2fr_auto]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Playlist name"
            className={inputClass}
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className={inputClass}
          />
          <button type="button" onClick={() => void handleCreate()} className={btnPrimary}>
            <Plus className="h-4 w-4" /> Create
          </button>
        </div>
      </div>

      {playlists.length === 0 ? (
        <EmptyState
          title="No playlists yet"
          description="Create a playlist to organize your favorite video collections."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <button
                type="button"
                onClick={() => navigate(`/playlist/${playlist._id}`)}
                className="h-40 w-full bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900"
              />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/playlist/${playlist._id}`)}
                    className="text-left"
                  >
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {playlist.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {playlist.description || "No description"}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(playlist._id)}
                    className="rounded-full p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                    aria-label="Delete playlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {Array.isArray(playlist.videos) ? playlist.videos.length : 0}{" "}
                  videos
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete playlist?"
        description="This playlist and its saved order will be removed."
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await playlistService.delete(deleteId);
            setPlaylists((prev) => prev.filter((item) => item._id !== deleteId));
            setDeleteId(null);
            toast.success("Playlist deleted");
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Could not delete playlist"));
          }
        }}
      />
    </div>
  );
}
