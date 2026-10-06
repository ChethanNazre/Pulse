"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTrending } from "@/store/trendingSlice";
import { toggleFavorite } from "@/store/favoritesSlice";
import ContentCard from "@/components/ContentCard";
import { CardSkeleton, EmptyState } from "@/components/Skeleton";
import type { ContentType } from "@/types";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

export default function TrendingPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { items, status, error } = useAppSelector((s) => s.trending);
  const { categories, hydrated } = useAppSelector((s) => s.preferences);
  const favorites = useAppSelector((s) => s.favorites.byId);
  const catKey = categories.join(",");

  useEffect(() => {
    if (hydrated && categories.length > 0) dispatch(fetchTrending());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, catKey, dispatch]);

  if (hydrated && categories.length === 0) {
    return <EmptyState title={t("noCategories")} hint={t("chooseCategories")} action={<Link href="/settings" className="btn btn-primary">{t("openSettings")}</Link>} />;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">{t("trendingNow")}</h1>
      {status === "failed" ? (
        <div role="alert" className="panel px-6 py-12">
          <p className="text-xl font-semibold">{t("failed")}</p>
          <p className="mt-1 text-sm text-muted">{error}</p>
          <button type="button" className="btn btn-primary mt-4" onClick={() => dispatch(fetchTrending())}>{t("retry")}</button>
        </div>
      ) : status !== "succeeded" ? (
        <div aria-busy="true">{Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}</div>
      ) : (
        <div className="space-y-10">
          {([{ type: "news", title: t("trendingNews") }, { type: "movie", title: t("trendingMovies") }, { type: "social", title: t("trendingPosts") }] as { type: ContentType; title: string }[]).map(({ type, title }) => {
            const list = items.filter((i) => i.type === type).sort((a, b) => b.score - a.score);
            if (list.length === 0) return null;
            return (
              <section key={type} aria-labelledby={`t-${type}`}>
                <h2 id={`t-${type}`} className="mb-1 text-xl font-semibold">{title}</h2>
                <ol>
                  {list.map((item, idx) => (
                    <li key={item.id}>
                      <ContentCard item={item} rank={idx + 1} isFavorite={!!favorites[item.id]} onToggleFavorite={(i) => dispatch(toggleFavorite(i))} />
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
          {items.length === 0 && <EmptyState title={t("noTrending")} />}
        </div>
      )}
    </div>
  );
}
