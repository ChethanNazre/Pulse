import type { ContentItem } from "@/types";

export const makeItem = (over: Partial<ContentItem> = {}): ContentItem => ({
  id: "news-1",
  type: "news",
  category: "technology",
  title: "Test headline",
  description: "Test description",
  image: "data:image/gif;base64,R0lGODlhAQABAAAAACw=",
  url: "https://example.com/1",
  source: "Test Source",
  publishedAt: "2026-09-01T10:00:00.000Z",
  score: 10,
  ...over,
});

/** Builds a fetch mock that answers by endpoint. */
export function mockFetch(handlers: Record<string, () => unknown | Promise<unknown>>) {
  const fn = jest.fn(async (url: string) => {
    const path = Object.keys(handlers).find((p) => String(url).startsWith(p));
    if (!path) throw new Error(`unhandled ${url}`);
    const body = await handlers[path]();
    if (body instanceof Error) throw body;
    if (body && typeof body === "object" && "__status" in (body as object)) {
      return { ok: false, status: (body as { __status: number }).__status, json: async () => ({}) };
    }
    return { ok: true, status: 200, json: async () => body };
  });
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}
