import { combineReducers, configureStore } from "@reduxjs/toolkit";
import preferences from "./preferencesSlice";
import favorites from "./favoritesSlice";
import feed from "./feedSlice";
import trending from "./trendingSlice";
import auth from "./authSlice";
import feedback from "./feedbackSlice";

const rootReducer = combineReducers({ preferences, favorites, feed, trending, auth, feedback });

export function makeStore(preloadedState?: Partial<ReturnType<typeof rootReducer>>) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];
