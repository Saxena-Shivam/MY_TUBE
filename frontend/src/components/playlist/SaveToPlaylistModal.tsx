import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { playlistService } from "../../services/playlist.service";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../api/axios";
import type { Playlist, Video } from "../../types";

export function SaveToPlaylistModal({
  video,
  open,
  onClose,
}: {
  video: Video | null;
  open: boolean;
  onClose: () => void;
}) {
  const { user, isAuthenticated } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open || !user?._id || !isAuthenticated) return;
    const load = async () => {
      setLoading(true);
      try {
        const response = await playlistService.getByUser(user._id);
        setPlaylists(response.data || []);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not load playlists"));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [open, user?._id, isAuthenticated]);

  const videoInPlaylist = (playlist: Playlist) =>
    (playlist.videos || []).some((item) =>
      typeof item === "string" ? item === video?._id : item._id === video?._id,
    );

  const toggleVideo = async (playlist: Playlist) => {
    if (!video) return;
    const exists = videoInPlaylist(playlist);
    try {
      if (exists) {
        await playlistService.removeVideo(playlist._id, video._id);
        toast.success("Removed from playlist");
      } else {
        await playlistService.addVideo(playlist._id, video._id);
        toast.success("Saved to playlist");
      }
      setPlaylists((prev) =>
        prev.map((item) => {
          if (item._id !== playlist._id) return item;
          const videos = exists
            ? (item.videos as Array<Video | string>).filter((v) =>
                typeof v === "string" ? v !== video._id : v._id !== video._id,
              )
            : [...(item.videos || []), video._id];
          return { ...item, videos: videos as string[] };
        }),
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update playlist"));
    }
  };

  const createPlaylist = async () => {
    if (!name.trim() || !video) return;
    setCreating(true);
    try {
      const created = await playlistService.create({
        name: name.trim(),
        description: "Created from Save to playlist",
      });
      await playlistService.addVideo(created.data._id, video._id);
      setPlaylists((prev) => [
        { ...created.data, videos: [video._id] },
        ...prev,
      ]);
      setName("");
      toast.success("Playlist created");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create playlist"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <AnimatePresence>
      {open && video && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-4 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-white"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">Save to playlist</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {loading ? (
                <p className="text-sm text-slate-500">Loading playlists...</p>
              ) : playlists.length === 0 ? (
                <p className="text-sm text-slate-500">
                  You don’t have any playlists yet.
                </p>
              ) : (
                playlists.map((playlist) => {
                  const saved = videoInPlaylist(playlist);
                  return (
                    <button
                      type="button"
                      key={playlist._id}
                      onClick={() => void toggleVideo(playlist)}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <span>
                        <span className="block text-sm font-semibold">
                          {playlist.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {(playlist.videos || []).length} videos
                        </span>
                      </span>
                      {saved ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Plus className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="New playlist name"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() => void createPlaylist()}
                disabled={creating || !name.trim()}
                className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {creating ? "..." : "Create"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
