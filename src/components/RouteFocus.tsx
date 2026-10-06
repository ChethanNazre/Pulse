"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** After client-side navigation, move focus to <main> so keyboard and screen reader users start at the new content. */
export default function RouteFocus() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}
