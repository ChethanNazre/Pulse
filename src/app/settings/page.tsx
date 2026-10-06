"use client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDarkMode, setDisplayName, setSidebarHidden, setSwipeActionsEnabled, toggleCategory } from "@/store/preferencesSlice";
import { CATEGORIES } from "@/types";
import { CheckIcon } from "@/components/icons";
import { useEffect, useState } from "react";
import { useAppSelector as useAuthSelector } from "@/store/hooks";
import { signInLocally, signOutLocally, updateProfileName } from "@/store/authSlice";
import { setLanguage } from "@/store/preferencesSlice";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { clearFeedback, restoreFeedback } from "@/store/feedbackSlice";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { categories, darkMode, displayName, sidebarHidden, swipeActionsEnabled } = useAppSelector((s) => s.preferences);
  const { language } = useAppSelector((s) => s.preferences);
  const { dismissed, lessLikeThis } = useAppSelector((s) => s.feedback);
  const profile = useAuthSelector((s) => s.auth.profile);
  const [name, setName] = useState(profile?.name ?? displayName);
  const [email, setEmail] = useState(profile?.email ?? "");
  const [profileUpdated, setProfileUpdated] = useState(false);
  const { t } = useTranslation();
  useEffect(() => { void i18n.changeLanguage(language); }, [language]);
  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setEmail(profile.email);
  }, [profile]);

  const updateProfile = () => {
    const nextName = name.trim();
    if (!profile || !nextName) return;
    dispatch(updateProfileName(nextName));
    dispatch(setDisplayName(nextName));
    setProfileUpdated(true);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">{t("settings")}</h1>

      <section className="panel p-5" aria-labelledby="cat-title">
        <h2 id="cat-title" className="text-xl font-semibold">{t("categories")}</h2>
        <p className="mb-4 text-sm text-muted">{t("categoriesHint")}</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("categories")}>
          {CATEGORIES.map((c) => {
            const on = categories.includes(c);
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => dispatch(toggleCategory(c))}
                className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-4 text-sm font-medium capitalize ${
                  on ? "border-accent text-accent" : "border-line text-muted hover:border-fg hover:text-fg"
                }`}
              >
                {on && <CheckIcon />}
                {c}
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel p-5" aria-labelledby="appearance-title">
        <h2 id="appearance-title" className="mb-3 text-xl font-semibold">{t("appearance")}</h2>
        <label className="flex min-h-11 cursor-pointer items-center justify-between">
          <span>{t("darkMode")}</span>
          <input type="checkbox" role="switch" checked={darkMode} onChange={(e) => dispatch(setDarkMode(e.target.checked))} className="h-5 w-5 accent-[rgb(var(--accent))]" />
        </label>
        <label className="flex min-h-11 cursor-pointer items-center justify-between border-t border-line">
          <span>{t("sidebarVisibility")}</span>
          <input type="checkbox" role="switch" checked={!sidebarHidden} onChange={(e) => dispatch(setSidebarHidden(!e.target.checked))} className="h-5 w-5 accent-[rgb(var(--accent))]" />
        </label>
      </section>

      <section id="feed-controls" className="panel p-5" aria-labelledby="feed-controls-title">
        <h2 id="feed-controls-title" className="mb-1 text-xl font-semibold">{t("feedControls")}</h2>
        <p className="mb-4 text-sm text-muted">{t("feedControlsHint")}</p>
        <label className="flex min-h-11 cursor-pointer items-center justify-between">
          <span>{t("swipeActions")}</span>
          <input type="checkbox" role="switch" checked={swipeActionsEnabled} onChange={(e) => dispatch(setSwipeActionsEnabled(e.target.checked))} className="h-5 w-5 accent-[rgb(var(--accent))]" />
        </label>
        <p className="mt-3 border-t border-line pt-4 text-sm text-muted">{t("swipeDirections")}</p>
        {(dismissed.length > 0 || lessLikeThis.length > 0) ? <div className="mt-5 space-y-5 border-t border-line pt-5">
          {([ ["dismissed", dismissed], ["lessLikeThis", lessLikeThis] ] as const).map(([key, list]) => list.length > 0 && <div key={key}>
            <h3 className="mb-2 text-sm font-semibold">{key === "dismissed" ? t("removedItems") : t("lessLikeThisItems")}</h3>
            <ul className="space-y-2">{list.map((item) => <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2">
              <span className="min-w-0 truncate text-sm">{item.title}</span>
              <button type="button" className="card-action-btn shrink-0" onClick={() => dispatch(restoreFeedback(item.id))}>{t("restore")}</button>
            </li>)}</ul>
          </div>)}
          <button type="button" className="btn btn-ghost" onClick={() => dispatch(clearFeedback())}>{t("resetFeedChoices")}</button>
        </div> : <p className="mt-5 border-t border-line pt-4 text-sm text-muted">{t("noFeedChoices")}</p>}
      </section>

      <section className="panel p-5" aria-labelledby="language-title">
        <h2 id="language-title" className="mb-3 text-xl font-semibold">{t("language")}</h2>
        <label htmlFor="language" className="sr-only">{t("language")}</label>
        <select id="language" value={language} onChange={(e) => { const next = e.target.value as "en" | "es"; dispatch(setLanguage(next)); }} className="min-h-11 rounded-md border border-line bg-surface px-3">
          <option value="en">English</option><option value="es">Español</option>
        </select>
      </section>

      <section id="profile" className="panel p-5 scroll-mt-24" aria-labelledby="profile-title">
        <h2 id="profile-title" className="mb-3 text-xl font-semibold">{t("profile")}</h2>
        {profile ? <div className="flex items-center justify-between gap-3"><div><p className="font-medium">{profile.name}</p><p className="text-sm text-muted">{profile.email}</p></div><button type="button" className="btn btn-ghost" onClick={() => dispatch(signOutLocally())}>{t("signOut")}</button></div> : <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); dispatch(signInLocally({ name: name.trim() || "Guest", email: email.trim() })); dispatch(setDisplayName(name.trim() || "Guest")); }}>
        <label htmlFor="auth-name" className="mb-1 block text-sm text-muted">{t("displayName")}</label>
        <input id="auth-name" required value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="off" className="min-h-11 w-full rounded-md border border-line bg-surface px-3 text-base" />
        <label htmlFor="auth-email" className="mb-1 block text-sm text-muted">{t("email")}</label>
        <input id="auth-email" required type="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" className="min-h-11 w-full rounded-md border border-line bg-surface px-3 text-base" />
        <button type="submit" className="btn btn-primary">{t("signIn")}</button>
        <p className="text-sm text-muted">{t("mockSignIn")}</p>
        </form>}
        <label htmlFor="display-name" className="mb-1 mt-5 block text-sm text-muted">{t("displayName")}</label>
        <input
          id="display-name"
          value={profile ? name : displayName}
          maxLength={40}
          autoComplete="nickname"
          onChange={(e) => { setProfileUpdated(false); if (profile) setName(e.target.value); else dispatch(setDisplayName(e.target.value)); }}
          className="min-h-11 w-full rounded-md border border-line bg-surface px-3 text-base hover:border-fg"
        />
        {profile && <div className="mt-3 flex flex-wrap items-center gap-3"><button type="button" className="btn btn-primary" onClick={updateProfile} disabled={!name.trim()}>{t("updateProfile")}</button>{profileUpdated && <p role="status" className="text-sm text-muted">{t("profileUpdated")}</p>}</div>}
        <p className="mt-2 text-sm text-muted">{t("savedLocally")}</p>
      </section>
    </div>
  );
}
