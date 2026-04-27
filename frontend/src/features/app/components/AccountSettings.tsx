"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { UploadIcon } from "./AppIcons";
import { useAccountSettings } from "../hooks/useAccountSettings";

export function AccountSettings() {
  const {
    avatarPreview,
    changePassword,
    error,
    isPending,
    message,
    updateAvatar,
    user,
  } = useAccountSettings();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const changed = await changePassword({
      current_password: currentPassword,
      new_password: newPassword,
    });

    if (changed) {
      setCurrentPassword("");
      setNewPassword("");
    }
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      await updateAvatar(file);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-8 py-12">
      <header className="mb-12">
        <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500 block mb-2">Profile & Security</span>
        <h1 className="text-[32px] font-bold text-white mb-2 font-manrope">Settings</h1>
        <p className="text-neutral-400">{user?.email}</p>
      </header>

      <div className="space-y-12">
        {/* Avatar Section */}
        <section className="p-8 rounded-2xl bg-surface-container border border-white/5 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-xl">
            {avatarPreview ? (
              <img alt="Avatar Preview" className="w-full h-full object-cover" src={avatarPreview} />
            ) : (
              <span className="text-on-primary text-3xl font-bold">{user?.email.slice(0, 1).toUpperCase() ?? "U"}</span>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-white mb-2 font-manrope">Your Avatar</h2>
            <p className="text-neutral-500 text-sm mb-4">Recommended size: 256x256px. Max 2MB.</p>
            <label className="inline-flex items-center gap-2 px-6 py-2.5 bg-surface-container-high border border-white/10 rounded-lg font-bold text-sm text-white cursor-pointer hover:bg-white/5 transition-colors">
              <UploadIcon />
              <span>Upload Image</span>
              <input
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                type="file"
              />
            </label>
          </div>
        </section>

        {/* Password Section */}
        <section className="p-8 rounded-2xl bg-surface-container border border-white/5">
          <h2 className="text-xl font-bold text-white mb-6 font-manrope">Security</h2>
          <form className="space-y-6 max-w-md" onSubmit={handlePasswordSubmit}>
            <div className="space-y-2">
              <label className="text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500" htmlFor="current-password">
                Current Password
              </label>
              <input
                autoComplete="current-password"
                className="w-full bg-surface-container-low border border-white/10 rounded-xl p-4 text-on-surface placeholder-neutral-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                id="current-password"
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                type="password"
                value={currentPassword}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold tracking-[0.1em] uppercase text-neutral-500" htmlFor="new-password">
                New Password
              </label>
              <input
                autoComplete="new-password"
                className="w-full bg-surface-container-low border border-white/10 rounded-xl p-4 text-on-surface placeholder-neutral-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                id="new-password"
                minLength={8}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                type="password"
                value={newPassword}
              />
            </div>

            {message ? (
              <div className="p-4 bg-tertiary/10 border border-tertiary/20 rounded-xl text-tertiary text-sm font-medium" role="status">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium" role="alert">
                {error}
              </div>
            ) : null}

            <button 
              className="btn-primary px-8 py-3" 
              disabled={isPending} 
              type="submit"
            >
              {isPending ? "Updating..." : "Change Password"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
