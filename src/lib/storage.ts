import type { ContentItem } from "@/types";

const KEY = "dashboard:v1";

export interface PersistedState {
  preferences?: { categories: string[]; darkMode: boolean; displayName: string; language?: "en" | "es"; sidebarHidden?: boolean; swipeActionsEnabled?: boolean };
  favorites?: { byId: Record<string, unknown>; ids: string[] };
  auth?: { profile: { name: string; email: string } | null };
  feedback?: { dismissed?: ContentItem[]; lessLikeThis?: ContentItem[] };
}

export function loadPersisted(): PersistedState {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : {};
  } catch {
    return {}; // storage blocked or corrupt JSON - start fresh
  }
}

export function savePersisted(state: PersistedState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota exceeded / private mode: persistence is best-effort */
  }
}

export const STORAGE_KEY = KEY;
