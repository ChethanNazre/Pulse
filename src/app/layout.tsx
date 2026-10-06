import type { Metadata, Viewport } from "next";
import "@fontsource-variable/public-sans";
import "./globals.css";
import Providers from "@/components/Providers";
import AppShell from "@/components/AppShell";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}, a personal content dashboard`, template: `%s | ${SITE_NAME}` },
  description: "News, movie recommendations and social posts in one feed that you can search, reorder and save.",
  openGraph: { title: `${SITE_NAME}, a personal content dashboard`, siteName: SITE_NAME, type: "website" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// Runs before first paint so the saved theme (or the system theme) applies without a flash.
const themeScript = `try{var s=JSON.parse(localStorage.getItem('dashboard:v1')||'{}');var d=s.preferences&&typeof s.preferences.darkMode==='boolean'?s.preferences.darkMode:window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-3 focus:text-onaccent">
            Skip to content
          </a>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
