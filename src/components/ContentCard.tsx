"use client";
import { memo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import type { ContentItem } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signInLocally } from "@/store/authSlice";
import { ChevronDown, ChevronUp, EyeOffIcon, HeartIcon, PhotoIcon, TrashIcon } from "./icons";
import SignInDialog from "./SignInDialog";

const SWIPE_THRESHOLD = 88;

interface Props {
  item: ContentItem;
  isFavorite: boolean;
  onToggleFavorite: (item: ContentItem) => void;
  /** Rendered in the feed to provide a drag handle. */
  dragHandle?: React.ReactNode;
  /** Keyboard alternative to dragging. */
  onMove?: (id: string, direction: -1 | 1) => void;
  rank?: number;
  onDismiss?: (item: ContentItem) => void;
  onRecommendLess?: (item: ContentItem) => void;
  swipeEnabled?: boolean;
}

function ContentCard({ item, isFavorite, onToggleFavorite, dragHandle, onMove, rank, onDismiss, onRecommendLess, swipeEnabled = false }: Props) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.auth.profile);
  const displayName = useAppSelector((state) => state.preferences.displayName);
  const [signInOpen, setSignInOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const readMoreRef = useRef<HTMLAnchorElement>(null);
  const publishedAt = new Date(item.publishedAt);
  const validDate = Number.isFinite(publishedAt.getTime());
  const date = validDate
    ? new Intl.DateTimeFormat(i18n.language, { month: "short", day: "numeric", year: "numeric" }).format(publishedAt)
    : t("dateUnavailable");
  const safeUrl = (() => {
    try {
      const parsed = new URL(item.url);
      return parsed.protocol === "https:" ? parsed.toString() : null;
    } catch {
      return null;
    }
  })();
  const showSource = item.source && !item.sample && item.source.toLowerCase() !== "sample data";

  return (
    <div className="swipe-card-shell">
      <div className="swipe-reveal" aria-hidden="true">
        <div className="swipe-reveal-side swipe-reveal-delete"><TrashIcon /><span>{t("remove")}</span></div>
        <div className="swipe-reveal-side swipe-reveal-less"><EyeOffIcon /><span>{t("recommendLess")}</span></div>
      </div>
      <motion.article
        layout
        drag={swipeEnabled ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.36}
        whileDrag={{ scale: 0.99, cursor: "grabbing" }}
        onDragEnd={(_, info) => {
          if (info.offset.x >= SWIPE_THRESHOLD) onDismiss?.(item);
          else if (info.offset.x <= -SWIPE_THRESHOLD) onRecommendLess?.(item);
        }}
        data-testid="content-card"
        data-content-type={item.type}
        data-swipe-enabled={swipeEnabled}
        aria-label={item.title}
        className="content-card group flex gap-2.5 p-3 sm:gap-4 sm:p-4 lg:gap-5 lg:p-5"
      >
        <div className="card-grip">{dragHandle}</div>
        {item.image && !imageFailed ? (
          <img
            src={item.image}
            alt=""
            width={176}
            height={132}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="card-image h-[4.25rem] w-[4.75rem] shrink-0 rounded-md bg-line object-cover sm:h-24 sm:w-28 lg:h-32 lg:w-44 lg:rounded-lg"
          />
        ) : (
          <div className="card-image-fallback h-[4.25rem] w-[4.75rem] shrink-0 rounded-md sm:h-24 sm:w-28 lg:h-32 lg:w-44 lg:rounded-lg" role="img" aria-label={t("imageUnavailable")}>
            <PhotoIcon />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted sm:gap-1.5 sm:text-[10px] lg:gap-2 lg:text-[11px] lg:tracking-[0.14em]">
            {rank !== undefined && <span className="text-accent tabular-nums">{String(rank).padStart(2, "0")}</span>}
            <span>{t(item.type === "social" ? "post" : item.type)}</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent" />
            <span data-testid="card-category" className="max-w-[7rem] truncate sm:max-w-none">{item.category}</span>
            {validDate ? (
              <time dateTime={publishedAt.toISOString()} className="ml-auto shrink-0 font-mono text-[9px] font-normal tracking-normal sm:text-[10px]">{date}</time>
            ) : (
              <span className="ml-auto shrink-0 font-mono text-[9px] font-normal tracking-normal sm:text-[10px]">{date}</span>
            )}
          </div>
          <h3 className="card-title text-base font-semibold leading-snug tracking-[-0.025em] [overflow-wrap:anywhere] sm:text-lg sm:leading-tight sm:tracking-[-0.03em] lg:text-2xl lg:tracking-[-0.035em]">{item.title}</h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted [overflow-wrap:anywhere] sm:text-[13px] lg:text-sm">{item.description}</p>
          <div className="card-actions flex flex-wrap items-center gap-2 pt-1 sm:mt-auto sm:pt-2">
            <a
              ref={readMoreRef}
              href={safeUrl ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!safeUrl || undefined}
              onClick={(event) => {
                if (!safeUrl) {
                  event.preventDefault();
                  return;
                }
                if (!profile) {
                  event.preventDefault();
                  setSignInOpen(true);
                }
              }}
              className="btn btn-primary card-cta"
            >
              {t(item.type === "news" ? "readMore" : item.type === "movie" ? "playNow" : "viewPost")}
              <span className="sr-only">: {item.title}</span>
            </a>
            <button
              type="button"
              onClick={() => onToggleFavorite(item)}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? t("removeFavorite", { title: item.title }) : t("addFavorite", { title: item.title })}
              className={`icon-btn card-favorite transition-transform duration-200 ${isFavorite ? "!border-accent text-accent" : ""}`}
            >
              <motion.span animate={isFavorite ? { scale: [1, 1.28, 1] } : { scale: 1 }} transition={{ duration: 0.24 }}><HeartIcon filled={isFavorite} /></motion.span>
            </button>
            {onMove && (
              <span className="inline-flex">
                <button type="button" className="icon-btn card-reorder sr-only focus:not-sr-only sm:not-sr-only" aria-label={t("moveUp", { title: item.title })} onClick={() => onMove(item.id, -1)}><ChevronUp /></button>
                <button type="button" className="icon-btn card-reorder sr-only focus:not-sr-only sm:not-sr-only" aria-label={t("moveDown", { title: item.title })} onClick={() => onMove(item.id, 1)}><ChevronDown /></button>
              </span>
            )}
            {onRecommendLess && <button type="button" className="sr-only focus:not-sr-only focus:rounded-md focus:border focus:border-line focus:bg-surface focus:px-3 focus:py-2 focus:text-xs" onClick={() => onRecommendLess(item)} aria-label={t("recommendLessItem", { title: item.title })}><EyeOffIcon className="mr-2 inline" />{t("recommendLess")}</button>}
            {onDismiss && <button type="button" className="sr-only focus:not-sr-only focus:rounded-md focus:border focus:border-line focus:bg-surface focus:px-3 focus:py-2 focus:text-xs" onClick={() => onDismiss(item)} aria-label={t("dismissItem", { title: item.title })}><TrashIcon className="mr-2 inline" />{t("remove")}</button>}
            {showSource && <span className="ml-auto hidden max-w-[12rem] truncate font-mono text-[10px] uppercase tracking-[0.08em] text-muted lg:block">{item.source}</span>}
          </div>
        </div>
      </motion.article>
      {signInOpen && safeUrl && (
        <SignInDialog
          title={item.title}
          url={safeUrl}
          initialName={displayName}
          onClose={() => setSignInOpen(false)}
          onComplete={(nextProfile) => dispatch(signInLocally(nextProfile))}
          returnFocusRef={readMoreRef}
        />
      )}
    </div>
  );
}

export default memo(ContentCard);
