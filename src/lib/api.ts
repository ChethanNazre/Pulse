import type { Category, ContentType, PageResult } from "@/types";

const ENDPOINT: Record<ContentType, string> = {
  news: "/api/news",
  movie: "/api/movies",
  social: "/api/social",
};

export interface FetchParams {
  categories: Category[];
  q?: string;
  page?: number;
  trending?: boolean;
}

export async function fetchSource(type: ContentType, p: FetchParams, signal?: AbortSignal): Promise<PageResult> {
  const sp = new URLSearchParams({ categories: p.categories.join(",") });
  if (p.q) sp.set("q", p.q);
  if (p.page) sp.set("page", String(p.page));
  if (p.trending) sp.set("trending", "1");
  const res = await fetch(`${ENDPOINT[type]}?${sp}`, { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? `${type} request failed (${res.status})`);
  }
  return res.json();
}

/** Round-robin merge so the unified feed mixes news, movies and posts. */
export function interleave<T>(lists: T[][]): T[] {
  const out: T[] = [];
  const max = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < max; i++) for (const l of lists) if (i < l.length) out.push(l[i]);
  return out;
}
