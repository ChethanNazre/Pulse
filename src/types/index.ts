export const CATEGORIES = [
  "technology",
  "sports",
  "finance",
  "entertainment",
  "health",
  "science",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type ContentType = "news" | "movie" | "social";

export interface ContentItem {
  id: string;
  type: ContentType;
  category: Category;
  title: string;
  description: string;
  image: string | null;
  url: string;
  source: string;
  publishedAt: string;
  /** Used to rank the Trending section. */
  score: number;
  /** True for placeholder content, so the UI can say so. */
  sample?: boolean;
}

export interface PageResult {
  items: ContentItem[];
  hasMore: boolean;
  /** "live" when an upstream API served the data, "mock" otherwise. */
  source: "live" | "mock";
}

export type LoadStatus = "idle" | "loading" | "succeeded" | "failed";
