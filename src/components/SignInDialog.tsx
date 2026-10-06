"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { LocalProfile } from "@/store/authSlice";

interface Props {
  title: string;
  url: string;
  initialName: string;
  onClose: () => void;
  onComplete: (profile: LocalProfile) => void;
  returnFocusRef: RefObject<HTMLElement | null>;
}

export default function SignInDialog({ title, url, initialName, onClose, onComplete, returnFocusRef }: Props) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const trigger = returnFocusRef.current;
    document.body.style.overflow = "hidden";
    nameRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [returnFocusRef]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled])',
    ) ?? []);
    if (controls.length === 0) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const profile = { name: name.trim(), email: email.trim() };
    if (!profile.name || !profile.email) return;
    onComplete(profile);
    setReady(true);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/55 p-4"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="read-sign-in-title"
        aria-describedby="read-sign-in-description"
        onKeyDown={handleKeyDown}
        initial={{ y: 8 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="panel w-full max-w-md p-5 shadow-2xl sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t("profile")}</p>
            <h2 id="read-sign-in-title" className="mt-1 text-2xl font-semibold tracking-tight">{ready ? t("profileReady") : t("signInToRead")}</h2>
          </div>
          <button type="button" className="icon-btn !h-9 !w-9" onClick={onClose} aria-label={t("closeDialog")}>
            <span aria-hidden="true">×</span>
          </button>
        </div>

        {ready ? (
          <div className="space-y-4">
            <p id="read-sign-in-description" className="text-sm leading-relaxed text-muted">{t("profileReadyHint", { title })}</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full card-cta">
              {t("continueToArticle")}
            </a>
            <p className="text-xs leading-relaxed text-muted">{t("localProfileNote")}</p>
          </div>
        ) : (
          <>
            <p id="read-sign-in-description" className="mb-4 text-sm leading-relaxed text-muted">{t("signInToReadHint", { title })}</p>
            <form className="space-y-3" onSubmit={submitProfile}>
              <div>
                <label htmlFor="read-sign-in-name" className="mb-1 block text-sm font-medium">{t("displayName")}</label>
                <input
                  ref={nameRef}
                  id="read-sign-in-name"
                  name="name"
                  required
                  maxLength={40}
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="min-h-11 w-full rounded-md border border-line bg-surface px-3 text-base"
                />
              </div>
              <div>
                <label htmlFor="read-sign-in-email" className="mb-1 block text-sm font-medium">{t("email")}</label>
                <input
                  id="read-sign-in-email"
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-h-11 w-full rounded-md border border-line bg-surface px-3 text-base"
                />
              </div>
              <button type="submit" className="btn btn-primary w-full">{t("signIn")}</button>
              <p className="text-xs leading-relaxed text-muted">{t("localProfileNote")}</p>
            </form>
          </>
        )}
      </motion.div>
    </div>,
    document.body,
  );
}
