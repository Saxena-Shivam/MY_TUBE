import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import api from "../api/axios";
import type { ApiResponse, AuthResponse, User } from "../types";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: {
    email?: string;
    username?: string;
    password: string;
  }) => Promise<User>;
  register: (payload: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    avatar?: File;
    coverImage?: File;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateAccount: (payload: {
    fullName: string;
    email: string;
  }) => Promise<User>;
  updateAvatar: (file: File) => Promise<User>;
  updateCoverImage: (file: File) => Promise<User>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPersistedUser = () => {
    try {
      const raw = localStorage.getItem("mytube-user");
      if (raw) {
        setUser(JSON.parse(raw) as User);
      }
    } catch {
      localStorage.removeItem("mytube-user");
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get<ApiResponse<User>>("/users/current-user");
      const nextUser = res.data.data;
      setUser(nextUser);
      localStorage.setItem("mytube-user", JSON.stringify(nextUser));
    } catch {
      setUser(null);
      localStorage.removeItem("mytube-user");
    }
  };

  useEffect(() => {
    loadPersistedUser();
    const persistedUser = localStorage.getItem("mytube-user");
    if (!persistedUser) {
      setLoading(false);
      return;
    }
    void refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (payload: {
    email?: string;
    username?: string;
    password: string;
  }) => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/users/login",
      payload,
    );
    const nextUser = response.data.data.user;
    setUser(nextUser);
    localStorage.setItem("mytube-user", JSON.stringify(nextUser));
    return nextUser;
  };

  const register = async (payload: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    avatar?: File;
    coverImage?: File;
  }) => {
    const formData = new FormData();
    formData.append("fullName", payload.fullName);
    formData.append("email", payload.email);
    formData.append("username", payload.username);
    formData.append("password", payload.password);
    if (payload.avatar) formData.append("avatar", payload.avatar);
    if (payload.coverImage) formData.append("coverImage", payload.coverImage);

    const response = await api.post<ApiResponse<User>>(
      "/users/register",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    const nextUser = response.data.data;
    setUser(nextUser);
    localStorage.setItem("mytube-user", JSON.stringify(nextUser));
    return nextUser;
  };

  const logout = async () => {
    try {
      await api.post("/users/logout");
    } finally {
      setUser(null);
      localStorage.removeItem("mytube-user");
    }
  };

  const updateAccount = async (payload: {
    fullName: string;
    email: string;
  }) => {
    const response = await api.patch<ApiResponse<User>>(
      "/users/update-account",
      payload,
    );
    const nextUser = response.data.data;
    setUser(nextUser);
    localStorage.setItem("mytube-user", JSON.stringify(nextUser));
    return nextUser;
  };

  const updateImage = async (endpoint: string, field: string, file: File) => {
    const formData = new FormData();
    formData.append(field, file);
    const response = await api.patch<ApiResponse<User>>(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const nextUser = response.data.data;
    setUser(nextUser);
    localStorage.setItem("mytube-user", JSON.stringify(nextUser));
    return nextUser;
  };

  const updateAvatar = (file: File) =>
    updateImage("/users/avatar", "avatar", file);
  const updateCoverImage = (file: File) =>
    updateImage("/users/cover-image", "coverImage", file);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      register,
      logout,
      refreshUser,
      updateAccount,
      updateAvatar,
      updateCoverImage,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
