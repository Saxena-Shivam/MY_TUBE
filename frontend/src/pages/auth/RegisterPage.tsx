import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, UploadCloud, CheckCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register({
        ...form,
        avatar: avatar ?? undefined,
        coverImage: coverImage ?? undefined,
      });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              New creator
            </p>
            <h1 className="text-2xl font-bold">Create your account</h1>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                Full name
              </span>
              <input
                value={form.fullName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, fullName: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800"
                placeholder="Jane Doe"
              />
            </label>
            <label className="block">
              <span className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                Email
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800"
                placeholder="email@example.com"
              />
            </label>
            <label className="block">
              <span className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                Username
              </span>
              <input
                value={form.username}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, username: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800"
                placeholder="mytube_user"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                Password
              </span>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800"
                placeholder="Create a strong password"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <UploadCloud className="h-4 w-4" /> Avatar
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
                className="text-sm text-slate-500"
              />
            </label>
            <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <UploadCloud className="h-4 w-4" /> Cover
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
                className="text-sm text-slate-500"
              />
            </label>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900"
          >
            <CheckCheck className="h-4 w-4" />{" "}
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-slate-900 dark:text-slate-100"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
