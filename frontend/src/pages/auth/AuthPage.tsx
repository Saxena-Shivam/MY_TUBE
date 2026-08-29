import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Film,
  LockKeyhole,
  Play,
  Sparkles,
  Upload,
  UserPlus,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../api/axios";

export function AuthPage({
  initialMode = "signIn",
}: {
  initialMode?: "signIn" | "signUp";
}) {
  const [mode, setMode] = useState<"signIn" | "signUp">(initialMode);
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (mode === "signUp" && form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (mode === "signUp" && !avatar) {
      toast.error("Please choose an avatar");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signIn") {
        await login({
          email: form.email || undefined,
          username: form.email || undefined,
          password: form.password,
        });
        if (remember) localStorage.setItem("mytube-remember", "true");
        toast.success("Welcome back");
      } else {
        await register({
          fullName: form.fullName,
          username: form.username,
          email: form.email,
          password: form.password,
          avatar: avatar ?? undefined,
          coverImage: coverImage ?? undefined,
        });
        toast.success("Account created");
      }
      navigate("/");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          mode === "signIn" ? "Could not sign in" : "Could not create account",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const field = (
    name: keyof typeof form,
    label: string,
    type = "text",
    placeholder = label,
  ) => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <input
        required={name !== "confirmPassword"}
        type={type}
        value={form[name]}
        onChange={(event) =>
          setForm((current) => ({ ...current, [name]: event.target.value }))
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
      />
    </label>
  );

  return (
    <main className="grid min-h-screen bg-slate-100 p-3 text-slate-950 sm:p-6 lg:grid-cols-2 lg:gap-6 lg:p-8 dark:bg-slate-950 dark:text-white">
      <section className="mx-auto flex w-full max-w-xl flex-col justify-center py-6 lg:py-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20">
            <Film className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
              MYTUBE
            </p>
            <p className="text-sm text-slate-500">Your video community</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => setMode("signIn")}
              className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold transition ${mode === "signIn" ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signUp")}
              className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold transition ${mode === "signUp" ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
            >
              Sign Up
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === "signIn" ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "signIn" ? 12 : -12 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mb-6">
                <h1 className="text-2xl font-black sm:text-3xl">
                  {mode === "signIn" ? "Welcome back" : "Create your account"}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {mode === "signIn"
                    ? "Pick up where you left off."
                    : "Join creators and viewers on MYTUBE."}
                </p>
              </div>
              <form onSubmit={submit} className="space-y-4">
                {mode === "signUp" && (
                  <>
                    {field("fullName", "Full name", "text", "Your full name")}
                    {field("username", "Username", "text", "your_username")}
                  </>
                )}
                {field(
                  "email",
                  mode === "signIn" ? "Email or username" : "Email",
                  mode === "signIn" ? "text" : "email",
                  mode === "signIn"
                    ? "you@example.com or username"
                    : "you@example.com",
                )}
                {field("password", "Password", "password", "Your password")}
                {mode === "signUp" && (
                  <>
                    {field(
                      "confirmPassword",
                      "Confirm password",
                      "password",
                      "Repeat your password",
                    )}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                        <Upload className="h-4 w-4" />
                        <span className="min-w-0 flex-1 truncate">
                          {avatar?.name || "Avatar (required)"}
                        </span>
                        <input
                          required
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(event) =>
                            setAvatar(event.target.files?.[0] || null)
                          }
                        />
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                        <Upload className="h-4 w-4" />
                        <span className="min-w-0 flex-1 truncate">
                          {coverImage?.name || "Cover (optional)"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(event) =>
                            setCoverImage(event.target.files?.[0] || null)
                          }
                        />
                      </label>
                    </div>
                  </>
                )}
                {mode === "signIn" && (
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(event) => setRemember(event.target.checked)}
                      />{" "}
                      Remember me
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        toast.info("Password recovery is not available yet")
                      }
                      className="font-semibold text-red-600 hover:text-red-500"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LockKeyhole className="h-4 w-4" />
                  {loading
                    ? "Please wait..."
                    : mode === "signIn"
                      ? "Sign In"
                      : "Sign Up"}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
      <section className="relative hidden overflow-hidden rounded-[2rem] border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 p-8 text-white shadow-2xl lg:flex lg:flex-col lg:justify-between dark:border-red-900/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,113,113,0.18),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.12),transparent_40%)]" />
        <div className="relative">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.25em] text-red-300">
            <Sparkles className="h-4 w-4" /> MYTUBE
          </div>
          <h2 className="mt-10 max-w-lg text-5xl font-black leading-[1.05]">
            Watch. Create. Connect.
          </h2>
          <p className="mt-5 max-w-md text-lg leading-8 text-slate-300">
            A focused home for the videos, creators, and conversations you want
            to come back to.
          </p>
        </div>
        <div className="relative grid grid-cols-2 gap-3">
          <InfoCard icon={<Play />} label="Videos" value="Discover" />
          <InfoCard icon={<CheckCircle2 />} label="Likes" value="Your taste" />
          <InfoCard
            icon={<UserPlus />}
            label="Subscribers"
            value="Your people"
          />
          <InfoCard
            icon={<MessageCircle />}
            label="Posts"
            value="Stay connected"
          />
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, delay: label.length * 0.08 }}
      className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
    >
      <div className="mb-4 text-red-300">{icon}</div>
      <p className="text-sm font-bold">{label}</p>
      <p className="mt-1 text-xs text-slate-300">{value}</p>
    </motion.div>
  );
}
