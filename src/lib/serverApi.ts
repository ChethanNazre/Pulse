import { NextResponse } from "next/server";
import { CATEGORIES, type Category, type ContentItem, type ContentType, type PageResult } from "@/types";
import { getMock, mockImage } from "@/lib/mockData";

/**
 * Server-only helpers shared by the /api/* route handlers.
 * API keys are read from process.env here and never sent to the browser.
 */

export function parseParams(url: string) {
  const sp = new URL(url).searchParams;
  const requested = (sp.get("categories") ?? "").split(",").filter(Boolean);
  const categories = requested.filter((c): c is Category => (CATEGORIES as readonly string[]).includes(c));
  return {
    categories,
    q: (sp.get("q") ?? "").slice(0, 100),
    page: Math.max(1, Number(sp.get("page")) || 1),
    trending: sp.get("trending") === "1",
  };
}

type Params = ReturnType<typeof parseParams>;

const NEWSAPI_CATEGORY: Record<Category, string> = {
  technology: "technology",
  sports: "sports",
  finance: "business",
  entertainment: "entertainment",
  health: "health",
  science: "science",
};

// Approximate mapping from dashboard categories to TMDB genre ids.
const TMDB_GENRE: Record<Category, number> = {
  technology: 878,
  sports: 99,
  finance: 18,
  entertainment: 35,
  health: 10751,
  science: 9648,
};

const MASTODON_INSTANCE = "https://mastodon.social";

async function fetchNews(p: Params, key: string): Promise<PageResult> {
  const pageSize = 6;
  const calls = p.q
    ? [fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(p.q)}&pageSize=${pageSize}&page=${p.page}&language=en`, { headers: { "X-Api-Key": key } })]
    : p.categories.map((c) =>
        fetch(`https://newsapi.org/v2/top-headlines?category=${NEWSAPI_CATEGORY[c]}&pageSize=${Math.max(2, Math.ceil(pageSize / p.categories.length))}&page=${p.page}&language=en`, {
          headers: { "X-Api-Key": key },
          next: { revalidate: 300 },
        }),
      );
  const responses = await Promise.all(calls);
  if (responses.some((r) => !r.ok)) throw new Error("NewsAPI request failed");
  const bodies = await Promise.all(responses.map((r) => r.json()));
  const items: ContentItem[] = [];
  bodies.forEach((body, idx) => {
    const category = p.categories[idx] ?? p.categories[0] ?? "technology";
    for (const a of body.articles ?? []) {
      if (!a.title || a.title === "[Removed]") continue;
      items.push({
        id: `news-${a.url}`,
        type: "news",
        category,
        title: a.title,
        description: a.description ?? "",
        // NewsAPI's image is the only source for news photography. Keep a
        // neutral UI fallback when a publisher does not provide one.
        image: typeof a.urlToImage === "string" && a.urlToImage.startsWith("https://") ? a.urlToImage : null,
        url: a.url,
        source: a.source?.name ?? "News",
        publishedAt: a.publishedAt,
        score: 50,
      });
    }
  });
  const total = Math.max(...bodies.map((b) => b.totalResults ?? 0), 0);
  return { items, hasMore: p.page * pageSize < Math.min(total, 100), source: "live" };
}

async function fetchMovies(p: Params, key: string): Promise<PageResult> {
  const base = "https://api.themoviedb.org/3";
  let endpoint: string;
  if (p.q) endpoint = `${base}/search/movie?query=${encodeURIComponent(p.q)}&page=${p.page}`;
  else if (p.trending) endpoint = `${base}/trending/movie/week?page=1`;
  else endpoint = `${base}/discover/movie?with_genres=${p.categories.map((c) => TMDB_GENRE[c]).join("|")}&sort_by=popularity.desc&page=${p.page}`;
  const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${key}` }, next: { revalidate: 300 } });
  if (!res.ok) throw new Error("TMDB request failed");
  const body = await res.json();
  const items: ContentItem[] = (body.results ?? []).slice(0, p.trending ? 4 : 6).map((m: Record<string, any>) => ({
    id: `movie-${m.id}`,
    type: "movie" as const,
    category: p.categories[0] ?? "entertainment",
    title: m.title,
    description: m.overview || "No synopsis available.",
    image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : mockImage(String(m.id)),
    url: `https://www.themoviedb.org/movie/${m.id}`,
    source: "TMDB",
    publishedAt: m.release_date ? new Date(m.release_date).toISOString() : new Date().toISOString(),
    score: Math.round(m.popularity ?? 0),
  }));
  return { items, hasMore: p.page < Math.min(body.total_pages ?? 1, 10), source: "live" };
}

