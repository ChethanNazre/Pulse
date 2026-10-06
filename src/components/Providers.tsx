"use client";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/store";
import { hydratePreferences } from "@/store/preferencesSlice";
import { hydrateFavorites } from "@/store/favoritesSlice";
import { loadPersisted, savePersisted } from "@/lib/storage";
import { hydrateAuth } from "@/store/authSlice";
import i18n from "@/lib/i18n";
import { fetchFeed } from "@/store/feedSlice";
import { MotionConfig } from "framer-motion";
import { hydrateFeedback } from "@/store/feedbackSlice";

export default function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | undefined>(undefined);
  if (!storeRef.current) storeRef.current = makeStore();
  const store = storeRef.current;

  useEffect(() => {
    // 1) Load saved settings; 2) only then start persisting, so defaults never clobber saved data.
    const saved = loadPersisted();
    store.dispatch(hydratePreferences(saved.preferences as never));
    store.dispatch(hydrateFavorites(saved.favorites as never));
    store.dispatch(hydrateAuth(saved.auth?.profile));
    store.dispatch(hydrateFeedback(saved.feedback));
    const language = saved.preferences?.language ?? "en";
    void i18n.changeLanguage(language);

    let last = "";
    const apply = () => {
      const { preferences, favorites, auth, feedback } = store.getState();
      document.documentElement.classList.toggle("dark", preferences.darkMode);
      document.documentElement.lang = preferences.language;
      const { hydrated: _h, ...prefs } = preferences;
      const snapshot = JSON.stringify({ preferences: prefs, favorites, auth, feedback });
      if (snapshot !== last) {
        last = snapshot;
        savePersisted({ preferences: prefs, favorites, auth, feedback });
      }
    };
    apply();
    const unsubscribe = store.subscribe(apply);
    const events = typeof EventSource === "undefined" ? null : new EventSource("/api/events");
    events?.addEventListener("feed-update", () => {
      const { preferences, feed } = store.getState();
      if (preferences.hydrated && preferences.categories.length) {
        const key = `${preferences.categories.join(",")}|${feed.query}`;
        store.dispatch(fetchFeed({ reset: true, key }));
      }
    });
    return () => { unsubscribe(); events?.close(); };
  }, [store]);

  return <Provider store={store}><MotionConfig reducedMotion="user">{children}</MotionConfig></Provider>;
}
