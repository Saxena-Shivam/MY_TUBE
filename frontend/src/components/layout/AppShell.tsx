import { useEffect, useRef, useState } from "react";
import type { ComponentType, FormEvent } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Film,
  Heart,
  History,
  Home,
  LayoutDashboard,
  Library,
  LogIn,
  Menu,
  MessageCircle,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  TrendingUp,
  Upload,
  UserRound,
  Users,
  Video,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { avatarFallback, cn } from "../../lib/utils";
import { ErrorBoundary } from "../common/ErrorBoundary";
import { TweetComposer } from "../tweet/TweetComposer";
import { NotificationBell } from "../common/NotificationBell";

const publicNav = [
  { label: "Home", path: "/", icon: Home },
  { label: "Trending", path: "/trending", icon: TrendingUp },
];

const authNav = [
  { label: "Subscriptions", path: "/subscriptions", icon: Users },
  { label: "History", path: "/history", icon: History },
  { label: "Liked", path: "/liked", icon: Heart },
  { label: "Playlists", path: "/playlists", icon: Library },
  { label: "Posts", path: "/tweets", icon: MessageCircle },
  { label: "Studio", path: "/dashboard", icon: LayoutDashboard },
  { label: "Settings", path: "/settings", icon: Settings },
];

export function AppShell() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [tweetOpen, setTweetOpen] = useState(false);
  const [search, setSearch] = useState("");
  const createRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setCreateOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!createRef.current?.contains(event.target as Node)) {
        setCreateOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const navItems = isAuthenticated ? [...publicNav, ...authNav] : publicNav;

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/?query=${encodeURIComponent(query)}` : "/");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => {
              if (window.innerWidth < 1024) setMobileOpen(true);
              else setCollapsed((prev) => !prev);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white">
              <Video className="h-4 w-4" />
            </div>
            <span className="text-lg font-black tracking-tight">MyTube</span>
          </Link>

          <form
            onSubmit={submitSearch}
            className="mx-auto hidden max-w-xl flex-1 items-center overflow-hidden rounded-full border border-slate-300 bg-slate-50 md:flex dark:border-slate-700 dark:bg-slate-900"
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search videos"
              className="w-full bg-transparent px-4 py-2 text-sm text-slate-900 outline-none dark:text-white"
            />
            <button
              type="submit"
              className="border-l border-slate-300 px-4 py-2 text-slate-600 dark:border-slate-700 dark:text-slate-200"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <NotificationBell />
                <div className="relative" ref={createRef}>
                  <button
                    type="button"
                    onClick={() => setCreateOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Create</span>
                  </button>
                  <AnimatePresence>
                    {createOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setCreateOpen(false);
                            navigate("/upload");
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Upload className="h-4 w-4" /> Upload video
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCreateOpen(false);
                            setTweetOpen(true);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <MessageCircle className="h-4 w-4" /> Create post
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCreateOpen(false);
                            navigate("/playlists");
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Film className="h-4 w-4" /> Create playlist
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Link
                  to={`/channel/${user?.username ?? ""}`}
                  className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <img
                    src={user?.avatar || avatarFallback(user?.fullName)}
                    alt={user?.username}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold text-sky-700 hover:bg-slate-100 dark:border-slate-700 dark:text-sky-300 dark:hover:bg-slate-800"
              >
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
            )}
          </div>
        </div>
        <form
          onSubmit={submitSearch}
          className="border-t border-slate-200 px-3 py-2 md:hidden dark:border-slate-800"
        >
          <div className="flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-900">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search videos"
              className="w-full bg-transparent px-2 py-2 text-sm outline-none"
            />
          </div>
        </form>
      </header>

      <div className="flex">
        <aside
          className={cn(
            "sticky top-[57px] hidden h-[calc(100vh-57px)] shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-2 lg:block dark:border-slate-800 dark:bg-slate-950",
            collapsed ? "w-[72px]" : "w-60",
          )}
        >
          <SidebarNav items={navItems} collapsed={collapsed} />
          {isAuthenticated && !collapsed && (
            <button
              type="button"
              onClick={() => void logout().then(() => navigate("/"))}
              className="mt-2 w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Sign out
            </button>
          )}
        </aside>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-50 bg-black/50 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "tween", duration: 0.2 }}
                className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white p-3 dark:bg-slate-950 lg:hidden"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-black">Menu</span>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <SidebarNav items={navItems} collapsed={false} />
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => void logout().then(() => navigate("/"))}
                    className="mt-3 w-full rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Sign out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <UserRound className="h-4 w-4" /> Sign in
                  </Link>
                )}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="min-w-0 flex-1 px-3 py-4 sm:px-6">
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname + location.search}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        </main>
      </div>

      <AnimatePresence>
        {tweetOpen && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setTweetOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-lg"
            >
              <TweetComposer
                onCreated={() => {
                  setTweetOpen(false);
                  navigate("/tweets");
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarNav({
  items,
  collapsed,
}: {
  items: Array<{
    label: string;
    path: string;
    icon: ComponentType<{ className?: string }>;
  }>;
  collapsed: boolean;
}) {
  return (
    <nav className="space-y-1">
      {items.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === "/"}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
              isActive
                ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
              collapsed && "justify-center px-2",
            )
          }
        >
          <Icon className="h-5 w-5 shrink-0" />
          {!collapsed && <span>{label}</span>}
        </NavLink>
      ))}
    </nav>
  );
}
