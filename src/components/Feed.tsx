"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Reorder, useDragControls } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchFeed, moveItem, reorderItems } from "@/store/feedSlice";
import { toggleFavorite } from "@/store/favoritesSlice";
import type { ContentItem, ContentType } from "@/types";
import ContentCard from "./ContentCard";
import { CardSkeleton, EmptyState, Spinner } from "./Skeleton";
import { GripIcon } from "./icons";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { dismissContent, recommendLess } from "@/store/feedbackSlice";

function FeedRow({ item, isFavorite, onFavorite, onMove, onDismiss, onRecommendLess, swipeEnabled }: {
  item: ContentItem;
  isFavorite: boolean;
  onFavorite: (i: ContentItem) => void;
  onMove: (id: string, d: -1 | 1) => void;
  onDismiss: (item: ContentItem) => void;
  onRecommendLess: (item: ContentItem) => void;
  swipeEnabled: boolean;
}) {
  const controls = useDragControls();
  const tCard = useTranslation().t;
  return (
    <Reorder.Item
      value={item}
      as="li"
      dragListener={false}
      dragControls={controls}
      whileDrag={{ zIndex: 10, boxShadow: "0 8px 24px rgb(0 0 0 / 0.25)" }}
      layout="position"
    >
      <ContentCard
        item={item}
        isFavorite={isFavorite}
        onToggleFavorite={onFavorite}
        onMove={onMove}
        onDismiss={onDismiss}
        onRecommendLess={onRecommendLess}
        swipeEnabled={swipeEnabled}
        dragHandle={
          <div
            data-testid="drag-handle"
            role="img"
            aria-label={tCard("dragToReorder", { title: item.title })}
            onPointerDown={(e) => controls.start(e)}
            className="flex h-11 w-8 shrink-0 cursor-grab touch-none items-center justify-center self-start text-muted hover:text-fg active:cursor-grabbing"
          >
            <GripIcon />
          </div>
        }
      />
    </Reorder.Item>
  );
}

