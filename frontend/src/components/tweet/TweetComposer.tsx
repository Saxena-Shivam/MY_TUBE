import { useState } from "react";
import { toast } from "sonner";
import { tweetService } from "../../services/tweet.service";
import { getApiErrorMessage } from "../../api/axios";
import type { Tweet } from "../../types";

export function TweetComposer({
  onCreated,
  compact = false,
}: {
  onCreated?: (tweet: Tweet) => void;
  compact?: boolean;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const max = 280;

  const submit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const response = await tweetService.create(content.trim());
      setContent("");
      toast.success("Posted");
      onCreated?.(response.data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not post"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={
        compact
          ? "rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
          : "rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
      }
    >
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value.slice(0, max))}
        rows={compact ? 3 : 4}
        placeholder="Share an update..."
        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {content.length}/{max}
        </span>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={loading || !content.trim()}
          className="rounded-full bg-red-600 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
