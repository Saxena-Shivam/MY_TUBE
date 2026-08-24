import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Heart,
  History,
  Home,
  Library,
  Menu,
  PlaySquare,
  PlusCircle,
  Settings,
  Sparkles,
  TrendingUp,
  Upload,
  UserRound,
  Video,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PageLoader } from "./components/common/Loader";
import { HomePage } from "./pages/home/HomePage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { TrendingPage } from "./pages/home/TrendingPage";
import { WatchPage } from "./pages/video/WatchPage";
import { UploadPage } from "./pages/video/UploadPage";
import { ChannelPage } from "./pages/channel/ChannelPage";
import { SubscriptionsPage } from "./pages/channel/SubscriptionsPage";
import { HistoryPage } from "./pages/history/HistoryPage";
import { LikedPage } from "./pages/history/LikedPage";
import { PlaylistsPage } from "./pages/playlist/PlaylistsPage";
import { PlaylistDetailPage } from "./pages/playlist/PlaylistDetailPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { TweetsPage } from "./pages/channel/TweetsPage";

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Trending", path: "/trending", icon: TrendingUp },
  { label: "Subscriptions", path: "/subscriptions", icon: PlaySquare },
  { label: "History", path: "/history", icon: History },
  { label: "Liked", path: "/liked", icon: Heart },
  { label: "Playlists", path: "/playlists", icon: Library },
  { label: "Dashboard", path: "/dashboard", icon: Sparkles },
  { label: "Tweets", path: "/tweets", icon: Bell },
  { label: "Settings", path: "/settings", icon: Settings },
];

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}

function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return <Outlet />;
}

function PublicAccess() {
  return <Outlet />;
}

function PublicLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <AppLayout />;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-white">
            <Video className="h-5 w-5" />
          </div>
          <span className="text-lg font-black">MyTube</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => (window.location.href = "/login")}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700"
            >
              Log in
            </button>
            <button
              onClick={() => (window.location.href = "/register")}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
            >
              Join MyTube
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

function SearchBar({
  onSearch,
  compact = false,
}: {
  onSearch: (value: string) => void;
  compact?: boolean;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(value);
      }}
      className={
        compact
          ? "flex w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          : "flex w-full max-w-2xl items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900"
      }
    >
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search videos, creators..."
        className="w-full border-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none dark:text-slate-100"
      />
      <button
        type="submit"
        className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
      >
        Search
      </button>
    </form>
  );
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentNav = useMemo(
    () =>
      navItems.find(
        (item) =>
          item.path === location.pathname ||
          (location.pathname.startsWith("/watch/") && item.path === "/"),
      ),
    [location.pathname],
  );

  const handleSearch = (value: string) => {
    const query = value.trim();
    if (!query) return;
    navigate(`/?query=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/75 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-sm">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">MyTube</p>
            </div>
          </div>

          <div className="hidden flex-1 justify-center md:flex">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => navigate("/upload")}
              className="hidden items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 sm:inline-flex"
            >
              <PlusCircle className="h-4 w-4" /> Create
            </button>
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <Bell className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate(`/channel/${user?.username ?? ""}`)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 text-left dark:border-slate-700 dark:bg-slate-900"
            >
              <img
                src={user?.avatar || "https://ui-avatars.com/api/?name=User"}
                alt="avatar"
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="hidden text-sm font-medium lg:inline">
                {user?.fullName || "User"}
              </span>
            </button>
            <button
              onClick={() => void logout().then(() => navigate("/login"))}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200 px-4 py-2 md:hidden dark:border-slate-800">
          <SearchBar onSearch={handleSearch} compact />
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-5 sm:px-6">
        {sidebarOpen && (
          <div className="fixed inset-x-4 top-20 z-20 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl lg:hidden dark:border-slate-800 dark:bg-slate-900">
            <nav className="grid grid-cols-2 gap-2">
              {navItems.map(({ label, path, icon: Icon }) => (
                <button
                  key={path}
                  onClick={() => {
                    navigate(path);
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </nav>
          </div>
        )}
        <aside
          className={`transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"} hidden shrink-0 lg:block`}
        >
          <nav className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="space-y-1">
              {navItems.map(({ label, path, icon: Icon }) => {
                const active =
                  location.pathname === path ||
                  (path === "/" && location.pathname.startsWith("/watch/"));
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                      active
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {sidebarOpen && <span>{label}</span>}
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileBottomNav currentPath={location.pathname} />
      <div className="pointer-events-none fixed bottom-20 right-4 z-40 md:hidden">
        <button
          onClick={() => navigate("/upload")}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg"
        >
          <Upload className="h-5 w-5" />
        </button>
      </div>
      <footer className="pb-20 text-center text-xs text-slate-500 md:pb-6">
        {currentNav ? `Current view: ${currentNav.label}` : "Home"}
      </footer>
    </div>
  );
}

function MobileBottomNav({ currentPath }: { currentPath: string }) {
  const navigate = useNavigate();
  const items = [
    { label: "Home", path: "/", icon: Home },
    { label: "Trending", path: "/trending", icon: TrendingUp },
    { label: "Subs", path: "/subscriptions", icon: PlaySquare },
    { label: "Liked", path: "/liked", icon: Heart },
    { label: "Profile", path: "/settings", icon: UserRound },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 p-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 md:hidden">
      <div className="grid grid-cols-5 gap-2">
        {items.map(({ label, path, icon: Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] ${
              currentPath === path
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicAccess />}>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/watch/:videoId" element={<WatchPage />} />
            <Route path="/channel/:username" element={<ChannelPage />} />
          </Route>
        </Route>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/trending" element={<TrendingPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/liked" element={<LikedPage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route
              path="/playlist/:playlistId"
              element={<PlaylistDetailPage />}
            />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/tweets" element={<TweetsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
