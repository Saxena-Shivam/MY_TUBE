import { motion } from "framer-motion";

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 0.9,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-red-500 dark:border-slate-700"
      />
    </div>
  );
}

export function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`}
    />
  );
}
