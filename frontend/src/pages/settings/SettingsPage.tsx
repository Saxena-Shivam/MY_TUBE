import { useEffect, useState } from "react";
import { UserCircle2, Camera, Lock, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function SettingsPage() {
  const { user, updateAccount, updateAvatar, updateCoverImage } = useAuth();
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  useEffect(() => {
    setFullName(user?.fullName ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateAccount({ fullName, email });
      if (avatar) await updateAvatar(avatar);
      if (coverImage) await updateCoverImage(coverImage);
      setAvatar(null);
      setCoverImage(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-sky-500/10 p-2 text-sky-500">
            <UserCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Profile settings</h1>
            <p className="text-sm text-slate-500">
              Keep your public profile up to date
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Full name</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">
            <Camera className="h-4 w-4" /> Update avatar
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
            />
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">
            <Camera className="h-4 w-4" /> Update cover
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) =>
                setCoverImage(event.target.files?.[0] ?? null)
              }
            />
          </label>
        </div>

        <button
          onClick={() => void saveProfile()}
          disabled={saving}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-medium text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
        >
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold">Security</h2>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Use the backend password change route to update credentials safely.
        </p>
      </div>
    </div>
  );
}
