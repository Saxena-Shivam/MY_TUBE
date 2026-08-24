import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Library, Plus } from "lucide-react";
import { playlistService } from "../../services/playlist.service";
import { useAuth } from "../../context/AuthContext";
import type { Playlist } from "../../types";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonBox } from "../../components/common/Loader";

export function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
    const response = await playlistService.create({
      name: name.trim(),
      description: description.trim() || "No description",
    });
    setPlaylists((prev) => [response.data, ...prev]);
    setName("");
    setDescription("");
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
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800"
          />
          <button
            onClick={() => void handleCreate()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-medium text-white dark:bg-slate-100 dark:text-slate-900"
          >
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
            <button
              key={playlist._id}
              onClick={() => navigate(`/playlist/${playlist._id}`)}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="h-40 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900" />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{playlist.name}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {playlist.description || "No description"}
                </p>
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {Array.isArray(playlist.videos) ? playlist.videos.length : 0}{" "}
                  videos
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
