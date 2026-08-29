import { useNavigate } from "react-router-dom";
import { Bookmark, Trash2 } from "lucide-react";
import type { Video } from "../../types";
import {
  avatarFallback,
  formatCount,
  formatDuration,
  getOwner,
  timeAgo,
} from "../../lib/utils";

export function VideoCard({
  video,
  onSave,
  onDelete,
}: {
  video: Video;
  onSave?: (video: Video) => void;
  onDelete?: (video: Video) => void;
}) {
  const navigate = useNavigate();
  const owner = getOwner(video.owner);

  return (
    <article
      className="group cursor-pointer"
      onClick={() => navigate(`/watch/${video._id}`)}
    >
      <div className="relative overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
        <img
          src={video.thumbnail || avatarFallback(video.title)}
          alt={video.title}
          className="aspect-video w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold text-white">
          {formatDuration(video.duration)}
        </span>
        {onSave && (
          <button
            type="button"
            title="Save to playlist"
            onClick={(event) => {
              event.stopPropagation();
              onSave(video);
            }}
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white text-slate-900 shadow-lg hover:bg-slate-100 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
          >
            <Bookmark className="h-4 w-4" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            title="Delete video"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(video);
            }}
            className="absolute bottom-2 left-2 flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-white text-red-600 shadow-lg hover:bg-red-50 dark:border-red-900 dark:bg-slate-950 dark:text-red-300 dark:hover:bg-red-950/50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (owner?.username) navigate(`/channel/${owner.username}`);
          }}
        >
          <img
            src={owner?.avatar || avatarFallback(owner?.fullName)}
            alt={owner?.username || "channel"}
            className="h-9 w-9 rounded-full object-cover"
          />
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
            {video.title}
          </h3>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (owner?.username) navigate(`/channel/${owner.username}`);
            }}
            className="mt-1 text-left text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            {owner?.fullName || owner?.username || "Creator"}
          </button>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {formatCount(video.views)} views • {formatCount(video.likesCount)}{" "}
            likes • {formatCount(video.unlikesCount)} unlikes •{" "}
            {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </article>
  );
}
