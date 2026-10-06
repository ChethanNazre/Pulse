"use client";
import Header from "@/components/Header";
import RouteFocus from "@/components/RouteFocus";
import Sidebar from "@/components/Sidebar";
import SiteFooter from "@/components/SiteFooter";
import { useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarHidden = useAppSelector((s) => s.preferences.sidebarHidden);
  const [chromeHidden, setChromeHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame: number | null = null;
    const update = () => {
      const currentY = Math.max(0, window.scrollY);
      if (window.innerWidth >= 768 || currentY <= 24) setChromeHidden(false);
      else if (currentY - lastY > 5) setChromeHidden(true);
      else if (lastY - currentY > 5) setChromeHidden(false);
      lastY = currentY;
      frame = null;
    };
    const onScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };
    const onResize = () => {
      if (window.innerWidth >= 768) setChromeHidden(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  const revealChrome = () => setChromeHidden(false);

  return (
    <div className={`min-h-dvh transition-[padding] duration-300 ease-out ${sidebarHidden ? "md:pl-0" : "md:pl-52"}`}>
      <Sidebar chromeHidden={chromeHidden} onReveal={revealChrome} />
      <Header chromeHidden={chromeHidden} onReveal={revealChrome} />
      <RouteFocus />
      <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-4 pb-8 pt-8 sm:px-6 lg:px-10">
        {children}
        <SiteFooter />
      </main>
    </div>
  );
}
