import type { Category, ContentItem, ContentType, PageResult } from "@/types";

/**
 * Deterministic sample content. Used when no API keys are configured (and as a
 * fallback if an upstream API fails), and always for the social source.
 * Every item is flagged `sample: true` so the UI labels it as sample content.
 */

const SUBJECTS: Record<Category, string[]> = {
  technology: ["Quantum computing hardware", "Open-source language models", "Edge computing", "Rust in production systems", "Foldable displays", "Browser engine development"],
  sports: ["The league playoff race", "The summer transfer window", "Marathon world records", "T20 cricket scheduling", "Formula 1 pit stop timing", "Youth football academies"],
  finance: ["Central bank interest rates", "Index fund fees", "Early-stage startup funding", "Digital payment networks", "Urban housing prices", "Commodity markets"],
  entertainment: ["Streaming service pricing", "Independent cinema releases", "Music festival lineups", "Video game development", "Podcast production", "Awards season voting"],
  health: ["Sleep research", "Plant-based diets", "Wearable heart-rate sensors", "Public fitness programs", "Workplace mental health", "Preventive screening"],
  science: ["Deep-sea exploration", "Mars sample return", "Fusion energy research", "Gene-editing trials", "Climate model accuracy", "Sky survey telescopes"],
};

const ANGLES = ["Overview", "Background", "Recent developments", "What to watch next"];

const MOVIE_TITLES: Record<Category, string[]> = {
  technology: ["The Last Algorithm", "Signal Lost", "Deep Compile", "Orbit Protocol", "Circuit Break", "Cold Boot"],
  sports: ["Final Lap", "Underdog Season", "Overtime", "The Long Run", "Sudden Death", "Home Court"],
  finance: ["The Ledger", "Bull and Bear", "Hostile Takeover", "Zero Coupon", "Paper Empires", "Margin"],
  entertainment: ["Curtain Call", "Stage Left", "Reel Time", "Encore", "Backlot", "Studio Nine"],
  health: ["Pulse Rate", "The Clinic", "Breathe Again", "Marathon Heart", "Remedy", "Second Wind"],
  science: ["Event Horizon", "Cold Fusion", "Specimen", "The Lab at Dawn", "Aphelion", "Helix"],
};

const POST_TEMPLATES = [
  "Notes on {s}: three sources worth reading this week.",
  "A short thread on {s} and what has changed since spring.",
  "Reading list on {s}, saved for the weekend.",
  "Question for people following {s}: what are you watching?",
];

const POOL_PER_CATEGORY = 16;
const PAGE_SIZE = 6;

/** Muted hues only (teal, blue, olive, amber, slate, brick). Flat fills only. */
const HUES = [178, 208, 82, 38, 215, 12];

/** Inline flat SVG tile so sample data needs no network for images. */
export function mockImage(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = HUES[h % HUES.length];
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='224' height='168' viewBox='0 0 224 168'>` +
    `<rect width='224' height='168' fill='hsl(${hue} 22% 34%)'/>` +
    `<path d='M0 126h224M0 84h224M0 42h224M56 0v168M112 0v168M168 0v168' stroke='hsl(${hue} 22% 44%)' stroke-width='1' fill='none'/>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildItem(type: ContentType, category: Category, n: number): ContentItem {
  const subjects = SUBJECTS[category];
  const subject = subjects[n % subjects.length];
  const angle = ANGLES[Math.floor(n / subjects.length) % ANGLES.length];
  const id = `${type}-${category}-${n}`;
  const publishedDate = new Date();
  publishedDate.setUTCDate(publishedDate.getUTCDate() - (n % 7));
  publishedDate.setUTCHours(8 + (n % 10), 0, 0, 0);
  const publishedAt = publishedDate.toISOString();
  // Deterministic pseudo-popularity in [0, 100), used only to order the Trending section.
  const score = (n * 37 + category.length * 11 + type.length * 7) % 100;
  const base = { id, type, category, score, publishedAt, image: mockImage(id), sample: true as const, source: "Sample data" };

  if (type === "news") {
    return {
      ...base,
      title: `${subject}: ${angle.toLowerCase()}`,
      description: `Sample article about ${subject.toLowerCase()}, filed under ${category}.`,
      url: `https://example.com/news/${id}`,
    };
  }
  if (type === "movie") {
    const titles = MOVIE_TITLES[category];
    const title = titles[n % titles.length] + (n >= titles.length ? ` ${Math.floor(n / titles.length) + 1}` : "");
    return {
      ...base,
      title,
      description: `Sample movie recommendation for the ${category} category.`,
      url: `https://example.com/movies/${id}`,
    };
  }
  return {
    ...base,
    title: `Sample post about ${subject.toLowerCase()}`,
    description: POST_TEMPLATES[n % POST_TEMPLATES.length].replace("{s}", subject.toLowerCase()),
    url: `https://example.com/social/${id}`,
  };
}

/** Interleaves categories so one page contains a mix of the user's interests. */
function buildPool(type: ContentType, categories: Category[]): ContentItem[] {
  const pool: ContentItem[] = [];
  for (let n = 0; n < POOL_PER_CATEGORY; n++) {
    for (const c of categories) pool.push(buildItem(type, c, n));
  }
  return pool;
}

export interface MockQuery {
  categories: Category[];
  q?: string;
  page?: number;
  pageSize?: number;
  trending?: boolean;
}

export function getMock(type: ContentType, query: MockQuery): PageResult {
  const { categories, q = "", page = 1, pageSize = PAGE_SIZE, trending = false } = query;
  if (categories.length === 0) return { items: [], hasMore: false, source: "mock" };

  let pool = buildPool(type, categories);
  const needle = q.trim().toLowerCase();
  if (needle) {
    pool = pool.filter((i) => `${i.title} ${i.description} ${i.category}`.toLowerCase().includes(needle));
  }
  if (trending) {
    const top = [...pool].sort((a, b) => b.score - a.score).slice(0, pageSize);
    return { items: top, hasMore: false, source: "mock" };
  }
  const start = (page - 1) * pageSize;
  return { items: pool.slice(start, start + pageSize), hasMore: start + pageSize < pool.length, source: "mock" };
}
