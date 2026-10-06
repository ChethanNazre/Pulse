# Pulse

Pulse is a responsive, personalized content dashboard for news, movie recommendations, and social posts. Users can filter and search a unified feed, reorder cards, save favorites, adjust appearance and categories, create a local profile, receive feed refresh signals, and switch between English and Spanish.

## Assignment audit

### A. Complete

The app implements preference persistence, NewsAPI and TMDB server adapters, unified/trending/favorites views, cards, search and debounce, pagination, drag and keyboard reorder, theme toggle, Framer Motion interactions, Redux async architecture, unit/integration coverage, and local mock sign-in/profile. English/Spanish switching and SSE-driven refreshes are also implemented. Live NewsAPI and TMDB credentials are not present in this checkout, so live items will appear only after you configure those keys.

### B. Partially complete

Live provider credentials must be configured before real NewsAPI or TMDB data can be displayed. The assignment permits mock social content, but the mock feed is disabled by default. SSE signals a refetch instead of receiving content pushed by an upstream provider. English and Spanish cover the app UI, while legal copy and source-provided content keep their original language. Mock auth is deliberately browser-local and cannot authenticate or authorize real users.

### C. Missing

The core assignment features are represented in the app. Submission artifacts that are not in this workspace remain outstanding: a public GitHub URL, hosted live URL, and demo video. Live provider credentials must be replaced with rotated values before data verification. No external account or hosting changes were made.

### D. Weak and worth improving

For a production service, replace mock auth with a real identity provider, connect a permitted social API, push provider events instead of periodic refresh hints, localize the legal pages, and add provider-specific monitoring/rate-limit handling. Review legal policy for the actual hosting operator before launch.

| Requirement | Status | Implementation |
|---|---|---|
| Personalized categories and local preferences | Complete | Redux preferences with guarded localStorage hydration; six categories and dark mode |
| News API | Partial until configured | Server-side NewsAPI proxy is implemented; requires `NEWS_API_KEY`, displays a provider error instead of invented content when missing or unavailable |
| Recommendations API | Partial until configured | TMDB movie discovery and search are implemented; requires `TMDB_API_KEY`, displays a provider error instead of invented content when missing or unavailable |
| Social API | Connected | Public posts from Mastodon.social tag timelines are mapped into the feed; sample posts remain opt-in |
| Unified interactive content cards | Complete | Cards show source publication dates, publisher imagery where supplied, concise actions, favorites, reorder, dismiss, and recommendation feedback |
| Pagination / infinite scroll | Complete | IntersectionObserver and a visible Load more fallback; thunk guards duplicate page requests |
| Responsive shell and navigation | Complete | Desktop sidebar with a hide/show control, compact bottom mobile navigation, sticky search header |
| Feed, trending, favorites, search | Complete | Dedicated sections and category-aware source search |
| Debounced search | Complete | 400 ms debounce before the query enters Redux/API requests |
| Drag and drop | Complete | Framer Motion reorder with separate keyboard up/down controls |
| Dark mode | Complete | CSS custom properties, local persistence, system-theme first-paint fallback |
| Per-card recommendations | Complete | Swipe right to dismiss; swipe left to suppress matching type/category suggestions; Settings can restore items, reset choices, or disable gestures |
| Motion and loading states | Complete | Framer Motion card/reorder/favorite interactions, skeletons, loading indicator, reduced-motion handling |
| Redux Toolkit and async logic | Complete | Feature slices, `createAsyncThunk`, request race protection, parallel source requests |
| Unit and integration coverage | Complete | Jest and React Testing Library cover slices, utilities, cards, sign-in gating, and feed success/empty/error/retry flows |
| Playwright E2E coverage | Written; execution blocked in this environment | Search, ordering, favorites, settings, trending, pagination, error recovery, profile/language, responsive cards, sign-in gating, and legal pages; the Playwright runner exits with Windows `spawn EPERM` before test collection |
| Mock authentication/profile | Complete for assignment scope | News article links request a browser-local profile; settings support profile management. No password or server account is used |
| Real-time feed | Partial by design | SSE sends refresh events every 30 seconds; the client refetches current sources. It is a refresh signal, not a push stream from upstream providers |
| Internationalization | Partial | `react-i18next` supports English and Spanish for the primary shell/feed/settings controls; long-form legal and some secondary content copy remains English |
| Performance | Partial | Debounce, lazy-loaded images, paginated API calls, parallel provider requests, and stale-request protection are implemented. Large-feed virtualization and measured production profiling are not |
| Accessibility audit | Partial | Semantic landmarks, keyboard controls, focus indicators, and accessible sign-in are implemented. A formal WCAG audit and screen-reader test have not been completed |
| Security | Partial for production use | API credentials stay server-side; URL parameters are bounded/validated; external links use `noopener noreferrer`; the local profile is not an authorization boundary. Keep provider keys private and rotate any key that may have been exposed |
| Public GitHub repository, live deployment, demo video | Not included | These require account/hosting access and a recorded/submitted URL. The app is prepared for deployment, but no external publishing was performed |

## Architecture

