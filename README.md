# Pulse --- Personalized Content Dashboard

> A personalized, responsive content dashboard built with React,
> Next.js, TypeScript, and Redux Toolkit.

**Live Demo:** https://mypulse.vercel.app/

------------------------------------------------------------------------

## 1. Project Overview

Pulse is a Personalized Content Dashboard designed to bring multiple
content sources into one interactive interface.

The application combines:

-   News content
-   Movie recommendations
-   Social posts
  
The dashboard will present content such as news, recommendations, and social posts 
from multiple sources, and it will allow users to interact with and customize their 
dashboard experience. You will be challenged to use React, Next.js, TypeScript, 
Redux Toolkit, API Integration, and Testing to create an interactive, user-centric platform.

------------------------------------------------------------------------

## 2. Objective

The main goal is to give users one place where they can discover
content, search across sources, personalize their feed, save favorites,
reorder or dismiss content, and adjust their viewing preferences.

The project focuses on both the user experience and the frontend
architecture. It uses reusable React components, centralized state
management, server-side API handling, responsive layouts, local
persistence, animations, and automated testing.

------------------------------------------------------------------------

## 3. Key Features

### 3.1 Unified Content Feed

Pulse combines three main content types into one feed:

-   **News** from WebProNews / NewsAPI integration
-   **Movies** from TMDB
-   **Social posts** from Mastodon's public tag timelines

Each card keeps the content source visible and provides relevant actions
such as:

-   Read More
-   Play Now
-   View Post
-   Favorite
-   Reorder
-   Remove
-   Show fewer similar items

------------------------------------------------------------------------

### 3.2 Personalization

Users can choose categories that influence the content experience.

Available categories include:

-   Technology
-   Sports
-   Finance
-   Entertainment
-   Health
-   Science

The selected preferences influence the news feed and trending content.

Preferences are persisted locally in the browser so they can be restored
when the application loads again.

------------------------------------------------------------------------

### 3.3 Search

The search experience works across:

-   News
-   Movies
-   Social posts

A short debounce is applied to the search input. Pulse waits
approximately **400 ms after the user stops typing** before the query is
sent into the feed request.

This reduces unnecessary requests caused by making a request for every
individual keystroke.

------------------------------------------------------------------------

### 3.4 Trending

The Trending section provides ranked content organized by source.

It gives users another way to discover content without relying only on
the personalized feed.

------------------------------------------------------------------------

### 3.5 Favorites

Users can save content using the heart action.

Saved content is collected in the Favorites page and is also persisted
in browser storage.

------------------------------------------------------------------------

### 3.6 Feed Feedback

Users can provide feedback on individual cards.

Supported interactions include:

-   Dismissing content
-   Asking for fewer similar suggestions
-   Restoring feedback
-   Resetting feedback

Gesture controls can also be enabled or disabled from Settings.

------------------------------------------------------------------------

### 3.7 Reordering

Users can change the order of content using the available reorder
controls.

The application supports:

-   Drag/reorder interaction
-   Labeled up/down controls
-   Keyboard-accessible reordering through the up/down controls

------------------------------------------------------------------------

### 3.8 Responsive Design

The interface adapts to different screen sizes.

### Desktop

The desktop layout includes:

-   Sidebar navigation
-   Sticky header
-   Search
-   Theme control
-   Date control
-   Profile controls

### Smaller Screens

On smaller screens:

-   Navigation moves into a compact bottom bar
-   Content cards reflow
-   Card actions remain available

------------------------------------------------------------------------

### 3.9 Theme and Language

Users can switch between:

-   Light mode
-   Dark mode

The application also supports:

-   English
-   Spanish

These preferences are stored locally.

------------------------------------------------------------------------

### 3.10 Motion and Accessibility

Framer Motion is used for short interface transitions involving:

-   Cards
-   Favorites
-   Reordering

The application also includes reduced-motion support.

Keyboard-accessible controls are provided for content reordering.

------------------------------------------------------------------------

## 4. Technology Stack

### Frontend

-   React
-   Next.js
-   Next.js App Router
-   TypeScript

### State Management

-   Redux Toolkit
-   Redux Toolkit thunks

### External Data

-   NewsAPI / news provider adapter
-   TMDB
-   Mastodon public tag timelines

### UI / Interaction

-   Framer Motion
-   Responsive CSS/layout
-   Keyboard-accessible controls

### Testing

-   Jest
-   React Testing Library
-   Playwright

### Deployment

-   Vercel

------------------------------------------------------------------------

## 5. Application Architecture

The application separates UI, state management, server-side API access,
and external content providers.

A simplified flow is:

