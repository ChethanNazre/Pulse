import { getMock } from "@/lib/mockData";

describe("getMock", () => {
  it("returns nothing when no categories are selected", () => {
    expect(getMock("news", { categories: [] })).toMatchObject({ items: [], hasMore: false });
  });

  it("is deterministic and paginates without overlap", () => {
    const p1 = getMock("news", { categories: ["technology", "sports"], page: 1 });
    const p2 = getMock("news", { categories: ["technology", "sports"], page: 2 });
    expect(p1.items).toHaveLength(6);
    const ids = new Set(p1.items.map((i) => i.id));
    expect(p2.items.every((i) => !ids.has(i.id))).toBe(true);
    expect(getMock("news", { categories: ["technology", "sports"], page: 1 })).toEqual(p1);
  });

  it("eventually reports hasMore=false", () => {
    let page = 1;
    while (getMock("movie", { categories: ["science"], page }).hasMore) page++;
    expect(page).toBeGreaterThan(1);
    expect(getMock("movie", { categories: ["science"], page: page + 1 }).items).toEqual([]);
  });

  it("only returns items from requested categories", () => {
    const { items } = getMock("social", { categories: ["finance"] });
    expect(items.every((i) => i.category === "finance")).toBe(true);
  });

  it("filters by search query, case-insensitively", () => {
    const { items } = getMock("news", { categories: ["technology"], q: "RUST" });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => /rust/i.test(`${i.title} ${i.description}`))).toBe(true);
    expect(getMock("news", { categories: ["technology"], q: "zzzz-no-match" }).items).toEqual([]);
  });

  it("returns top items by score in trending mode", () => {
    const { items, hasMore } = getMock("news", { categories: ["technology", "science"], trending: true, pageSize: 4 });
    expect(items).toHaveLength(4);
    expect(hasMore).toBe(false);
    for (let i = 1; i < items.length; i++) expect(items[i - 1].score).toBeGreaterThanOrEqual(items[i].score);
  });
});
