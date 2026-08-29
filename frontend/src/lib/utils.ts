import type { User, Video } from "../types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function getOwner(owner?: User | string | null): User | null {
  if (!owner || typeof owner === "string") return null;
  return owner;
}

export function getOwnerId(owner?: User | string | null): string | null {
  if (!owner) return null;
  return typeof owner === "string" ? owner : owner._id;
}

export function getVideoUrl(video?: Video | null) {
  if (!video) return null;
  const candidate = video.videofile || video.videoFile || video.videoUrl;
  return typeof candidate === "string" && candidate.trim() ? candidate : null;
}

export function getVideoDescription(video?: Video | null) {
  return video?.description || video?.discription || "";
}

export function formatCount(value?: number) {
  const n = Number(value || 0);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatDuration(seconds?: number) {
  if (seconds == null || Number.isNaN(Number(seconds))) return "0.00";
  const value = Number(seconds);
  return (value > 10000 ? value / 1000 : value).toFixed(2);
}

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700";

export const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-red-500/20 placeholder:text-slate-500 focus:border-red-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400";

export function timeAgo(date?: string) {
  if (!date) return "just now";
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export const avatarFallback = (name = "User") =>
  `https://ui-avatars.com/api/?background=ef4444&color=fff&name=${encodeURIComponent(name)}`;