- **Next.js 14 App Router** renders the application and provides same-origin `/api/news`, `/api/movies`, `/api/social`, and `/api/events` endpoints.
- **React and TypeScript** implement the views, cards, shell, and interaction components.
- **Redux Toolkit** owns preferences, authentication profile, feed, trending items, favorites, and per-card feedback. Feed and trending loads use thunks. Source requests run concurrently; individual source failures degrade to a warning when other sources work.
- **Server API adapters** keep NewsAPI and TMDB secrets on the server. Query values are bounded and categories are allow-listed. Live-provider failures return clear errors rather than substituting fictional items. Social posts are fetched from Mastodon.social's public tag timelines without credentials. Sample content requires the explicit `USE_SAMPLE_DATA=true` opt-in.
- **Browser persistence** hydrates preferences, favorites, mock profile, and card feedback after mount so defaults cannot overwrite saved state. The profile contains only a display name and email; it is not an identity service.
- **SSE** at `/api/events` sends periodic refresh events and keep-alive comments. The browser closes the stream when the app shell unmounts.
- **Internationalization** uses `i18next` and `react-i18next`. English and Spanish are available from Settings; language preference persists locally.

## Setup

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Add live provider credentials as described below to load news and movie data. The default local configuration does not show invented items.

## Environment variables

Copy `.env.example` to `.env.local`. Add your NewsAPI and TMDB credentials locally. Do not paste keys into source files or chat.

| Variable | Purpose |
|---|---|
| `NEWS_API_KEY` | NewsAPI key, read only in the `/api/news` route |
| `TMDB_API_KEY` | TMDB API Read Access Token, read only in `/api/movies` |
| `USE_SAMPLE_DATA` | Leave `false`; set `true` only for an explicitly labeled local test/demo source. Playwright sets this for its isolated test server |
| `NEXT_PUBLIC_SITE_URL` | Canonical production URL, including `https://` |
| `NEXT_PUBLIC_SITE_OPERATOR` | Operator name shown on legal pages |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Contact address shown on legal pages |

Never add real credentials to source control or expose provider keys through `NEXT_PUBLIC_` variables. Missing keys or unavailable providers produce an actionable error state instead of fake content. The social feed uses Mastodon.social's public API and requires no API key.

Create a NewsAPI key from [NewsAPI](https://newsapi.org/register) and a TMDB API Read Access Token in your [TMDB account API settings](https://developer.themoviedb.org/docs/authentication-application). Put them in `.env.local`, then restart the server.

## Authentication and profile

The Settings page offers mock sign-in and sign-out with a name and email. News article links require this local profile before continuing. The profile is stored in this browser only. There is no password, account backend, cross-device identity, or authorization boundary. This is a UI flow only; it does not protect content at a server boundary. Replace this adapter with a real identity provider before using the app for private data.

## User flow

1. Open Feed to see the current date and browse available news, movie, and social items. Article cards use the publisher's date and photo when NewsAPI provides them; missing images use a neutral icon instead of invented photography.
2. Search; Pulse waits 400 ms after the last keystroke before fetching.
3. Drag a card handle to reorder it, or use its labeled up/down buttons with a keyboard.
4. Save items with the heart control and find them under Favorites.
5. Open Trending to see ranked results by source.
6. Select Read More on a news card to create or use a local profile before continuing to the publisher. In Settings, manage that profile, select categories, choose light/dark appearance, and select English/Spanish.
7. Hide or restore the desktop sidebar from the header or Settings. Swipe cards right to dismiss and left to reduce matching suggestions. Restore individual choices or reset all of them under Feed controls in Settings.
8. Keep Feed open to receive periodic SSE refresh signals. Updates are fetched from the configured live APIs.

## Accessibility and design

The interface includes semantic landmarks, skip navigation, visible focus rings, labeled controls, current-page navigation state, status/error announcements, touch-sized controls, keyboard reorder alternatives, responsive navigation, dark theme tokens, and reduced-motion support. Card images are lazy-loaded. Motion is limited to short transitions, card interaction, and drag feedback.

## Verification

```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npx playwright install chromium   # one-time browser setup
npm run test:e2e
npm run build
```

Unit and integration tests use Jest and React Testing Library. Playwright runs against a production build on port 3100 and enables generated fixture content only on that isolated server. E2E can use an existing Chromium binary by setting `PW_CHROMIUM_PATH`.

The current sandbox cannot launch Playwright workers and returns `spawn EPERM` before tests start. Re-run `npm run test:e2e` in a standard local terminal or CI runner to complete browser verification.

## Deployment

Deploy as a standard Next.js application on a Node-compatible host. Set both live provider keys and the three public site/contact values in the host's environment settings. Keep `USE_SAMPLE_DATA=false`. Build with `npm run build`, then serve with `npm start`. Confirm the privacy and terms pages accurately reflect the deployment and any additional analytics or data collection. The included `npm run launch-check` checks local launch prerequisites; it does not configure DNS, hosting, or external services.

## Known limits

- Social posts come from Mastodon.social's public tag timelines. Availability and coverage depend on public posts using the selected category tags; the instance can rate-limit or restrict public access.
- SSE refreshes the feed periodically but does not create real upstream news pushes.
- Mock authentication is for demonstrating profile flows only.
- Spanish is supported for the main navigation, search/feed controls, and key settings labels; legal pages and some feed copy remain English.
- A public repository URL, deployed live link, and demo video still need to be supplied as submission artifacts.
