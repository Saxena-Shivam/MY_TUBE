import { useEffect, useState } from "react";
import { Send, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { tweetService } from "../../services/tweet.service";
import type { Tweet } from "../../types";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonBox } from "../../components/common/Loader";

export function TweetsPage() {
  const { user } = useAuth();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!user?._id) return;
    const fetchTweets = async () => {
      try {
        const response = await tweetService.getByUser(user._id);
        setTweets(response.data || []);
      } catch {
        setTweets([]);
      } finally {
        setLoading(false);
      }
    };
    void fetchTweets();
  }, [user?._id]);

  const handleCreate = async () => {
    if (!content.trim()) return;
    try {
      const response = await tweetService.create(content.trim());
      setTweets((prev) => [response.data, ...prev]);
      setContent("");
    } catch {
      return;
    }
  };

  if (loading)
    return (
      <div className="space-y-4">
        <SkeletonBox className="h-24 rounded-3xl" />
        <SkeletonBox className="h-24 rounded-3xl" />
      </div>
    );

  return (
    <div className="space-y-6 pb-20">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">Tweets</h1>
        <div className="mt-4 flex gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Share your thoughts..."
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
          />
          <button
            onClick={() => void handleCreate()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-medium text-white dark:bg-slate-100 dark:text-slate-900"
          >
            <Send className="h-4 w-4" /> Post
          </button>
        </div>
      </div>

      {tweets.length === 0 ? (
        <EmptyState
          title="No tweets yet"
          description="Your social updates will appear here."
        />
      ) : (
        <div className="space-y-3">
          {tweets.map((tweet) => (
            <div
              key={tweet._id}
              className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={user?.avatar || "https://ui-avatars.com/api/?name=U"}
                    alt={user?.username}
                    className="h-9 w-9 rounded-full"
                  />
                  <span className="font-medium">{user?.fullName}</span>
                </div>
                <div className="flex gap-2 text-slate-500">
                  <button>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">
                {tweet.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
