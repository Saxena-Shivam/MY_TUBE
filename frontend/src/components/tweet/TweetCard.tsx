import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Comment, Tweet } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { likeService } from "../../services/like.service";
import { tweetService } from "../../services/tweet.service";
import { commentService } from "../../services/comment.service";
import { getApiErrorMessage } from "../../api/axios";
import {
  avatarFallback,
  btnSecondary,
  getOwner,
  getOwnerId,
  inputClass,
  timeAgo,
} from "../../lib/utils";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { ShareMenu } from "../common/ShareMenu";

export function TweetCard({
  tweet,
  onDeleted,
  onUpdated,
}: {
  tweet: Tweet;
  onDeleted?: (id: string) => void;
  onUpdated?: (tweet: Tweet) => void;
}) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const owner = getOwner(tweet.owner);
  const ownerId = getOwnerId(tweet.owner);
  const isOwner = Boolean(user?._id && ownerId === user._id);
  const likeLock = useRef(false);
  const [liked, setLiked] = useState(Boolean(tweet.isLiked));
  const [likesCount, setLikesCount] = useState(tweet.likesCount ?? 0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(tweet.commentsCount ?? 0);

  useEffect(() => {
    setLiked(Boolean(tweet.isLiked));
    setLikesCount(tweet.likesCount ?? 0);
    setCommentsCount(tweet.commentsCount ?? 0);
  }, [tweet.isLiked, tweet.likesCount, tweet.commentsCount]);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    navigate("/login");
    return false;
  };

  const toggleLike = async () => {
    if (!requireAuth() || likeLock.current) return;
    likeLock.current = true;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((count) => count + (nextLiked ? 1 : -1));
    try {
      const response = await likeService.toggleTweet(tweet._id);
      const data = response.data as { liked?: boolean; likesCount?: number };
      if (typeof data?.liked === "boolean") setLiked(data.liked);
      if (typeof data?.likesCount === "number") setLikesCount(data.likesCount);
      toast.success(nextLiked ? "Post liked" : "Post unliked");
      onUpdated?.({
        ...tweet,
        isLiked: data?.liked ?? nextLiked,
        likesCount: data?.likesCount ?? likesCount + (nextLiked ? 1 : -1),
      });
    } catch (error) {
      setLiked(!nextLiked);
      setLikesCount((count) => count + (nextLiked ? -1 : 1));
      toast.error(getApiErrorMessage(error, "Could not update like"));
    } finally {
      likeLock.current = false;
    }
  };

  const loadComments = async () => {
    try {
      const response = await commentService.getByTweet(tweet._id);
      setComments(response.data.comments || []);
      setCommentsCount(
        response.data.total ?? response.data.comments?.length ?? 0,
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not load comments"));
    }
  };

  const toggleComments = async () => {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next) await loadComments();
  };

  const submitComment = async () => {
    if (!requireAuth() || !commentInput.trim()) return;
    try {
      const response = await commentService.createOnTweet(
        tweet._id,
        commentInput.trim(),
        replyTo || undefined,
      );
      setComments((prev) => [response.data, ...prev]);
      setCommentsCount((count) => count + 1);
      setCommentInput("");
      setReplyTo(null);
      toast.success(replyTo ? "Reply posted" : "Comment posted");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not post comment"));
    }
  };

  const topLevel = comments.filter((comment) => !comment.parent);
  const repliesFor = (id: string) =>
    comments.filter((comment) => comment.parent === id);

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="flex items-start gap-3">
        <Link to={owner?.username ? `/channel/${owner.username}` : "#"}>
          <img
            src={owner?.avatar || avatarFallback(owner?.fullName)}
            alt={owner?.username || "user"}
            className="h-11 w-11 rounded-full object-cover"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={owner?.username ? `/channel/${owner.username}` : "#"}
              className="font-semibold text-slate-900 hover:underline dark:text-white"
            >
              {owner?.fullName || owner?.username || "Creator"}
            </Link>
            <span className="text-sm text-slate-500">@{owner?.username}</span>
            <span className="text-xs text-slate-500">
              {timeAgo(tweet.createdAt)}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800 dark:text-slate-100">
            {tweet.content}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void toggleLike()}
              className={`${btnSecondary} ${liked ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300" : ""}`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              {liked ? "Unlike" : "Like"} {likesCount}
            </button>
            <button
              type="button"
              onClick={() => void toggleComments()}
              className={btnSecondary}
            >
              <MessageSquare className="h-4 w-4" /> {commentsCount}
            </button>
            <ShareMenu
              title={tweet.content.slice(0, 80)}
              url={`${window.location.origin}/?post=${tweet._id}`}
            />
            {isOwner && (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className={`${btnSecondary} text-red-600 dark:text-red-400`}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {commentsOpen && (
        <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={commentInput}
              onChange={(event) => setCommentInput(event.target.value)}
              placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => void submitComment()}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500"
            >
              {replyTo ? "Reply" : "Comment"}
            </button>
          </div>
          {replyTo && (
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              Cancel reply
            </button>
          )}
          {topLevel.map((comment) => (
            <div
              key={comment._id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {comment.owner?.username || "user"}
              </p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                {comment.content}
              </p>
              <button
                type="button"
                onClick={() => setReplyTo(comment._id)}
                className="mt-2 text-xs font-semibold text-slate-600 hover:text-red-500 dark:text-slate-300"
              >
                Reply
              </button>
              <div className="mt-2 space-y-2 pl-4">
                {repliesFor(comment._id).map((reply) => (
                  <div
                    key={reply._id}
                    className="rounded-xl bg-white p-2 text-sm dark:bg-slate-900"
                  >
                    <span className="font-semibold">
                      {reply.owner?.username || "user"}
                    </span>
                    <p className="text-slate-700 dark:text-slate-200">
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete post?"
        description="This post will be permanently removed."
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          try {
            await tweetService.delete(tweet._id);
            toast.success("Post deleted");
            setConfirmOpen(false);
            onDeleted?.(tweet._id);
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Could not delete post"));
          }
        }}
      />
    </article>
  );
}
