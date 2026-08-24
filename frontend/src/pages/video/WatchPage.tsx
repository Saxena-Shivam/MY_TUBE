import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Play,
  ThumbsUp,
  UserPlus,
} from "lucide-react";
import { videoService } from "../../services/video.service";
import { commentService } from "../../services/comment.service";
import { watchHistoryService } from "../../services/watchHistory.service";
import { playlistService } from "../../services/playlist.service";
import type { Playlist } from "../../types";
import type { Comment, Video } from "../../types";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonBox } from "../../components/common/Loader";
import { useAuth } from "../../context/AuthContext";
import { subscriptionService } from "../../services/subscription.service";

function getVideoUrl(video: Video) {
  const candidate = video.videofile || video.videoFile || video.videoUrl;
  return typeof candidate === "string" && candidate.trim() ? candidate : null;
}

export function WatchPage() {
  const { videoId } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const loadedVideoId = useRef<string | null>(null);

  useEffect(() => {
    if (!videoId || loadedVideoId.current === videoId) return;
    loadedVideoId.current = videoId;
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await videoService.getById(videoId);
        setVideo(response.data);
        if (user?._id) {
          const commentsData = await commentService.getByVideo(videoId);
          setComments(commentsData.data.comments || []);
          await watchHistoryService.add(videoId);
        }
      } catch {
        // handled by UI state or silent fail
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [videoId, user?._id]);

  const handleAddComment = async () => {
    if (!videoId || !commentInput.trim()) return;
    setCommenting(true);
    try {
      const response = await commentService.create(
        videoId,
        commentInput.trim(),
      );
      setComments((prev) => [response.data, ...prev]);
      setCommentInput("");
    } finally {
      setCommenting(false);
    }
  };

  const openPlaylists = async () => {
    if (showPlaylists) return setShowPlaylists(false);
    if (!user?._id) return;
    const response = await playlistService.getByUser(user._id);
    setPlaylists(response.data || []);
    setShowPlaylists(true);
  };

  const handleSubscribe = async () => {
    if (!user) return (window.location.href = "/login");
    const ownerId =
      typeof video?.owner === "object" ? video.owner._id : video?.owner;
    if (!ownerId) return;
    setSubscribing(true);
    try {
      await subscriptionService.toggle(ownerId);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <SkeletonBox className="h-[420px] rounded-3xl" />
        <SkeletonBox className="h-24 rounded-3xl" />
      </div>
    );
  }

  if (!video) {
    return (
      <EmptyState
        title="Video not found"
        description="This video may be unavailable or deleted."
      />
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative aspect-video w-full bg-slate-950">
          {getVideoUrl(video) ? (
            <video
              className="h-full w-full bg-black object-contain"
              controls
              preload="metadata"
              src={getVideoUrl(video) ?? undefined}
              poster={video.thumbnail || undefined}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-white/70">
              This older upload has no saved video file. Upload the video again
              to make it playable.
            </div>
          )}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs text-white">
            <Play className="h-3.5 w-3.5 fill-current" /> Live style controls
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span>{video.views ?? 0} views</span>
              <span>•</span>
              <span>2 days ago</span>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 font-medium text-white dark:bg-slate-100 dark:text-slate-900">
                <ThumbsUp className="h-4 w-4" /> Like
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
                <Share2 className="h-4 w-4" /> Share
              </button>
              <button
                onClick={() => void openPlaylists()}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800"
              >
                <Bookmark className="h-4 w-4" /> Save
              </button>
              {showPlaylists && (
                <div className="basis-full rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Save to playlist
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {playlists.map((playlist) => (
                      <button
                        key={playlist._id}
                        onClick={() =>
                          void playlistService.addVideo(playlist._id, video._id)
                        }
                        className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-white dark:border-slate-600 dark:hover:bg-slate-700"
                      >
                        {playlist.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => void handleSubscribe()}
                disabled={subscribing}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800"
              >
                <UserPlus className="h-4 w-4" />{" "}
                {subscribing ? "Saving..." : "Subscribe"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <img
                src={
                  (typeof video.owner === "object" && video.owner?.avatar) ||
                  "https://ui-avatars.com/api/?name=U"
                }
                alt="channel"
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">
                  {typeof video.owner === "object"
                    ? video.owner.username
                    : "creator"}
                </p>
                <p className="text-sm text-slate-500">
                  {video.views ?? 0} subscribers
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {video.description || "No description provided for this video."}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Comments</h2>
              <span className="text-sm text-slate-500">
                {comments.length} total
              </span>
            </div>
            <div className="mt-4 flex gap-3">
              <input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800"
              />
              <button
                onClick={() => void handleAddComment()}
                disabled={commenting || !commentInput.trim()}
                className="rounded-xl bg-slate-900 px-4 py-2.5 font-medium text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
              >
                {commenting ? "Posting..." : "Post"}
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {comments.length === 0 ? (
                <EmptyState
                  title="No comments yet"
                  description="Be the first to start the conversation."
                />
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          comment.owner?.avatar ||
                          "https://ui-avatars.com/api/?name=U"
                        }
                        alt="user"
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">
                          {comment.owner?.username || "user"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {comment.createdAt
                            ? new Date(comment.createdAt).toLocaleDateString()
                            : "just now"}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
                      {comment.content}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <button className="inline-flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" /> Like
                      </button>
                      <button className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" /> Reply
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-3 text-lg font-bold">Recommended</h3>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="h-20 w-28 rounded-xl bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1">
                    <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