export default function Feed() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const feed = useAppSelector((s) => s.feed);
  const { query, loadedKey, error, warning } = feed;
  const { categories, hydrated, swipeActionsEnabled, language } = useAppSelector((s) => s.preferences);
  const feedback = useAppSelector((s) => s.feedback);
  const favoriteIds = useAppSelector((s) => s.favorites.byId);
  const [todayLabel, setTodayLabel] = useState("");
  const [todayIso, setTodayIso] = useState("");
  const [selectedType, setSelectedType] = useState<ContentType | "all">("all");
  const key = `${categories.join(",")}|${query}`;
  // Data held in the store may belong to older preferences/query; never show it as current.
  const current = loadedKey === key;
  const dismissedIds = new Set(feedback.dismissed.map((item) => item.id));
  const lessSignals = new Set(feedback.lessLikeThis.map((item) => `${item.type}:${item.category}`));
  const isHiddenByChoice = (item: ContentItem) => dismissedIds.has(item.id) || lessSignals.has(`${item.type}:${item.category}`);
  const availableItems = current ? feed.items.filter((item) => !isHiddenByChoice(item)) : [];
  const items = selectedType === "all" ? availableItems : availableItems.filter((item) => item.type === selectedType);
  const restoredCount = current ? feed.items.filter(isHiddenByChoice).length : 0;
  const status = current ? feed.status : "loading";
  const hasMore = current && feed.hasMore;

  useEffect(() => {
    const now = new Date();
    setTodayLabel(new Intl.DateTimeFormat(language, { month: "short", day: "numeric", year: "numeric" }).format(now));
    setTodayIso(new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10));
  }, [language]);

  // (Re)load whenever the inputs change, but not when simply navigating back to the feed.
  useEffect(() => {
    if (!hydrated || categories.length === 0) return;
    if (loadedKey !== key) dispatch(fetchFeed({ reset: true, key }));
  }, [hydrated, key, loadedKey, categories.length, dispatch]);

  const loadMore = useCallback(() => {
    dispatch(fetchFeed());
  }, [dispatch]);

  // Infinite scroll: load the next page when the sentinel scrolls into view.
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || status !== "succeeded" || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, status, loadMore, items.length]);

  const onFavorite = useCallback((i: ContentItem) => dispatch(toggleFavorite(i)), [dispatch]);
    const visibleIdsRef = useRef<string[]>([]);
  visibleIdsRef.current = items.map((i) => i.id);
  const onMove = useCallback((id: string, direction: -1 | 1) => dispatch(moveItem({ id, direction, visibleIds: visibleIdsRef.current })), [dispatch]);
  const onDismiss = useCallback((item: ContentItem) => dispatch(dismissContent(item)), [dispatch]);
  const onRecommendLess = useCallback((item: ContentItem) => dispatch(recommendLess(item)), [dispatch]);

  if (hydrated && categories.length === 0) {
    return (
      <EmptyState
        title={t("pickCategory")}
        hint={t("pickCategoryHint")}
        action={<Link href="/settings" className="btn btn-primary">{t("openSettings")}</Link>}
      />
    );
  }

  return (
    <section aria-labelledby="feed-title">
      <div className="mb-4 flex items-baseline justify-between">
        <h1 id="feed-title" className="text-3xl font-semibold tracking-tight">
          {query ? `${t("results")} “${query}”` : t("feed")}
        </h1>
        <p className="text-right text-[11px] text-muted sm:text-xs lg:hidden">{todayLabel && <><span>{t("today")}, </span><time dateTime={todayIso}>{todayLabel}</time></>}</p>
        <p className="hidden text-xs text-muted lg:block">{t("dragHint")}</p>
      </div>
      {restoredCount > 0 && <p role="status" className="mb-4 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-muted">{t("hiddenItemsCount", { count: restoredCount })} <Link href="/settings#feed-controls" className="font-semibold text-fg underline underline-offset-4">{t("manageRecommendations")}</Link></p>}

      {warning && (
        <p role="status" className="mb-3 rounded-md border border-warn px-3 py-2 text-sm">{t("sourceWarning", { count: warning.match(/(\d+) of (\d+)/)?.[1], total: warning.match(/(\d+) of (\d+)/)?.[2] })}</p>
      )}

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={t("contentTypes")}>
        {(["all", "news", "movie", "social"] as const).map((type) => {
          const active = selectedType === type;
          const label = type === "all" ? t("allContent") : type === "movie" ? t("movies") : type === "social" ? t("posts") : t("news");
          return <button key={type} type="button" aria-pressed={active} onClick={() => setSelectedType(type)} className={`min-h-11 rounded-md border px-3 text-sm font-medium transition-colors ${active ? "border-fg bg-fg text-bg" : "border-line bg-surface text-muted hover:border-fg hover:text-fg"}`}>{label}</button>;
        })}
      </div>

      {status === "failed" && items.length === 0 ? (
        <div role="alert" className="panel px-6 py-12" data-testid="error-state">
          <p className="text-xl font-semibold">{t("failed")}</p>
          <p className="mt-1 text-sm text-muted">{error}</p>
          <button type="button" className="btn btn-primary mt-4" onClick={() => dispatch(fetchFeed({ reset: true, key }))}>{t("retry")}</button>
        </div>
      ) : status === "loading" && items.length === 0 ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading feed">
          {Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : status === "succeeded" && items.length === 0 ? (
        <EmptyState title={query ? `${t("noResults")} “${query}”` : selectedType === "all" ? t("nothingHere") : t("noFilteredItems", { type: selectedType === "movie" ? t("movies").toLowerCase() : selectedType === "social" ? t("posts").toLowerCase() : t("news").toLowerCase() })} hint={query ? t("noResultsHint") : selectedType === "all" ? t("nothingHint") : t("chooseAnotherType")} action={feedback.dismissed.length + feedback.lessLikeThis.length > 0 ? <Link href="/settings#feed-controls" className="btn btn-ghost">{t("manageRecommendations")}</Link> : undefined} />
      ) : (
        <Reorder.Group
          as="ul"
          axis="y"
          values={items}
          onReorder={(next) => dispatch(reorderItems(next.map((i) => i.id)))}
          className="space-y-3 sm:space-y-4"
          aria-label="Content feed"
        >
          {items.map((item) => (
            <FeedRow key={item.id} item={item} isFavorite={!!favoriteIds[item.id]} onFavorite={onFavorite} onMove={onMove} onDismiss={onDismiss} onRecommendLess={onRecommendLess} swipeEnabled={swipeActionsEnabled} />
          ))}
        </Reorder.Group>
      )}

      {status === "failed" && items.length > 0 && (
        <p role="alert" className="mt-4 text-sm text-warn">
          {error} <button type="button" className="underline" onClick={loadMore}>{t("retry")}</button>
        </p>
      )}
      {status === "loading" && items.length > 0 && <Spinner label="Loading more" />}
      <div ref={sentinel} aria-hidden className="h-4" />
      {hasMore && status === "succeeded" && items.length > 0 && (
        <div className="mt-2 text-center">
          <button type="button" className="btn btn-ghost" onClick={loadMore}>{t("loadMore")}</button>
        </div>
      )}
      {!hasMore && items.length > 0 && <p className="mt-6 text-center text-sm text-muted">{t("caughtUp")}</p>}
    </section>
  );
}
