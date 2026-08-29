import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { notificationService } from "../../services/notification.service";
import type { Notification } from "../../types";
import { timeAgo } from "../../lib/utils";

export function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const response = await notificationService.get();
      setItems(response.data.notifications || []);
      setUnread(response.data.unread || 0);
    } catch {
      // Notifications are secondary to the main application flow.
    }
  };

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const markAll = async () => {
    try {
      await notificationService.markAllRead();
      setItems((current) => current.map((item) => ({ ...item, read: true })));
      setUnread(0);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update notifications",
      );
    }
  };

  const clear = async () => {
    try {
      await notificationService.clear();
      setItems([]);
      setUnread(0);
      toast.success("Notifications cleared");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not clear notifications",
      );
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 min-w-4 rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between px-2 py-1">
            <h2 className="font-semibold">Notifications</h2>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => void markAll()}
                className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Mark all as read"
              >
                <CheckCheck className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => void clear()}
                className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Clear notifications"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-slate-500">
                No notifications yet
              </p>
            ) : (
              items.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => {
                    if (!item.read) {
                      void notificationService.markRead(item._id);
                      setUnread((current) => Math.max(0, current - 1));
                      setItems((current) =>
                        current.map((entry) =>
                          entry._id === item._id
                            ? { ...entry, read: true }
                            : entry,
                        ),
                      );
                    }
                  }}
                  className={`flex w-full gap-2 rounded-xl p-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${item.read ? "" : "bg-red-50 dark:bg-red-950/20"}`}
                >
                  <span className="min-w-0 flex-1">
                    <strong>
                      {item.actor?.fullName ||
                        item.actor?.username ||
                        "Someone"}
                    </strong>{" "}
                    {item.message}
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {timeAgo(item.createdAt)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
