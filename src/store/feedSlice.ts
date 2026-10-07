import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ContentItem, ContentType, LoadStatus } from "@/types";
import { fetchSource, interleave } from "@/lib/api";
import type { RootState } from "./index";

const TYPES: ContentType[] = ["news", "movie", "social"];

export interface FeedState {
  items: ContentItem[];
  status: LoadStatus;
  error: string | null;
  /** Set when some (but not all) sources failed. */
  warning: string | null;
  page: number;
  hasMore: boolean;
  query: string;
  /** Fingerprint (categories + query) of the data currently held, so revisiting the feed doesn't refetch or lose drag order. */
  loadedKey: string | null;
  /** Only the latest request may write results (guards against out-of-order responses). */
  activeRequestId: string | null;
}

const initialState: FeedState = {
  items: [],
  status: "idle",
  error: null,
  warning: null,
  page: 0,
  hasMore: true,
  query: "",
  loadedKey: null,
  activeRequestId: null,
};

interface FeedResult {
  items: ContentItem[];
  hasMore: boolean;
  warning: string | null;
  reset: boolean;
  page: number;
}

/**
 * Fetches one page from all three sources in parallel. `reset` starts over
 * (new query / changed preferences); otherwise the next page is appended.
 */
export const fetchFeed = createAsyncThunk<FeedResult, { reset?: boolean; key?: string } | undefined, { state: RootState }>(
  "feed/fetch",
  async (arg, { getState, rejectWithValue }) => {
    const { feed, preferences } = getState();
    const reset = arg?.reset ?? false;
    const page = reset ? 1 : feed.page + 1;
    const params = { categories: preferences.categories, q: feed.query, page };

    const settled = await Promise.allSettled(TYPES.map((t) => fetchSource(t, params)));
    const ok = settled.flatMap((s) => (s.status === "fulfilled" ? [s.value] : []));
    if (ok.length === 0) {
      const firstFailure = settled.find((s): s is PromiseRejectedResult => s.status === "rejected")?.reason;
      return rejectWithValue(firstFailure instanceof Error ? firstFailure.message : "No live content sources are configured.");
    }

    const failed = settled.length - ok.length;
    return {
      items: interleave(ok.map((r) => r.items)),
      hasMore: ok.some((r) => r.hasMore),
      warning: failed > 0 ? `${failed} of ${settled.length} sources are unavailable right now.` : null,
      reset,
      page,
    };
  },
  {
    // Don't fire a second "load more" while one is in flight.
    condition: (arg, { getState }) => !(getState().feed.status === "loading" && !arg?.reset),
  },
);

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    setQuery(state, { payload }: PayloadAction<string>) {
      state.query = payload.trim();
    },
    /** Persist the order after drag-and-drop. */
        reorderItems(state, { payload }: PayloadAction<string[]>) {
      // `payload` may be only the visible subset (type filter). Re-slot those items into the
      // positions they already occupy so hidden items keep their place.
      const byId = new Map(state.items.map((i) => [i.id, i]));
      const ordered = [...new Set(payload)].flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []));
      const inPayload = new Set(ordered.map((i) => i.id));
      let next = 0;
      state.items = state.items.map((item) => (inPayload.has(item.id) ? ordered[next++] : item));
    },
    moveItem(state, { payload }: PayloadAction<{ id: string; direction: -1 | 1; visibleIds?: string[] }>) {
      const from = state.items.findIndex((i) => i.id === payload.id);
      if (from < 0) return;
      // With a type filter active, swap with the neighbour the user can actually see.
      let to = from + payload.direction;
      if (payload.visibleIds) {
        const at = payload.visibleIds.indexOf(payload.id);
        const neighbour = payload.visibleIds[at + payload.direction];
        if (at < 0 || neighbour === undefined) return;
        to = state.items.findIndex((i) => i.id === neighbour);
      }
      if (to < 0 || to >= state.items.length) return;
      [state.items[from], state.items[to]] = [state.items[to], state.items[from]];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.activeRequestId = action.meta.requestId;
        if (action.meta.arg?.reset) {
          state.items = [];
          state.page = 0;
          state.hasMore = true;
          state.warning = null;
          state.loadedKey = action.meta.arg.key ?? null;
        }
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        if (state.activeRequestId !== action.meta.requestId) return; // superseded
        const seen = new Set(state.items.map((i) => i.id));
        state.items.push(...action.payload.items.filter((i) => !seen.has(i.id)));
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
        state.warning = action.payload.warning;
        state.status = "succeeded";
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        if (state.activeRequestId !== action.meta.requestId) return;
        state.status = "failed";
        state.error = (action.payload as string) ?? action.error.message ?? "Something went wrong";
      });
  },
});

export const { setQuery, reorderItems, moveItem } = feedSlice.actions;
export default feedSlice.reducer;
