import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import Feed from "@/components/Feed";
import { makeStore } from "@/store";
import { hydratePreferences } from "@/store/preferencesSlice";
import { setQuery } from "@/store/feedSlice";
import { makeItem, mockFetch } from "./testUtils";
import { restoreFeedback } from "@/store/feedbackSlice";

const src = (type: "news" | "movie" | "social", n: number, hasMore = false) => () => ({
  items: Array.from({ length: n }, (_, i) => makeItem({ id: `${type}-${i}`, type, title: `${type} title ${i}` })),
  hasMore,
  source: "mock",
});

function renderFeed(prefs: Parameters<typeof hydratePreferences>[0] = { categories: ["technology"] }) {
  const store = makeStore();
  store.dispatch(hydratePreferences(prefs));
  render(<Provider store={store}><Feed /></Provider>);
  return store;
}

describe("Feed (integration)", () => {
  it("shows skeletons, then renders fetched cards from all sources", async () => {
    mockFetch({ "/api/news": src("news", 2), "/api/movies": src("movie", 1), "/api/social": src("social", 1) });
    renderFeed();
    expect(screen.getByLabelText("Loading feed")).toBeInTheDocument();
    expect(await screen.findAllByTestId("content-card")).toHaveLength(4);
    expect(screen.getByText("movie title 0")).toBeInTheDocument();
    expect(screen.getByText(/all caught up/i)).toBeInTheDocument();
  });

  it("shows an empty state when the APIs return nothing", async () => {
    mockFetch({ "/api/news": src("news", 0), "/api/movies": src("movie", 0), "/api/social": src("social", 0) });
    renderFeed();
    expect(await screen.findByText("Nothing here yet")).toBeInTheDocument();
  });

  it("shows a search-specific empty state", async () => {
    mockFetch({ "/api/news": src("news", 0), "/api/movies": src("movie", 0), "/api/social": src("social", 0) });
    const store = renderFeed();
    act(() => store.dispatch(setQuery("zzz")));
    expect(await screen.findByText(/No results for “zzz”/)).toBeInTheDocument();
  });

  it("prompts to pick a category when none are selected, without calling the API", async () => {
    const f = mockFetch({});
    renderFeed({ categories: [] });
    expect(await screen.findByText("Pick at least one category")).toBeInTheDocument();
    expect(f).not.toHaveBeenCalled();
  });

  it("shows an error with a working retry", async () => {
    let fail = true;
    const handler = (type: "news" | "movie" | "social") => () => (fail ? { __status: 500 } : src(type, 1)());
    mockFetch({ "/api/news": handler("news"), "/api/movies": handler("movie"), "/api/social": handler("social") });
    renderFeed();
    expect(await screen.findByTestId("error-state")).toHaveTextContent(/news request failed/);
    fail = false;
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findAllByTestId("content-card")).toHaveLength(3);
  });

  it("keeps the feed usable and warns when one source is down", async () => {
    mockFetch({ "/api/news": src("news", 1), "/api/movies": () => ({ __status: 500 }), "/api/social": src("social", 1) });
    renderFeed();
    expect(await screen.findAllByTestId("content-card")).toHaveLength(2);
    expect(screen.getByRole("status")).toHaveTextContent(/1 of 3 sources/);
  });

  it("loads more via the button and hides it when exhausted", async () => {
    let page = 0;
    const paged = (type: "news" | "movie" | "social") => () => {
      page++;
      return {
        items: [makeItem({ id: `${type}-${page}`, type, title: `${type} p${page}` })],
        hasMore: page < 2,
        source: "mock",
      };
    };
    mockFetch({ "/api/news": paged("news"), "/api/movies": src("movie", 0), "/api/social": src("social", 0) });
    renderFeed();
    await screen.findByText("news p1");
    await userEvent.click(screen.getByRole("button", { name: /load more/i }));
    await screen.findByText("news p2");
    expect(screen.getAllByTestId("content-card")).toHaveLength(2);
    await waitFor(() => expect(screen.queryByRole("button", { name: /load more/i })).toBeNull());
  });

  it("favoriting a card updates its button state", async () => {
    mockFetch({ "/api/news": src("news", 1), "/api/movies": src("movie", 0), "/api/social": src("social", 0) });
    const store = renderFeed();
    await userEvent.click(await screen.findByRole("button", { name: /add news title 0 to favorites/i }));
    expect(store.getState().favorites.ids).toEqual(["news-0"]);
    expect(screen.getByRole("button", { name: /remove news title 0 from favorites/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("lets readers hide a card as less relevant and restore it", async () => {
    mockFetch({ "/api/news": src("news", 2), "/api/movies": src("movie", 0), "/api/social": src("social", 0) });
    const store = renderFeed();
    await screen.findAllByTestId("content-card");
    await userEvent.click(screen.getByRole("button", { name: /show fewer items like news title 0/i }));
    expect(screen.queryByTestId("content-card")).not.toBeInTheDocument();
    expect(store.getState().feedback.lessLikeThis.map((item) => item.id)).toEqual(["news-0"]);
    expect(store.getState().feed.items).toHaveLength(2);
    act(() => store.dispatch(restoreFeedback("news-0")));
    expect(await screen.findAllByTestId("content-card")).toHaveLength(2);
  });

  it("lets readers remove cards from the feed", async () => {
    mockFetch({ "/api/news": src("news", 1), "/api/movies": src("movie", 0), "/api/social": src("social", 0) });
    const store = renderFeed();
    await screen.findByTestId("content-card");
    await userEvent.click(screen.getByRole("button", { name: /remove news title 0 from the feed/i }));
    expect(screen.queryByTestId("content-card")).not.toBeInTheDocument();
    expect(store.getState().feedback.dismissed.map((item) => item.id)).toEqual(["news-0"]);
  });
});
