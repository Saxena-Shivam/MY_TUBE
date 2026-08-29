import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PageLoader } from "./components/common/Loader";
import { AppShell } from "./components/layout/AppShell";
import { HomePage } from "./pages/home/HomePage";
import { AuthPage } from "./pages/auth/AuthPage";
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

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<AuthPage />} />
            <Route
              path="/register"
              element={<AuthPage initialMode="signUp" />}
            />
          </Route>

          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/trending" element={<TrendingPage />} />
            <Route path="/watch/:videoId" element={<WatchPage />} />
            <Route path="/channel/:username" element={<ChannelPage />} />
            <Route
              path="/playlist/:playlistId"
              element={<PlaylistDetailPage />}
            />

            <Route element={<ProtectedRoute />}>
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/liked" element={<LikedPage />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/tweets" element={<TweetsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
