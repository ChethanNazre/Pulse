import reducer, { hydratePreferences, initialPreferences, setDisplayName, setSidebarHidden, toggleCategory } from "@/store/preferencesSlice";
import feedback, { dismissContent, hydrateFeedback, recommendLess, restoreFeedback } from "@/store/feedbackSlice";
import favorites, { hydrateFavorites, toggleFavorite } from "@/store/favoritesSlice";
import { makeItem } from "./testUtils";

describe("preferencesSlice", () => {
  it("toggles a category on and off", () => {
    const on = reducer(initialPreferences, toggleCategory("sports"));
    expect(on.categories).toContain("sports");
    expect(reducer(on, toggleCategory("sports")).categories).not.toContain("sports");
  });

  it("can end up with zero categories", () => {
    let s = initialPreferences;
    for (const c of [...s.categories]) s = reducer(s, toggleCategory(c));
    expect(s.categories).toEqual([]);
  });

  it("hydrates valid values and drops unknown categories", () => {
    const s = reducer(initialPreferences, hydratePreferences({ categories: ["finance", "bogus" as never], darkMode: false }));
    expect(s.categories).toEqual(["finance"]);
    expect(s.darkMode).toBe(false);
    expect(s.hydrated).toBe(true);
  });

  it("marks hydrated even when nothing was saved, and ignores wrong types", () => {
    const s = reducer(initialPreferences, hydratePreferences({ darkMode: "yes" as never, categories: "x" as never }));
    expect(s.hydrated).toBe(true);
    expect(s.darkMode).toBe(initialPreferences.darkMode);
    expect(s.categories).toEqual(initialPreferences.categories);
  });

  it("caps display name length", () => {
    expect(reducer(initialPreferences, setDisplayName("x".repeat(100))).displayName).toHaveLength(40);
  });

  it("persists sidebar visibility preference", () => {
    expect(reducer(initialPreferences, setSidebarHidden(true)).sidebarHidden).toBe(true);
  });
});

describe("feedbackSlice", () => {
  it("stores, switches, restores and safely hydrates card feedback", () => {
    const item = makeItem({ id: "saved-card" });
    let state = feedback(undefined, dismissContent(item));
    expect(state.dismissed).toHaveLength(1);
    state = feedback(state, recommendLess(item));
    expect(state.dismissed).toHaveLength(0);
    expect(state.lessLikeThis).toHaveLength(1);
    expect(feedback(state, restoreFeedback(item.id)).lessLikeThis).toHaveLength(0);
    expect(feedback(undefined, hydrateFeedback({ dismissed: "bad" as never })).dismissed).toEqual([]);
  });
});

describe("favoritesSlice", () => {
  const init = { byId: {}, ids: [] };

  it("adds newest first and removes on second toggle", () => {
    let s = favorites(init, toggleFavorite(makeItem({ id: "a" })));
    s = favorites(s, toggleFavorite(makeItem({ id: "b" })));
    expect(s.ids).toEqual(["b", "a"]);
    s = favorites(s, toggleFavorite(makeItem({ id: "b" })));
    expect(s.ids).toEqual(["a"]);
    expect(s.byId.b).toBeUndefined();
  });

  it("ignores corrupt persisted data", () => {
    expect(favorites(init, hydrateFavorites({ byId: null as never, ids: "oops" as never }))).toEqual(init);
  });

  it("drops persisted ids that have no stored item", () => {
    const s = favorites(init, hydrateFavorites({ byId: { a: makeItem({ id: "a" }) }, ids: ["a", "ghost"] }));
    expect(s.ids).toEqual(["a"]);
  });
});
