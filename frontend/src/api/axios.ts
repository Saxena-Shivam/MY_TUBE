import axios from "axios";
import { toast } from "sonner";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem("mytube-user");
      const path = window.location.pathname;
      const isPublicPath =
        path === "/" ||
        path.startsWith("/watch/") ||
        path.startsWith("/channel/") ||
        path === "/login" ||
        path === "/register";
      if (!isPublicPath) {
        toast.error("Your session has expired. Please log in again.");
        window.location.href = "/login";
      }
    } else {
      toast.error(
        getApiErrorMessage(error, "Request failed. Please try again."),
      );
    }
    return Promise.reject(error);
  },
);

export default api;
