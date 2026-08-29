import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Bookmark,
  Heart,
  MessageSquare,
  Play,
  Trash2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { videoService } from "../../services/video.service";
import { commentService } from "../../services/comment.service";
import { watchHistoryService } from "../../services/watchHistory.service";
import { likeService } from "../../services/like.service";
import { subscriptionService } from "../../services/subscription.service";
import type { Comment, Video } from "../../types";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonBox } from "../../components/common/Loader";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { ShareMenu } from "../../components/common/ShareMenu";
import { SaveToPlaylistModal } from "../../components/playlist/SaveToPlaylistModal";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../api/axios";
import {
  avatarFallback,
  btnPrimary,
  btnSecondary,
  formatCount,
  formatDuration,
  getOwner,
  getOwnerId,
  getVideoDescription,
  getVideoUrl,
  inputClass,
  timeAgo,
} from "../../lib/utils";

export function WatchPage() {
  const { videoId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [reaction, setReaction] = useState<"like" | "unlike" | null>(null);
  const [unlikesCount, setUnlikesCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [playbackError, setPlaybackError] = useState(false);
  const [recommendations, setRecommendations] = useState<Video[]>([]);
  const likeLock = useRef(false);
  const subLock = useRef(false);
  const loadedVideoId = useRef<string | null>(null);
  const recordedViewId = useRef<string | null>(null);

  const owner = getOwner(video?.owner);
  const ownerId = getOwnerId(video?.owner);
  const isOwner = Boolean(user?._id && ownerId === user._id);

  useEffect(() => {
    if (!videoId) return;
    const loadKey = `${videoId}:${user?._id ?? "guest"}`;
    if (loadedVideoId.current === loadKey) return;
    loadedVideoId.current = loadKey;
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await videoService.getById(videoId);
        const next = response.data;
        setVideo(next);
        try {
          const related = await videoService.getAll({ limit: 8 });
          setRecommendations(
            (related.data.videos || []).filter(
              (item) => item._id !== videoId && Boolean(item?._id),
            ),
          );
        } catch {
          setRecommendations([]);
        }
        setReaction(next.reaction ?? (next.isLiked ? "like" : null));
        setLikesCount(next.likesCount ?? 0);
        setUnlikesCount(next.unlikesCount ?? 0);
        setSubscribed(
          Boolean(
            next.isSubscribed ||
            (typeof next.owner === "object" && next.owner?.isSubscribed),
          ),
        );
        setSubscribersCount(
          next.subscribersCount ??
            (typeof next.owner === "object"
              ? next.owner?.subscribersCount
              : 0) ??
            0,
        );
        const commentsData = await commentService.getByVideo(videoId);
        setComments(commentsData.data.comments || []);
        if (user?._id) await watchHistoryService.add(videoId);
      } catch {
        setVideo(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [videoId, user?._id]);

  useEffect(() => {
    if (!videoId || !video || recordedViewId.current === videoId) return;
    recordedViewId.current = videoId;
    void videoService
      .recordView(videoId)
      .then((response) => {
        setVideo((current) =>
          current ? { ...current, views: response.data.views } : current,
        );
      })
      .catch(() => undefined);
  }, [videoId, video]);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    navigate("/login");
    return false;
  };

  const handleAddComment = async () => {
    if (!videoId || !commentInput.trim() || !requireAuth()) return;
    setCommenting(true);
    try {
      const response = await commentService.create(
        videoId,
        commentInput.trim(),
        replyTo || undefined,
      );
      setComments((prev) => [response.data, ...prev]);
      setCommentInput("");
      setReplyTo(null);
      toast.success(replyTo ? "Reply posted" : "Comment posted");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not post comment"));
    } finally {
      setCommenting(false);
    }
  };

  const handleReaction = async (nextReaction: "like" | "unlike") => {
    if (!videoId || !requireAuth() || likeLock.current) return;
    likeLock.current = true;
    const next = reaction === nextReaction ? null : nextReaction;
    setReaction(next);
    if (reaction === "like") setLikesCount((count) => count - 1);
    if (reaction === "unlike") setUnlikesCount((count) => count - 1);
    if (next === "like") setLikesCount((count) => count + 1);
    if (next === "unlike") setUnlikesCount((count) => count + 1);
    try {
      const response = await likeService.toggleVideo(videoId, nextReaction);
      const data = response.data as {
        reaction?: "like" | "unlike" | null;
        likesCount?: number;
        unlikesCount?: number;
      };
      if (data?.reaction !== undefined) setReaction(data.reaction);
      if (typeof data?.likesCount === "number") setLikesCount(data.likesCount);
      if (typeof data?.unlikesCount === "number")
        setUnlikesCount(data.unlikesCount);
      toast.success(next ? `Video ${next}` : "Video reaction removed");
    } catch (error) {
      setReaction(reaction);
      if (reaction === "like") setLikesCount((count) => count + 1);
      if (reaction === "unlike") setUnlikesCount((count) => count + 1);
      if (next === "like") setLikesCount((count) => count - 1);
      if (next === "unlike") setUnlikesCount((count) => count - 1);
      toast.error(getApiErrorMessage(error, "Could not update like"));
    } finally {
      likeLock.current = false;
    }
  };

  const handleSubscribe = async () => {
    if (!requireAuth() || !ownerId || isOwner || subLock.current) return;
    subLock.current = true;
    const next = !subscribed;
    setSubscribed(next);
    setSubscribersCount((count) => count + (next ? 1 : -1));
    try {
      const response = await subscriptionService.toggle(ownerId);
      const data = response.data as {
        subscribed?: boolean;
        subscribersCount?: number;
      };
      if (typeof data?.subscribed === "boolean") setSubscribed(data.subscribed);
      if (typeof data?.subscribersCount === "number") {
        setSubscribersCount(data.subscribersCount);
      }
      toast.success(next ? "Subscribed" : "Unsubscribed");
    } catch (error) {
      setSubscribed(!next);
      setSubscribersCount((count) => count + (next ? -1 : 1));
      toast.error(getApiErrorMessage(error, "Could not update subscription"));
    } finally {
      subLock.current = false;
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

  const topLevel = comments.filter((comment) => !comment.parent);
  const repliesFor = (id: string) =>
    comments.filter((comment) => comment.parent === id);

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
              onError={() => setPlaybackError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-white/70">
              This older upload has no saved video file. Upload the video again
              to make it playable.
            </div>
          )}
          {playbackError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 p-6 text-center text-sm text-white">
              This video is unavailable or could not be played.
            </div>
          )}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white">
            <Play className="h-3.5 w-3.5 fill-current" />{" "}
            {formatDuration(video.duration)}
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {video.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span>{formatCount(video.views)} views</span>
              <span>•</span>
              <span>{timeAgo(video.createdAt)}</span>
              <span>•</span>
              <span>{formatDuration(video.duration)}</span>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void handleReaction("like")}
                className={
                  reaction === "like"
                    ? "inline-flex items-center justify-center gap-2 rounded-full border border-red-500 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-300"
                    : btnSecondary
                }
              >
                <Heart
                  className={`h-4 w-4 ${reaction === "like" ? "fill-current" : ""}`}
                />{" "}
                Like {likesCount}
              </button>
              <button
                type="button"
                onClick={() => void handleReaction("unlike")}
                className={
                  reaction === "unlike"
                    ? "inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-950 dark:border-slate-500 dark:bg-slate-700 dark:text-white"
                    : btnSecondary
                }
              >
                Unlike {unlikesCount}
              </button>
              <ShareMenu title={video.title} />
              <button
                type="button"
                onClick={() => {
                  if (!requireAuth()) return;
                  setSaveOpen(true);
                }}
                className={btnSecondary}
              >
                <Bookmark className="h-4 w-4" /> Save
              </button>
              {!isOwner && (
                <button
                  type="button"
                  onClick={() => void handleSubscribe()}
                  className={subscribed ? btnSecondary : btnPrimary}
                >
                  <UserPlus className="h-4 w-4" />
                  {subscribed ? "Subscribed" : "Subscribe"}
                </button>
              )}
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className={`${btnSecondary} text-red-600 dark:text-red-400`}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <Link to={owner?.username ? `/channel/${owner.username}` : "#"}>
                <img
                  src={owner?.avatar || avatarFallback(owner?.fullName)}
                  alt="channel"
                  className="h-12 w-12 rounded-full object-cover"
                />
              </Link>
              <div>
                <Link
                  to={owner?.username ? `/channel/${owner.username}` : "#"}
                  className="font-semibold text-slate-900 hover:underline dark:text-white"
                >
                  {owner?.fullName || owner?.username || "creator"}
                </Link>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {formatCount(subscribersCount)} subscribers
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {getVideoDescription(video) ||
                "No description provided for this video."}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Comments</h2>
              <span className="text-sm text-slate-500">
                {comments.length} total
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={replyTo ? "Add a reply..." : "Add a comment..."}
                className={inputClass}
              />
              <button
                onClick={() => void handleAddComment()}
                disabled={commenting || !commentInput.trim()}
                className="rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {commenting ? "Posting..." : replyTo ? "Reply" : "Post"}
              </button>
            </div>
            {replyTo && (
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="mt-2 text-xs font-medium text-slate-500"
              >
                Cancel reply
              </button>
            )}
            <div className="mt-5 space-y-3">
              {comments.length === 0 ? (
                <EmptyState
                  title="No comments yet"
                  description="Be the first to start the conversation."
                />
              ) : (
                topLevel.map((comment) => (
                  <div
                    key={comment._id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          comment.owner?.avatar ||
                          avatarFallback(comment.owner?.username)
                        }
                        alt="user"
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">
                          {comment.owner?.username || "user"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {timeAgo(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
                      {comment.content}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1"
                      >
                        <Heart className="h-3.5 w-3.5" />{" "}
                        {comment.likesCount ?? 0}
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyTo(comment._id)}
                        className="inline-flex items-center gap-1"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Reply
                      </button>
                    </div>
                    <div className="mt-3 space-y-2 pl-4">
                      {repliesFor(comment._id).map((reply) => (
                        <div
                          key={reply._id}
                          className="rounded-xl bg-white p-2 dark:bg-slate-900"
                        >
                          <p className="text-xs font-semibold">
                            {reply.owner?.username || "user"}
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-200">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        {recommendations.length > 0 && (
          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <h2 className="text-xl font-bold">Recommended videos</h2>
            {recommendations.map((item) => (
              <Link
                key={item._id}
                to={`/watch/${item._id}`}
                className="group flex gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <img
                  src={item.thumbnail || avatarFallback(item.title)}
                  alt={item.title}
                  className="h-20 w-32 shrink-0 rounded-xl object-cover transition group-hover:opacity-80"
                />
                <span className="min-w-0">
                  <span className="line-clamp-3 text-sm font-semibold">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {item.views ?? 0} views
                  </span>
                </span>
              </Link>
            ))}
          </aside>
        )}
      </div>

      <SaveToPlaylistModal
        video={video}
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
      />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this video?"
        description="This video will be permanently removed from MyTube."
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (!videoId) return;
          try {
            await videoService.delete(videoId);
            toast.success("Video deleted");
            setVideo(null);
            navigate("/");
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Could not delete video"));
          }
        }}
      />
    </div>
  );
}
