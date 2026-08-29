import axios from "axios";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

const TOKEN_KEY = "mytube-token";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token?: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const original = error.config;
    if (status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        const refresh = await axios.post(
          `${api.defaults.baseURL}/users/refresh-token`,
          {},
          { withCredentials: true },
        );
        const accessToken = refresh.data?.data?.accessToken as string | undefined;
        if (accessToken) {
          setStoredToken(accessToken);
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original);
        }
      } catch {
        localStorage.removeItem("mytube-user");
        setStoredToken(null);
        const path = window.location.pathname;
        const isPublicPath =
          path === "/" ||
          path === "/trending" ||
          path.startsWith("/watch/") ||
          path.startsWith("/channel/") ||
          path.startsWith("/playlist/") ||
          path === "/login" ||
          path === "/register";
        if (!isPublicPath) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
