import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ContentItem } from "@/types";

export interface FavoritesState {
  byId: Record<string, ContentItem>;
  ids: string[];
}

const initialState: FavoritesState = { byId: {}, ids: [] };

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    toggleFavorite(state, { payload }: PayloadAction<ContentItem>) {
      if (state.byId[payload.id]) {
        delete state.byId[payload.id];
        state.ids = state.ids.filter((id) => id !== payload.id);
      } else {
        state.byId[payload.id] = payload;
        state.ids.unshift(payload.id);
      }
    },
    hydrateFavorites(state, { payload }: PayloadAction<Partial<FavoritesState> | undefined>) {
      if (!payload || typeof payload.byId !== "object" || !Array.isArray(payload.ids)) return;
      state.byId = payload.byId as Record<string, ContentItem>;
      state.ids = payload.ids.filter((id) => id in state.byId);
    },
  },
});

export const { toggleFavorite, hydrateFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
