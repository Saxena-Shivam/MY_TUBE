import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { subscriptionService } from "../../services/subscription.service";
import type { User } from "../../types";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonBox } from "../../components/common/Loader";

export function SubscriptionsPage() {
  const [channels, setChannels] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await subscriptionService.getMySubscriptions();
        setChannels(response.data || []);
      } catch {
        setChannels([]);
      } finally {
        setLoading(false);
      }
    };
    void fetchSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonBox className="h-38 rounded-3xl" />
        <SkeletonBox className="h-38 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="rounded-xl bg-violet-500/10 p-2 text-violet-500">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-sm text-slate-500">Creators you follow</p>
        </div>
      </div>

      {channels.length === 0 ? (
        <EmptyState
          title="No subscriptions yet"
          description="Follow creators whose videos you love to keep them here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {channels.map((channel) => (
            <Link
              key={channel._id}
              to={`/channel/${channel.username}`}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <img
                  src={channel.avatar || "https://ui-avatars.com/api/?name=U"}
                  alt={channel.username}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">{channel.fullName}</h3>
                  <p className="text-sm text-slate-500">@{channel.username}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
