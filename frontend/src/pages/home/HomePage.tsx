import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Flame, Clock3, Eye, Sparkles, ArrowRight } from "lucide-react";
import { videoService } from "../../services/video.service";
import type { Video } from "../../types";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonBox } from "../../components/common/Loader";

export function HomePage() {
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const query = searchParams.get("query") ?? "";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await videoService.getAll({
          limit: 12,
          query: query || undefined,
        });
        setVideos(response.data.videos || []);
      } catch {
        setError("Unable to load videos right now.");
      } finally {
        setLoading(false);
      }
    };

    void fetchVideos();
  }, [query]);

  const featured = useMemo(() => videos.slice(0, 3), [videos]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-lg dark:border-slate-800">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-slate-100">
              <Sparkles className="h-3.5 w-3.5" /> Featured creator picks
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Fresh videos for curious minds.
            </h1>
            <p className="text-sm text-slate-200">
              Short-form stories, tutorials, and creator content from the MyTube
              community.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
                Start exploring
              </button>
              <button className="rounded-full border border-white/25 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                Browse trending
              </button>
            </div>
          </div>
          <div className="grid w-full max-w-md gap-3 sm:grid-cols-3">
            {["15k+", "1.2k", "4.7/5"].map((value, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-slate-300">
                  {["Views", "Creators", "Rating"][idx]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-bold">Trending now</h2>
          </div>
          <button className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            See all <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBox key={index} className="h-56 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((video, index) => (
              <motion.article
                key={video._id}
                onClick={() => navigate(`/watch/${video._id}`)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={video.thumbnail || "https://images.unsplash.com/..."}
                    alt={video.title}
                    className="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute bottom-3 right-3 rounded-lg bg-slate-950/80 px-2 py-1 text-[10px] font-medium text-white">
                    {video.duration ?? "4:20"}
                  </span>
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        (typeof video.owner === "object" &&
                          video.owner?.avatar) ||
                        "https://ui-avatars.com/api/?name=U"
                      }
                      alt="channel"
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <button
                      onClick={() =>
                        typeof video.owner === "object" &&
                        navigate(`/channel/${video.owner.username}`)
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      <h3 className="line-clamp-2 text-sm font-semibold">
                        {video.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {typeof video.owner === "object"
                          ? video.owner.username
                          : "creator"}
                      </p>
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> {video.views ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" /> 2 days ago
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Recommended</h2>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBox key={index} className="h-72 rounded-3xl" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <EmptyState
            title="No videos found"
            description={
              query
                ? "Try a different search term or browse recent uploads."
                : "This channel has no public videos yet."
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {videos.map((video, index) => (
              <motion.article
                key={video._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => navigate(`/watch/${video._id}`)}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={video.thumbnail || "https://images.unsplash.com/..."}
                    alt={video.title}
                    className="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/watch/${video._id}`);
                    }}
                    className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/70 text-white backdrop-blur-sm"
                  >
                    <Play className="ml-0.5 h-4 w-4 fill-current" />
                  </button>
                  <span className="absolute bottom-3 right-3 rounded-lg bg-slate-950/80 px-2 py-1 text-[10px] font-medium text-white">
                    {video.duration ?? "5:12"}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex gap-3">
                    <img
                      src={
                        (typeof video.owner === "object" &&
                          video.owner?.avatar) ||
                        "https://ui-avatars.com/api/?name=U"
                      }
                      alt="avatar"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-semibold">
                        {video.title}
                      </h3>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          if (typeof video.owner === "object")
                            navigate(`/channel/${video.owner.username}`);
                        }}
                        className="mt-1 text-left text-xs text-slate-500 hover:text-red-500 dark:text-slate-400"
                      >
                        {typeof video.owner === "object"
                          ? video.owner.username
                          : "creator"}
                      </button>
                      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" /> {video.views ?? 0}
                        </span>
                        <span>2 weeks ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
