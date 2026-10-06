import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ContentItem } from "@/types";

export interface FeedbackState {
  dismissed: ContentItem[];
  lessLikeThis: ContentItem[];
}

const initialState: FeedbackState = { dismissed: [], lessLikeThis: [] };

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    dismissContent(state, { payload }: PayloadAction<ContentItem>) {
      if (!state.dismissed.some((item) => item.id === payload.id)) state.dismissed.unshift(payload);
      state.lessLikeThis = state.lessLikeThis.filter((item) => item.id !== payload.id);
    },
    recommendLess(state, { payload }: PayloadAction<ContentItem>) {
      if (!state.lessLikeThis.some((item) => item.id === payload.id)) state.lessLikeThis.unshift(payload);
      state.dismissed = state.dismissed.filter((item) => item.id !== payload.id);
    },
    restoreFeedback(state, { payload }: PayloadAction<string>) {
      state.dismissed = state.dismissed.filter((item) => item.id !== payload);
      state.lessLikeThis = state.lessLikeThis.filter((item) => item.id !== payload);
    },
    clearFeedback(state) { state.dismissed = []; state.lessLikeThis = []; },
    hydrateFeedback(_state, { payload }: PayloadAction<Partial<FeedbackState> | undefined>) {
      const valid = (items: unknown): items is ContentItem[] => Array.isArray(items) && items.every((item) => item && typeof item.id === "string" && typeof item.title === "string");
      return {
        dismissed: valid(payload?.dismissed) ? payload.dismissed : [],
        lessLikeThis: valid(payload?.lessLikeThis) ? payload.lessLikeThis : [],
      };
    },
  },
});

export const { dismissContent, recommendLess, restoreFeedback, clearFeedback, hydrateFeedback } = feedbackSlice.actions;
export default feedbackSlice.reducer;
