import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Mail, MessageCircle, Send, Share2 } from "lucide-react";
import { toast } from "sonner";
import { btnSecondary } from "../../lib/utils";

const platforms = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    href: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    href: (url: string, title: string) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  },
  {
    id: "x",
    label: "X / Twitter",
    icon: Share2,
    href: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: Share2,
    href: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: Share2,
    href: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: Send,
    href: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: "reddit",
    label: "Reddit",
    icon: Share2,
    href: (url: string, title: string) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
];

export function ShareMenu({
  url,
  title,
  label = "Share",
}: {
  url?: string;
  title: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const shareUrl = useMemo(
    () => url || (typeof window !== "undefined" ? window.location.href : ""),
    [url],
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
      setOpen(false);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl, text: title });
        toast.success("Link shared");
        setOpen(false);
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }
    setOpen((prev) => !prev);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void nativeShare()}
        className={btnSecondary}
      >
        <Share2 className="h-4 w-4" /> {label}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
          >
            <button
              type="button"
              onClick={() => void copyLink()}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <Copy className="h-4 w-4" /> Copy Link
            </button>
            {platforms.map(({ id, label: name, icon: Icon, href }) => (
              <a
                key={id}
                href={href(shareUrl, title)}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  toast.success(`Opening ${name}`);
                  setOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <Icon className="h-4 w-4" /> {name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
