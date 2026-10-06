/** @jest-environment node */
import { respond } from "@/lib/serverApi";

const env = { sample: process.env.USE_SAMPLE_DATA, news: process.env.NEWS_API_KEY, movies: process.env.TMDB_API_KEY };

afterEach(() => {
  if (env.sample === undefined) delete process.env.USE_SAMPLE_DATA;
  else process.env.USE_SAMPLE_DATA = env.sample;
  if (env.news === undefined) delete process.env.NEWS_API_KEY;
  else process.env.NEWS_API_KEY = env.news;
  if (env.movies === undefined) delete process.env.TMDB_API_KEY;
  else process.env.TMDB_API_KEY = env.movies;
});

describe("live provider configuration", () => {
  it("keeps NewsAPI articles photo-free when the publisher has no image", async () => {
    process.env.NEWS_API_KEY = "test-key";
    process.env.USE_SAMPLE_DATA = "false";
    const previousFetch = global.fetch;
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ articles: [{ title: "Current headline", description: "Article details", url: "https://publisher.example/story", urlToImage: null, publishedAt: "2026-10-06T10:00:00Z", source: { name: "Publisher" } }], totalResults: 1 }),
    })) as unknown as typeof fetch;
    try {
      const response = await respond("news", new Request("https://pulse.test/api/news?categories=technology"), "NEWS_API_KEY");
      const body = await response.json();
      expect(body.items[0]).toMatchObject({ title: "Current headline", image: null });
    } finally {
      global.fetch = previousFetch;
    }
  });

  it("does not silently replace missing NewsAPI credentials with invented content", async () => {
    delete process.env.NEWS_API_KEY;
    delete process.env.USE_SAMPLE_DATA;
    const response = await respond("news", new Request("https://pulse.test/api/news?categories=technology"), "NEWS_API_KEY");
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringContaining("NEWS_API_KEY") });
  });

  it("reports unavailable live social provider instead of substituting sample content", async () => {
    delete process.env.USE_SAMPLE_DATA;
    const previousFetch = global.fetch;
    global.fetch = jest.fn(async () => { throw new Error("Provider unavailable"); }) as unknown as typeof fetch;
    try {
      const response = await respond("social", new Request("https://pulse.test/api/social?categories=technology"), null);
      expect(response.status).toBe(502);
      await expect(response.json()).resolves.toMatchObject({ error: expect.stringContaining("social provider") });
    } finally {
      global.fetch = previousFetch;
    }
  });

  it("maps Mastodon statuses into live social feed items", async () => {
    delete process.env.USE_SAMPLE_DATA;
    const previousFetch = global.fetch;
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => [{
        id: "123",
        content: "<p>Fresh &amp; useful post</p>",
        url: "https://mastodon.social/@sample/123",
        created_at: "2026-10-06T10:00:00Z",
        favourites_count: 7,
        reblogs_count: 2,
        account: { acct: "sample@mastodon.social", display_name: "Sample author" },
        media_attachments: [{ type: "image", preview_url: "https://cdn.example/image.jpg" }],
      }],
    })) as unknown as typeof fetch;
    try {
      const response = await respond("social", new Request("https://pulse.test/api/social?categories=technology"), null);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toMatchObject({ hasMore: false, source: "live" });
      expect(body.items[0]).toMatchObject({
        id: "social-123",
        type: "social",
        category: "technology",
        title: "Sample author",
        description: "Fresh & useful post",
        image: "https://cdn.example/image.jpg",
        url: "https://mastodon.social/@sample/123",
        source: "Mastodon",
        score: 9,
      });
    } finally {
      global.fetch = previousFetch;
    }
  });

  it("rejects social requests without a category", async () => {
    delete process.env.USE_SAMPLE_DATA;
    const response = await respond("social", new Request("https://pulse.test/api/social"), null);
    expect(response.status).toBe(503);
  });

  it("allows sample content only when the demo flag is explicitly enabled", async () => {
    process.env.USE_SAMPLE_DATA = "true";
    const response = await respond("social", new Request("https://pulse.test/api/social?categories=technology"), null);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.source).toBe("mock");
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items.every((item: { sample?: boolean }) => item.sample === true)).toBe(true);
  });
});
