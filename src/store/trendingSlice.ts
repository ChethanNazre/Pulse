import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ContentItem, ContentType, LoadStatus } from "@/types";
import { fetchSource } from "@/lib/api";
import type { RootState } from "./index";

const TYPES: ContentType[] = ["news", "movie", "social"];

export interface TrendingState {
  items: ContentItem[];
  status: LoadStatus;
  error: string | null;
}

export const fetchTrending = createAsyncThunk<ContentItem[], void, { state: RootState }>(
  "trending/fetch",
  async (_, { getState, rejectWithValue }) => {
    const { categories } = getState().preferences;
    const settled = await Promise.allSettled(TYPES.map((t) => fetchSource(t, { categories, trending: true })));
    const ok = settled.flatMap((s) => (s.status === "fulfilled" ? s.value.items : []));
    if (ok.length === 0 && settled.every((s) => s.status === "rejected")) {
      return rejectWithValue("Couldn't load trending items.");
    }
    return ok;
  },
);

const trendingSlice = createSlice({
  name: "trending",
  initialState: { items: [], status: "idle", error: null } as TrendingState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrending.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(fetchTrending.fulfilled, (s, a) => {
        s.items = a.payload;
        s.status = "succeeded";
      })
      .addCase(fetchTrending.rejected, (s, a) => {
        s.status = "failed";
        s.error = (a.payload as string) ?? "Something went wrong";
      });
  },
});

export default trendingSlice.reducer;
