import { makeStore } from "@/store";
import { fetchFeed, moveItem, reorderItems, setQuery } from "@/store/feedSlice";
import { hydratePreferences } from "@/store/preferencesSlice";
import { makeItem, mockFetch } from "./testUtils";

const page = (prefix: string, n = 2, hasMore = true) => ({
  items: Array.from({ length: n }, (_, i) => makeItem({ id: `${prefix}-${i}`, type: prefix as never })),
  hasMore,
  source: "mock",
});
const ok = { "/api/news": () => page("news"), "/api/movies": () => page("movie"), "/api/social": () => page("social") };

const setup = () => {
  const store = makeStore();
  store.dispatch(hydratePreferences({ categories: ["technology"] }));
  return store;
};

describe("fetchFeed thunk", () => {
  it("merges the three sources round-robin", async () => {
    mockFetch(ok);
    const store = setup();
    await store.dispatch(fetchFeed({ reset: true }));
    const { items, status, page: p } = store.getState().feed;
    expect(status).toBe("succeeded");
    expect(p).toBe(1);
    expect(items.map((i) => i.id)).toEqual(["news-0", "movie-0", "social-0", "news-1", "movie-1", "social-1"]);
  });

  it("appends the next page and de-duplicates", async () => {
    mockFetch(ok);
    const store = setup();
    await store.dispatch(fetchFeed({ reset: true }));
    await store.dispatch(fetchFeed());
    const { items, page: p } = store.getState().feed;
    expect(p).toBe(2);
    expect(items).toHaveLength(6); // same ids returned again -> not duplicated
  });

  it("passes categories, page and query to the API", async () => {
    const f = mockFetch(ok);
    const store = setup();
    store.dispatch(setQuery("  rust "));
    await store.dispatch(fetchFeed({ reset: true }));
    const url = String(f.mock.calls[0][0]);
    expect(url).toContain("categories=technology");
    expect(url).toContain("q=rust");
    expect(url).toContain("page=1");
  });

  it("shows a warning when only some sources fail", async () => {
    mockFetch({ ...ok, "/api/movies": () => ({ __status: 500 }) });
    const store = setup();
    await store.dispatch(fetchFeed({ reset: true }));
    const { status, warning, items } = store.getState().feed;
    expect(status).toBe("succeeded");
    expect(warning).toMatch(/1 of 3/);
    expect(items.some((i) => i.id.startsWith("movie"))).toBe(false);
  });

  it("fails when every source fails", async () => {
    mockFetch({ "/api/news": () => new Error("x"), "/api/movies": () => ({ __status: 500 }), "/api/social": () => ({ __status: 503 }) });
    const store = setup();
    await store.dispatch(fetchFeed({ reset: true }));
    expect(store.getState().feed.status).toBe("failed");
    expect(store.getState().feed.error).toBe("x");
  });

  it("ignores a stale response that resolves after a newer request", async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    let call = 0;
    mockFetch({
      "/api/news": async () => (++call <= 1 ? (await gate, page("old", 1, false)) : page("new", 1, false)),
      "/api/movies": () => ({ items: [], hasMore: false }),
      "/api/social": () => ({ items: [], hasMore: false }),
    });
    const store = setup();
    const first = store.dispatch(fetchFeed({ reset: true, key: "a" }));
    const second = store.dispatch(fetchFeed({ reset: true, key: "b" }));
    await second;
    release();
    await first;
    expect(store.getState().feed.items.map((i) => i.id)).toEqual(["new-0"]);
    expect(store.getState().feed.loadedKey).toBe("b");
  });

  it("does not start a second load-more while one is in flight", async () => {
    const f = mockFetch(ok);
    const store = setup();
    await store.dispatch(fetchFeed({ reset: true }));
    f.mockClear();
    const a = store.dispatch(fetchFeed());
    const b = store.dispatch(fetchFeed());
    await Promise.all([a, b]);
    expect(f).toHaveBeenCalledTimes(3); // one round of 3 sources, not two
  });
});

describe("reordering", () => {
  const seeded = async () => {
    mockFetch(ok);
    const store = setup();
    await store.dispatch(fetchFeed({ reset: true }));
    return store;
  };

  it("reorderItems applies a new order and ignores unknown ids", async () => {
    const store = await seeded();
    const ids = store.getState().feed.items.map((i) => i.id);
    store.dispatch(reorderItems([...ids].reverse().concat("ghost")));
    expect(store.getState().feed.items.map((i) => i.id)).toEqual([...ids].reverse());
  });

  it("moveItem swaps neighbours and clamps at the edges", async () => {
    const store = await seeded();
    const [a, b] = store.getState().feed.items.map((i) => i.id);
    store.dispatch(moveItem({ id: a, direction: 1 }));
    expect(store.getState().feed.items.slice(0, 2).map((i) => i.id)).toEqual([b, a]);
    store.dispatch(moveItem({ id: b, direction: -1 })); // b is first now
    expect(store.getState().feed.items[0].id).toBe(b);
  });
});