``` text
User
  │
  ▼
Pulse UI
  │
  ├── Dashboard / Feed
  ├── Search
  ├── Trending
  ├── Favorites
  └── Settings
        │
        ▼
   Redux Toolkit
        │
        ├── Preferences
        ├── Profile
        ├── Feed
        ├── Trending
        ├── Favorites
        └── Card Feedback
        │
        ▼
 Redux Toolkit Thunks
        │
        ▼
 Next.js Server Routes
        │
        ├── News Provider
        ├── TMDB
        └── Mastodon
```

### State Management

Redux stores the main application state, including:

-   User preferences
-   Local profile information
-   Feed items
-   Trending items
-   Favorites
-   Individual card feedback

Asynchronous operations are handled through Redux Toolkit thunks.

News and movie requests can run in parallel through server routes.
Request guards are used to prevent an older response from replacing a
newer result.

------------------------------------------------------------------------

## 6. API and Data Handling

Pulse uses adapters for external content providers.

### News

News requests are handled through the application's server-side
integration.

### Movies

Movie recommendations and movie-related content are retrieved through
TMDB.

### Social Content

Social posts are retrieved from Mastodon's public tag timelines.

### Server-side Credentials

Provider credentials are kept on the server rather than being exposed
directly in the browser.

This is especially important for services that require API credentials.

### Provider Failure Handling

If an external provider fails, Pulse reports the problem instead of
generating or displaying invented content.

This keeps the feed dependent on actual provider responses.

------------------------------------------------------------------------

## 7. Persistence

Pulse restores locally stored information after the application mounts.

The browser stores information such as:

-   Selected preferences
-   Favorites
-   Local profile details
-   Card feedback
-   Theme preference
-   Language preference

This allows the application to preserve the user's experience between
sessions on the same browser.

> **Important:** The local profile is for demonstration purposes. It is
> not a real authentication system or authorization boundary.

------------------------------------------------------------------------

## 8. User Flow

The typical user flow is:

``` text
Open Pulse
    │
    ▼
View Personalized Feed
    │
    ├── Browse News
    ├── Browse Movies
    └── Browse Social Posts
    │
    ▼
Search / Discover Content
    │
    ├── Search
    ├── Trending
    └── Load More
    │
    ▼
Interact With Content
    │
    ├── Open Content
    ├── Favorite
    ├── Reorder
    ├── Dismiss
    └── Request Fewer Similar Items
    │
    ▼
Customize Preferences
    │
    ├── Categories
    ├── Theme
    ├── Language
    └── Feed Controls
    │
    ▼
Preferences Persist Locally
    │
    ▼
Return to Personalized Feed
```

### Example User Journey

1.  The user opens Pulse and sees the personalized feed.
2.  The user browses news, movies, and social posts.
3.  The user saves an interesting item using the heart icon.
4.  The user searches for a topic or title.
5.  The user checks Trending for additional discovery.
6.  The user opens Favorites to return to saved content.
7.  The user opens Settings and selects preferred categories.
8.  The user changes the theme or language if required.
9.  The selected preferences and saved content remain available after
    the application reloads.

------------------------------------------------------------------------

## 9. Project Setup

### Prerequisites

Before running Pulse locally, make sure you have:

-   Node.js installed
-   npm installed
-   Access to the required external API credentials
-   Git installed if cloning the repository

### Clone the Repository

``` bash
git clone <YOUR_REPOSITORY_URL>
cd <PROJECT_DIRECTORY>
```

### Install Dependencies

``` bash
npm install
```

### Environment Variables

Create a local environment file based on the environment variables
expected by the project.

Example:

``` env
NEWS_API_KEY=your_news_api_key
TMDB_API_KEY=your_tmdb_api_key
```

Use the exact variable names expected by the project's server/API
adapter files.

Do not commit real API keys to GitHub.

### Start the Development Server

``` bash
npm run dev
```

Then open:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

## 10. Available Scripts

The project README/setup should use the scripts defined in
`package.json`.

Typical commands used for the project include:

``` bash
npm run dev
```

Starts the Next.js development server.

``` bash
npm run build
```

Creates a production build.

``` bash
npm run start
```

Starts the production server after a successful build.

For testing:

``` bash
npm test
```

Runs the Jest test suite when the corresponding test script is
configured.

For Playwright, use the project's configured Playwright command from
`package.json`.

> If a script name differs in the repository's `package.json`, use the
> repository-defined command rather than adding a new command to this
> README.

------------------------------------------------------------------------

## 11. Testing

Pulse includes multiple levels of testing.

### Jest

Jest is used for unit-level testing.

### React Testing Library

React Testing Library covers frontend behavior such as:

-   State behavior
-   Utilities
-   Cards
-   Feed flows

### Playwright

Playwright end-to-end coverage has been written for the application.

At the time of this submission, the Playwright suite still needs a
successful run in a standard environment.

This is documented intentionally rather than claiming that the complete
end-to-end suite has passed.

------------------------------------------------------------------------

## 12. Error Handling

