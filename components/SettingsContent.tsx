"use client";

import { UserCircleGear } from "@phosphor-icons/react";

interface SettingsContentProps {
  user: any;
}

export default function SettingsContent({ user }: SettingsContentProps) {
  const displayName = user?.name || user?.display_name || user?.displayName || "No disponible";
  const email = user?.email || user?.primary_email || user?.primaryEmail || "No disponible";
  const provider = user?.provider || user?._provider || user?.oauth_providers?.[0]?.id || "No disponible";
  const registeredAt = user?.signed_up_at || user?.signedUpAt || "No disponible";
  const lastActive = user?.last_active_at || user?.lastActiveAt || "No disponible";
  const verified = user?.primary_email_verified || user?.primaryEmailVerified ? "Sí" : "No";
  const hasPassword = user?.has_password || user?.hasPassword ? "Sí" : "No";
  const avatarUrl = user?.profile_image_url || user?.profileImageUrl || null;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-base-300 bg-slate-950/95 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Settings</p>
            <h1 className="text-4xl font-semibold">Configuración</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Administra la configuración de tu cuenta y tus preferencias.</p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-[24px] border border-slate-700 bg-slate-900/90 px-4 py-3 text-slate-100">
            <UserCircleGear size={26} className="text-violet-400" />
            <div>
              <p className="font-semibold">Usuario autenticado</p>
              <p className="text-sm text-slate-400">Datos de tu cuenta</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[28px] border border-base-300 bg-slate-950/90 p-6 shadow-sm">
          <h2 className="text-xs uppercase tracking-[0.24em] text-slate-500">Account Settings</h2>
          <nav className="mt-6 space-y-2">
            {[
              { label: "My Profile", active: true },
              { label: "Emails & Auth" },
              { label: "Notifications" },
              { label: "Active Sessions" },
              { label: "Settings" },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-3xl border px-4 py-3 text-sm transition ${item.active ? "border-violet-500 bg-violet-500/10 text-violet-100" : "border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-900/80 hover:text-slate-100"}`}
              >
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        <section className="rounded-[28px] border border-base-300 bg-slate-950/95 p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">My Profile</p>
              <h2 className="mt-2 text-3xl font-semibold">User name</h2>
              <p className="mt-2 text-sm text-slate-500">This is a display name and is not used for authentication.</p>
            </div>
            <div className="flex items-center gap-4 rounded-[24px] border border-slate-700 bg-slate-900/95 px-4 py-3">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-800">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">?</div>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Profile image</p>
                <p className="font-semibold text-slate-100">{displayName}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 text-slate-100 sm:grid-cols-2">
            <div className="rounded-[24px] border border-slate-700 bg-slate-900/95 p-5">
              <p className="text-sm text-slate-400">User name</p>
              <p className="mt-2 text-lg font-semibold">{displayName}</p>
            </div>
            <div className="rounded-[24px] border border-slate-700 bg-slate-900/95 p-5">
              <p className="text-sm text-slate-400">Email</p>
              <p className="mt-2 text-lg font-semibold">{email}</p>
            </div>
            <div className="rounded-[24px] border border-slate-700 bg-slate-900/95 p-5">
              <p className="text-sm text-slate-400">Provider</p>
              <p className="mt-2 text-lg font-semibold">{provider}</p>
            </div>
            <div className="rounded-[24px] border border-slate-700 bg-slate-900/95 p-5">
              <p className="text-sm text-slate-400">User ID</p>
              <p className="mt-2 text-lg font-semibold">{user?.id ?? "No disponible"}</p>
            </div>
          </div>

          <div className="mt-8 rounded-[24px] border border-slate-700 bg-slate-900/95 p-5">
            <h3 className="text-base font-semibold text-slate-100">Account details</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-400">Registrado desde</p>
                <p className="mt-2 text-lg font-semibold">{registeredAt}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Última actividad</p>
                <p className="mt-2 text-lg font-semibold">{lastActive}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Verificado</p>
                <p className="mt-2 text-lg font-semibold">{verified}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Contraseña</p>
                <p className="mt-2 text-lg font-semibold">{hasPassword}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
