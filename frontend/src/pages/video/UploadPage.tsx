import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  UploadCloud,
  Video as VideoIcon,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { videoService } from "../../services/video.service";
import { playlistService } from "../../services/playlist.service";
import { useAuth } from "../../context/AuthContext";
import type { Playlist } from "../../types";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../api/axios";

export function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user?._id) {
      void playlistService
        .getByUser(user._id)
        .then((response) => setPlaylists(response.data || []));
    }
  }, [user?._id]);

  const handleUpload = async () => {
    if (!videoFile || !thumbnail || !title.trim()) {
      setStatus("error");
      setError("Title, video, and thumbnail are required.");
      return;
    }

    setStatus("uploading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("tags", tags);
      formData.append("videoFile", videoFile);
      formData.append("thumbnail", thumbnail);
      selectedPlaylists.forEach((playlistId) =>
        formData.append("playlistIds", playlistId),
      );
      await videoService.upload(formData);
      setStatus("success");
      setTitle("");
      setDescription("");
      setTags("");
      setVideoFile(null);
      setThumbnail(null);
      setSelectedPlaylists([]);
      toast.success("Video published");
    } catch (err) {
      setStatus("error");
      setError(getApiErrorMessage(err, "Upload failed"));
      toast.error(getApiErrorMessage(err, "Upload failed"));
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-20">
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">Upload a video</h1>
        <p className="mt-2 text-sm text-slate-500">
          Share your next story with the community.
        </p>
      </div>

      <motion.div
        layout
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800"
                placeholder="Your title"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Tags{" "}
                <span className="text-slate-500">
                  (optional, comma separated)
                </span>
              </span>
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800"
                placeholder="travel, tutorial, music"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Description
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800"
                placeholder="Tell viewers what this video is about"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800">
                <VideoIcon className="mb-2 h-6 w-6 text-slate-500" />
                <span className="text-sm font-medium">Video file</span>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                />
                {videoFile && (
                  <span className="mt-2 text-xs text-emerald-600">
                    {videoFile.name}
                  </span>
                )}
              </label>

              <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800">
                <ImageIcon className="mb-2 h-6 w-6 text-slate-500" />
                <span className="text-sm font-medium">Thumbnail</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
                />
                {thumbnail && (
                  <span className="mt-2 text-xs text-emerald-600">
                    {thumbnail.name}
                  </span>
                )}
              </label>
            </div>
            {playlists.length > 0 && (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">
                  Add to playlists
                </legend>
                {playlists.map((playlist) => (
                  <label
                    key={playlist._id}
                    className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlaylists.includes(playlist._id)}
                      onChange={(event) =>
                        setSelectedPlaylists((current) =>
                          event.target.checked
                            ? [...current, playlist._id]
                            : current.filter((id) => id !== playlist._id),
                        )
                      }
                    />
                    {playlist.name}
                  </label>
                ))}
              </fieldset>
            )}
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <UploadCloud className="h-4 w-4" /> Upload summary
            </div>
            <div className="overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-700">
              <div className="h-2.5 w-1/3 rounded-full bg-gradient-to-r from-red-500 to-orange-500" />
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>• Video uploads require a valid file and thumbnail.</p>
              <p>
                • The backend uses multipart/form-data and Cloudinary-backed
                media handling.
              </p>
              <p>
                • Title and description are saved alongside your uploaded media.
              </p>
            </div>

            {status === "success" && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> Video uploaded
                successfully.
              </div>
            )}

            {status === "error" && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
                {error}
              </div>
            )}

            <button
              onClick={() => void handleUpload()}
              disabled={status === "uploading"}
              className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "uploading" ? "Uploading..." : "Publish video"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
