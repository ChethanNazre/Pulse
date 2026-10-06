"use client";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleFavorite } from "@/store/favoritesSlice";
import ContentCard from "@/components/ContentCard";
import { EmptyState } from "@/components/Skeleton";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

export default function FavoritesPage() {
  const dispatch = useAppDispatch();
  const { ids, byId } = useAppSelector((s) => s.favorites);
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">{t("favorites")}</h1>
      {ids.length === 0 ? (
        <EmptyState
          title={t("noFavorites")}
          hint={t("noFavoritesHint")}
          action={<Link href="/" className="btn btn-primary">{t("browseFeed")}</Link>}
        />
      ) : (
        <ul aria-label="Favorite items">
          {ids.map((id) => (
            <li key={id}>
              <ContentCard item={byId[id]} isFavorite onToggleFavorite={(i) => dispatch(toggleFavorite(i))} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
