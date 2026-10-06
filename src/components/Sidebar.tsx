"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { GearIcon, HeartIcon, HomeIcon, TrendIcon } from "./icons";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import Logo from "./Logo";
import { SITE_NAME } from "@/lib/site";

export default function Sidebar({ chromeHidden = false, onReveal }: { chromeHidden?: boolean; onReveal?: () => void }) {
  const pathname = usePathname();
  const favCount = useAppSelector((s) => s.favorites.ids.length);
  const sidebarHidden = useAppSelector((s) => s.preferences.sidebarHidden);
  const { t } = useTranslation();
  const NAV = [
    { href: "/", label: t("feed"), Icon: HomeIcon },
    { href: "/trending", label: t("trending"), Icon: TrendIcon },
    { href: "/favorites", label: t("favorites"), Icon: HeartIcon },
    { href: "/settings", label: t("settings"), Icon: GearIcon },
  ];

  return (
    <nav
      aria-label="Primary"
      onFocusCapture={onReveal}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg px-2 transition-transform duration-200 ease-out motion-reduce:transition-none md:inset-y-0 md:right-auto md:w-52 md:border-r md:border-t-0 md:px-3 md:pb-6 md:pt-20 ${chromeHidden ? "translate-y-full pointer-events-none md:translate-y-0 md:pointer-events-auto" : "translate-y-0"} ${sidebarHidden ? "md:hidden" : ""}`}
    >
      <Link href="/" aria-label={`${SITE_NAME} home`} className="absolute left-5 top-5 hidden items-center gap-2 md:flex">
        <Logo size={32} />
        <span className="font-brand text-2xl leading-none">{SITE_NAME}</span>
      </Link>
      <ul className="flex md:flex-col md:gap-3">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1 md:flex-none">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 border-t-2 text-xs font-medium md:min-h-11 md:flex-row md:justify-start md:gap-3 md:border-l-2 md:border-t-0 md:px-3 md:text-sm ${
                  active ? "border-accent text-accent" : "border-transparent text-muted hover:text-fg"
                }`}
              >
                <Icon />
                <span>{label}</span>
                {label === "Favorites" && favCount > 0 && (
                  <span className="text-xs tabular-nums md:ml-auto" aria-label={`${favCount} saved`}>{favCount}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
