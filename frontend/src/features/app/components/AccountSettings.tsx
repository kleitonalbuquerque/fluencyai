"use client";

import { ChangeEvent, FormEvent, useState } from "react";

import { AppHeader } from "./AppHeader";
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
    <main className="app-shell">
      <AppHeader user={user} />

      <section className="settings-layout">
        <div>
          <p className="eyebrow">Conta</p>
          <h1>Configurações</h1>
          <p className="settings-copy">{user?.email}</p>
        </div>

        <section className="settings-panel" aria-labelledby="avatar-title">
          <div className="settings-avatar">
            {avatarPreview ? (
              <img alt="" src={avatarPreview} />
            ) : (
              <span>{user?.email.slice(0, 1).toUpperCase() ?? "F"}</span>
            )}
          </div>
          <div>
            <h2 id="avatar-title">Avatar</h2>
            <label className="upload-button">
              <UploadIcon />
              <span>Enviar imagem</span>
              <input
                accept="image/*"
                aria-label="Imagem do avatar"
                onChange={handleAvatarChange}
                type="file"
              />
            </label>
          </div>
        </section>

        <form
          className="settings-panel settings-form"
          onSubmit={handlePasswordSubmit}
        >
          <h2>Alterar senha</h2>
          <div className="field">
            <label htmlFor="current-password">Senha atual</label>
            <input
              autoComplete="current-password"
              id="current-password"
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              type="password"
              value={currentPassword}
            />
          </div>
          <div className="field">
            <label htmlFor="new-password">Nova senha</label>
            <input
              autoComplete="new-password"
              id="new-password"
              minLength={8}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              type="password"
              value={newPassword}
            />
          </div>

          {message ? (
            <div className="login-success" role="status">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="login-error" role="alert">
              {error}
            </div>
          ) : null}

          <button className="login-submit" disabled={isPending} type="submit">
            Alterar senha
          </button>
        </form>
      </section>
    </main>
  );
}
