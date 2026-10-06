import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface LocalProfile { name: string; email: string }
interface AuthState { profile: LocalProfile | null }
const authSlice = createSlice({
  name: "auth", initialState: { profile: null } as AuthState,
  reducers: {
    signInLocally(state, action: PayloadAction<LocalProfile>) {
      state.profile = { name: action.payload.name.trim().slice(0, 40) || "Guest", email: action.payload.email.trim().slice(0, 254) };
    },
    updateProfileName(state, action: PayloadAction<string>) {
      if (state.profile) state.profile.name = action.payload.trim().slice(0, 40) || "Guest";
    },
    signOutLocally(state) { state.profile = null; },
    hydrateAuth(_state, action: PayloadAction<LocalProfile | null | undefined>) {
      const p = action.payload;
      return { profile: p && typeof p.name === "string" && typeof p.email === "string"
        ? { name: p.name.slice(0, 40), email: p.email.slice(0, 254) }
        : null };
    },
  },
});
export const { signInLocally, updateProfileName, signOutLocally, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
