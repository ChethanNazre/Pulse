"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setQuery } from "@/store/feedSlice";
import { setDarkMode, setSidebarHidden } from "@/store/preferencesSlice";
import { useDebounce } from "@/hooks/useDebounce";
import { GearIcon, MoonIcon, SearchIcon, SidebarIcon, SunIcon, UserIcon } from "./icons";
import Logo from "./Logo";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { SITE_NAME } from "@/lib/site";
import { signOutLocally } from "@/store/authSlice";

export const SEARCH_DEBOUNCE_MS = 400;

export default function Header({ chromeHidden = false, onReveal }: { chromeHidden?: boolean; onReveal?: () => void }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { darkMode, displayName, sidebarHidden, language } = useAppSelector((s) => s.preferences);
  const profile = useAppSelector((s) => s.auth.profile);
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [topicIndex, setTopicIndex] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [todayText, setTodayText] = useState("");
  const [todayIso, setTodayIso] = useState("");
  const debounced = useDebounce(text, SEARCH_DEBOUNCE_MS);
  const first = useRef(true);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const searchTopics = [t("topicClimate"), t("topicTechnology"), t("topicCinema"), t("topicHealth")];
  const desktopSidebarToggle = (
    <button
      type="button"
      className="icon-btn hidden md:inline-flex"
      aria-pressed={!sidebarHidden}
      aria-label={sidebarHidden ? t("showSidebar") : t("hideSidebar")}
      title={sidebarHidden ? t("showSidebar") : t("hideSidebar")}
      onClick={() => dispatch(setSidebarHidden(!sidebarHidden))}
    >
      <SidebarIcon />
    </button>
  );

  // Rotate example queries only while the search is empty and idle. The
  // placeholder is a hint, never a value that can be submitted accidentally.
  useEffect(() => {
    if (text || searchFocused) return;
    const timer = window.setInterval(() => setTopicIndex((index) => (index + 1) % searchTopics.length), 3600);
    return () => window.clearInterval(timer);
  }, [text, searchFocused, searchTopics.length]);

  useEffect(() => {
    const now = new Date();
    setTodayText(new Intl.DateTimeFormat(language, { weekday: "long", month: "short", day: "numeric" }).format(now));
    setTodayIso(new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10));
  }, [language]);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) setAccountMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountMenuOpen]);

  // Only the debounced value reaches Redux, so typing doesn't trigger a request per keystroke.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    dispatch(setQuery(debounced));
    if (debounced.trim() && pathname !== "/") router.push("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <header onFocusCapture={onReveal} className={`sticky top-0 z-20 border-b border-line bg-bg transition-transform duration-200 ease-out motion-reduce:transition-none ${chromeHidden ? "-translate-y-full md:translate-y-0" : "translate-y-0"}`}>
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 lg:gap-5 lg:px-8">
        <div className="flex shrink-0 items-center gap-3">
          {desktopSidebarToggle}
          <Link href="/" aria-label={`${SITE_NAME} home`} className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-brand text-2xl leading-none sm:text-3xl">{SITE_NAME}</span>
          </Link>
        </div>
        <form role="search" className="relative min-w-0 flex-1" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="search" className="sr-only">{t("searchLabel")}</label>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="search"
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`${t("searchTopicPrefix")} “${searchTopics[topicIndex]}”`}
            autoComplete="off"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="min-h-11 min-w-0 w-full rounded-md border border-line bg-surface py-2 pl-10 pr-3 text-base placeholder:text-muted hover:border-fg"
          />
        </form>
        {todayText && <time dateTime={todayIso} aria-label={t("today")} className="hidden shrink-0 text-xs font-medium text-muted lg:block">{t("today")}, {todayText}</time>}
        <button
          type="button"
          className="icon-btn utility-icon-btn"
          aria-label={darkMode ? t("switchToLight") : t("switchToDark")}
          onClick={() => dispatch(setDarkMode(!darkMode))}
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </button>
        <div className="relative shrink-0" ref={accountMenuRef}>
          <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-md text-fg" aria-label={t("account")} aria-haspopup="true" aria-expanded={accountMenuOpen} title={t("account")} onClick={() => setAccountMenuOpen((open) => !open)}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-sm font-semibold text-onaccent" aria-hidden="true">
              {profile ? profile.name.charAt(0).toUpperCase() : <UserIcon />}
            </span>
            <span className="hidden max-w-[8rem] truncate text-sm font-medium xl:inline">{profile?.name ?? displayName}</span>
          </button>
          {accountMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-line bg-surface p-2 shadow-xl" aria-label={t("account")}>
              <div className="border-b border-line px-3 py-2">
                <p className="truncate text-sm font-semibold">{profile?.name ?? displayName}</p>
                {profile?.email && <p className="truncate text-xs text-muted">{profile.email}</p>}
              </div>
              <Link href="/settings#profile" onClick={() => setAccountMenuOpen(false)} className="mt-1 flex min-h-11 items-center rounded-md px-3 text-sm ">{t("profileSettings")}</Link>
              {profile ? (
                <button type="button" onClick={() => { dispatch(signOutLocally()); setAccountMenuOpen(false); }} className="flex min-h-11 w-full items-center rounded-md px-3 text-left text-sm text-muted hover:text-fg">{t("signOut")}</button>
              ) : (
                <Link href="/settings#profile" onClick={() => setAccountMenuOpen(false)} className="flex min-h-11 items-center rounded-md px-3 text-sm text-muted hover:text-fg">{t("signIn")}</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
