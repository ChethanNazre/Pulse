import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { CATEGORIES, type Category } from "@/types";

export interface PreferencesState {
  categories: Category[];
  darkMode: boolean;
  displayName: string;
  language: "en" | "es";
  sidebarHidden: boolean;
  swipeActionsEnabled: boolean;
  /** True once persisted settings have been read from localStorage (not itself persisted). */
  hydrated: boolean;
}

export const initialPreferences: PreferencesState = {
  categories: ["technology", "science", "entertainment"],
  darkMode: true,
  displayName: "Guest",
  language: "en",
  sidebarHidden: false,
  swipeActionsEnabled: true,
  hydrated: false,
};

const isCategory = (c: unknown): c is Category => (CATEGORIES as readonly string[]).includes(c as string);

const preferencesSlice = createSlice({
  name: "preferences",
  initialState: initialPreferences,
  reducers: {
    toggleCategory(state, { payload }: PayloadAction<Category>) {
      state.categories = state.categories.includes(payload)
        ? state.categories.filter((c) => c !== payload)
        : [...state.categories, payload];
    },
    setDarkMode(state, { payload }: PayloadAction<boolean>) {
      state.darkMode = payload;
    },
    setDisplayName(state, { payload }: PayloadAction<string>) {
      state.displayName = payload.slice(0, 40);
    },
    setLanguage(state, { payload }: PayloadAction<"en" | "es">) { state.language = payload; },
    setSidebarHidden(state, { payload }: PayloadAction<boolean>) { state.sidebarHidden = payload; },
    setSwipeActionsEnabled(state, { payload }: PayloadAction<boolean>) { state.swipeActionsEnabled = payload; },
    /** Merges persisted values, ignoring anything malformed. */
    hydratePreferences(state, { payload }: PayloadAction<Partial<PreferencesState> | undefined>) {
      state.hydrated = true;
      if (!payload) return;
      if (Array.isArray(payload.categories)) state.categories = payload.categories.filter(isCategory);
      if (typeof payload.darkMode === "boolean") state.darkMode = payload.darkMode;
      if (typeof payload.displayName === "string") state.displayName = payload.displayName.slice(0, 40);
      if (payload.language === "en" || payload.language === "es") state.language = payload.language;
      if (typeof payload.sidebarHidden === "boolean") state.sidebarHidden = payload.sidebarHidden;
      if (typeof payload.swipeActionsEnabled === "boolean") state.swipeActionsEnabled = payload.swipeActionsEnabled;
    },
  },
});

export const { toggleCategory, setDarkMode, setDisplayName, setLanguage, setSidebarHidden, setSwipeActionsEnabled, hydratePreferences } = preferencesSlice.actions;
export default preferencesSlice.reducer;
