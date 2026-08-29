import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { tweetService } from "../../services/tweet.service";
import type { Tweet } from "../../types";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonBox } from "../../components/common/Loader";
import { TweetComposer } from "../../components/tweet/TweetComposer";
import { TweetCard } from "../../components/tweet/TweetCard";
import { getApiErrorMessage } from "../../api/axios";

export function TweetsPage() {
  const { user } = useAuth();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    const fetchTweets = async () => {
      try {
        const response = await tweetService.getByUser(user._id);
        setTweets(response.data || []);
      } catch (error) {
        setTweets([]);
        toast.error(getApiErrorMessage(error, "Could not load posts"));
      } finally {
        setLoading(false);
      }
    };
    void fetchTweets();
  }, [user?._id]);

  if (loading)
    return (
      <div className="space-y-4">
        <SkeletonBox className="h-24 rounded-3xl" />
        <SkeletonBox className="h-24 rounded-3xl" />
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold">Your posts</h1>
        <p className="text-sm text-slate-500">Share updates with your viewers.</p>
      </div>
      <TweetComposer
        onCreated={(tweet) => setTweets((prev) => [tweet, ...prev])}
      />
      {tweets.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Your social updates will appear here."
        />
      ) : (
        <div className="space-y-3">
          {tweets.map((tweet) => (
            <TweetCard
              key={tweet._id}
              tweet={tweet}
              onDeleted={(id) =>
                setTweets((prev) => prev.filter((item) => item._id !== id))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