function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>|<\/p>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (entity, code: string) => {
      const named: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'" };
      if (code[0] !== "#") return named[code.toLowerCase()] ?? entity;
      const point = code[1].toLowerCase() === "x" ? Number.parseInt(code.slice(2), 16) : Number.parseInt(code.slice(1), 10);
      return Number.isInteger(point) && point >= 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    })
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchMastodon(p: Params): Promise<PageResult> {
  const responses = await Promise.all(p.categories.map(async (category) => {
    const url = new URL(`/api/v1/timelines/tag/${encodeURIComponent(category)}`, MASTODON_INSTANCE);
    url.searchParams.set("limit", "40");
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error("Mastodon request failed");
    const statuses: unknown = await res.json();
    if (!Array.isArray(statuses)) throw new Error("Invalid Mastodon response");
    return statuses.map((status: Record<string, any>) => ({ status, category }));
  }));

  const unique = new Map<string, { status: Record<string, any>; category: Category }>();
  for (const result of responses.flat()) {
    if (typeof result.status.id === "string" && !unique.has(result.status.id)) {
      unique.set(result.status.id, result as { status: Record<string, any>; category: Category });
    }
  }
  const needle = p.q.trim().toLowerCase();
  const filtered = [...unique.values()].filter(({ status }) =>
    !needle || `${stripHtml(status.content ?? "")} ${status.account?.display_name ?? ""} ${status.account?.acct ?? ""}`.toLowerCase().includes(needle),
  );
  const ordered = filtered.sort((a, b) => p.trending
    ? (Number(b.status.favourites_count ?? 0) + Number(b.status.reblogs_count ?? 0)) - (Number(a.status.favourites_count ?? 0) + Number(a.status.reblogs_count ?? 0))
    : Date.parse(b.status.created_at ?? "") - Date.parse(a.status.created_at ?? ""),
  );
  const pageSize = 6;
  const start = (p.page - 1) * pageSize;
  const page = ordered.slice(start, start + pageSize);
  const items: ContentItem[] = page.flatMap(({ status, category }) => {
    const text = typeof status.content === "string" ? stripHtml(status.content) : "";
    const url = typeof status.url === "string" && status.url.startsWith("https://") ? status.url : "";
    if (!text || !url) return [];
    const image = status.media_attachments?.find((attachment: Record<string, unknown>) =>
      attachment.type === "image" && typeof attachment.preview_url === "string" && attachment.preview_url.startsWith("https://"),
    )?.preview_url ?? null;
    return [{
      id: `social-${status.id}`,
      type: "social" as const,
      category,
      title: status.account?.display_name || `@${status.account?.acct ?? "unknown"}`,
      description: text,
      image,
      url,
      source: "Mastodon",
      publishedAt: status.created_at ?? new Date().toISOString(),
      score: Number(status.favourites_count ?? 0) + Number(status.reblogs_count ?? 0),
    }];
  });
  return { items, hasMore: ordered.length > start + pageSize, source: "live" };
}

/** Uses live providers when configured. Mock responses are opt-in and never an automatic live fallback. */
export async function respond(
  type: ContentType,
  request: Request,
  keyName: "NEWS_API_KEY" | "TMDB_API_KEY" | null,
) {
  const p = parseParams(request.url);
  const key = keyName ? process.env[keyName] : undefined;
  const sampleEnabled = process.env.USE_SAMPLE_DATA === "true";

  if (type === "social") {
    if (sampleEnabled) {
      const sample = getMock(type, { categories: p.categories, q: p.q, page: p.page, trending: p.trending });
      return NextResponse.json(sample, { headers: { "x-data-source": sample.source } });
    }
    if (p.categories.length === 0) {
      return NextResponse.json({ error: "Select at least one content category." }, { status: 503 });
    }
    try {
      const result = await fetchMastodon(p);
      return NextResponse.json(result, { headers: { "x-data-source": result.source } });
    } catch {
      return NextResponse.json({ error: "The live social provider could not be reached. Try again shortly." }, { status: 502 });
    }
  }

  if (!key || p.categories.length === 0) {
    if (sampleEnabled) {
      const sample = getMock(type, { categories: p.categories, q: p.q, page: p.page, trending: p.trending });
      return NextResponse.json(sample, { headers: { "x-data-source": sample.source } });
    }
    const missing = keyName && !key ? `${keyName} is not configured. Add it to .env.local to load live ${type} data.` : "Select at least one content category.";
    return NextResponse.json({ error: missing }, { status: 503 });
  }

  try {
    const result = type === "news" ? await fetchNews(p, key) : await fetchMovies(p, key);
    return NextResponse.json(result, { headers: { "x-data-source": result.source } });
  } catch {
    return NextResponse.json({ error: `The live ${type} provider could not be reached. Check the API key and try again.` }, { status: 502 });
  }
}
