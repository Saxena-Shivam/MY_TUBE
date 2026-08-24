import { useEffect, useState } from "react";
import { BarChart3, PlayCircle, Users, ThumbsUp } from "lucide-react";
import { dashboardService } from "../../services/dashboard.service";
import type { ChannelStats, Video } from "../../types";
import { SkeletonBox } from "../../components/common/Loader";

export function DashboardPage() {
  const [stats, setStats] = useState<ChannelStats | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const statsResponse = await dashboardService.getStats();
        const videosResponse = await dashboardService.getVideos();
        setStats(statsResponse.data);
        setVideos(videosResponse.data || []);
      } catch {
        setStats(null);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonBox className="h-24 rounded-3xl" />
        <SkeletonBox className="h-56 rounded-3xl" />
      </div>
    );
  }

  const cards = [
    { label: "Videos", value: stats?.totalVideos ?? 0, icon: PlayCircle },
    { label: "Views", value: stats?.totalViews ?? 0, icon: BarChart3 },
    { label: "Subscribers", value: stats?.totalSubscribers ?? 0, icon: Users },
    { label: "Likes", value: stats?.totalLikes ?? 0, icon: ThumbsUp },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-slate-500">Creator performance snapshot</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{label}</p>
              <div className="rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-xl font-bold">Recent uploads</h2>
        <div className="space-y-3">
          {videos.slice(0, 5).map((video) => (
            <div
              key={video._id}
              className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800"
            >
              <img
                src={video.thumbnail || "https://images.unsplash.com/..."}
                alt={video.title}
                className="h-16 w-24 rounded-xl object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{video.title}</p>
                <p className="text-xs text-slate-500">
                  {video.views ?? 0} views
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