The application is designed to handle external provider problems
gracefully.

Instead of filling missing provider data with invented content, Pulse
reports the provider error.

This is particularly relevant because the dashboard depends on multiple
external data sources.

------------------------------------------------------------------------

## 13. Security Considerations

The project includes several basic security-oriented decisions:

-   Provider API credentials remain server-side.
-   External links use safe link settings.
-   The local profile is clearly treated as demonstration data.
-   The local profile is not presented as a real authentication or
    authorization system.

### Limitation

The current local profile should not be considered production
authentication.

A production application would require a dedicated authentication and
authorization system.

------------------------------------------------------------------------

## 14. Deployment

The live Pulse application is deployed on Vercel.

**Production URL:**

https://mypulse.vercel.app/

For a Vercel deployment:

1.  Connect the project repository to Vercel.
2.  Configure the required environment variables in the Vercel project
    settings.
3.  Deploy the application.
4.  Verify that the server-side API integrations work with the
    configured credentials.
5.  Open the production URL and verify the main feed, search,
    preferences, favorites, and responsive layouts.

------------------------------------------------------------------------

## 15. Project Structure

The exact folder structure may evolve during development, but the
application follows the following conceptual separation:

``` text
Pulse/
├── app/
│   ├── pages / routes
│   └── server-side integrations
│
├── components/
│   ├── Feed
│   ├── Cards
│   ├── Navigation
│   ├── Search
│   └── Settings
│
├── store/
│   ├── Redux store
│   └── Redux slices / async logic
│
├── adapters/
│   ├── News provider
│   ├── TMDB
│   └── Mastodon
│
├── tests/
│   ├── Jest
│   ├── React Testing Library
│   └── Playwright
│
├── public/
│
├── package.json
└── README.md
```

> The structure above describes the application's architectural
> organization. Use the actual repository tree as the source of truth if
> a reviewer needs exact filenames.

------------------------------------------------------------------------

## 16. What I Focused On

The implementation was designed around four main goals:

### 1. User Experience

The dashboard should make it easy to:

-   Discover content
-   Search
-   Save content
-   Customize preferences
-   Navigate between different content types

### 2. Reusable Frontend Architecture

React and Next.js are used to structure the application into reusable UI
and route-level responsibilities.

### 3. Reliable Data Handling

External provider requests are handled through server-side integrations,
with request guards and provider failure handling.

### 4. Real User Interaction

The application goes beyond displaying API results by allowing users to:

-   Personalize categories
-   Favorite content
-   Reorder content
-   Dismiss content
-   Ask for fewer similar items
-   Change theme and language
-   Discover trending content

------------------------------------------------------------------------

## 17. Known Limitations

The following limitations are intentionally documented:

1.  The local profile is for demonstration and is not real
    authentication.
2.  Provider availability depends on the external APIs/services.
3.  Playwright end-to-end coverage is written but still needs a
    successful run in a standard environment.
4.  Browser storage is local to the user's browser and is not a
    server-side user database.
5.  Exact setup commands should always match the scripts currently
    defined in `package.json`.

------------------------------------------------------------------------

## 18. Future Improvements

If the project were extended beyond the assignment, possible
improvements would include:

-   Real user authentication
-   Server-side user profiles
-   Cloud persistence for preferences and favorites
-   More content providers
-   More advanced recommendation logic
-   More comprehensive end-to-end testing
-   Better analytics around user interactions
-   Production-grade monitoring and error reporting

------------------------------------------------------------------------

## 19. Demo Flow

For the five-minute project demonstration, the recommended order is:

1.  **Main Feed** --- show news, movies, and social posts.
2.  **Content Interaction** --- favorite and reorder content.
3.  **Settings** --- demonstrate categories, theme, language, and feed
    controls.
4.  **Search** --- search across content.
5.  **Trending** --- show ranked discovery.
6.  **Favorites** --- show saved content.
7.  **Load More** --- demonstrate additional content loading.
8.  **Responsive Layout** --- show desktop and smaller-screen
    navigation.
9.  **Implementation** --- briefly explain React, Next.js, TypeScript,
    Redux Toolkit, thunks, server routes, and API adapters.
10. **Persistence and Security** --- explain browser storage and
    server-side credentials.
11. **Testing** --- show the test summary and README commands.

------------------------------------------------------------------------

## 20. Conclusion

Pulse was built as a practical example of a modern personalized frontend
application.

It combines multiple external content sources with a responsive
React/Next.js interface, centralized Redux state management, user
personalization, search and discovery, favorites, feed feedback, local
persistence, animations, server-side API handling, and automated
testing.

The project demonstrates not only how to consume APIs and display data,
but also how to structure an interactive frontend application around a
real user flow.

------------------------------------------------------------------------

## License

This project was created as part of a software development
assignment/demo submission.
