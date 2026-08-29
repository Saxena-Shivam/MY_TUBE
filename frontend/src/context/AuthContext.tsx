import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import api, { setStoredToken } from "../api/axios";
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
  changePassword: (payload: {
    oldPassword: string;
    newPassword: string;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function persistUser(user: User | null) {
  if (user) localStorage.setItem("mytube-user", JSON.stringify(user));
  else localStorage.removeItem("mytube-user");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.get<ApiResponse<User>>("/users/current-user");
      const nextUser = res.data.data;
      setUser(nextUser);
      persistUser(nextUser);
    } catch {
      setUser(null);
      persistUser(null);
      setStoredToken(null);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mytube-user");
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      persistUser(null);
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
    const { user: nextUser, accessToken } = response.data.data;
    setStoredToken(accessToken);
    setUser(nextUser);
    persistUser(nextUser);
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

    await api.post<ApiResponse<User>>("/users/register", formData);
    return login({
      email: payload.email,
      username: payload.username,
      password: payload.password,
    });
  };

  const logout = async () => {
    try {
      await api.post("/users/logout");
    } finally {
      setUser(null);
      persistUser(null);
      setStoredToken(null);
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
    persistUser(nextUser);
    return nextUser;
  };

  const updateImage = async (endpoint: string, field: string, file: File) => {
    const formData = new FormData();
    formData.append(field, file);
    const response = await api.patch<ApiResponse<User>>(endpoint, formData);
    const nextUser = response.data.data;
    setUser(nextUser);
    persistUser(nextUser);
    return nextUser;
  };

  const updateAvatar = (file: File) =>
    updateImage("/users/avatar", "avatar", file);
  const updateCoverImage = (file: File) =>
    updateImage("/users/cover-image", "coverImage", file);

  const changePassword = async (payload: {
    oldPassword: string;
    newPassword: string;
  }) => {
    await api.post("/users/change-password", payload);
  };

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
      changePassword,
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
