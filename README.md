# 🎬 TasteFlicks — Smart Cinematic Universe & Recommendation Tracker

TasteFlicks is a modern, high-performance web platform that turns your movie and TV watch history into personalized insights, gamified dashboards, and AI-powered recommendations.

Built with **React 19, Vite, Tailwind CSS, TanStack Query, Supabase, and a FastAPI vector recommendation service**, TasteFlicks delivers a dark, cinematic, and responsive experience for film and TV enthusiasts.

---

## 🌟 Key Features

### 🎬 Discovery & Exploration
- **Cinema & TV Discovery**: Explore trending, popular, top-rated, upcoming, and on-the-air titles powered by TMDB.
- **Unified Multi-Search**: Fast multi-search across movies, TV series, and people with pagination and primary match spotlight.
- **Deep Media Details**: Rich backdrops, YouTube trailers, interactive 10-star rating system, streaming provider logos, full cast carousels, and related title suggestions.
- **Person Filmography**: Actor/crew credit browsers with client-side windowed pagination and movie/TV toggles.

### 🧠 Personalized AI Recommendations (Movie-Focused)
- **Vector-Based Content Engine**: Personalized movie recommendations computed via TF-IDF vectorization and cosine similarity over a curated cinema dataset.
- **Taste Profile Optimization**: The engine weights positive ratings, discounts lower ratings, and filters out titles marked as "Not for Me".
- **Supabase Caching**: Recommendation vectors are calculated asynchronously and cached in Supabase with force-refresh support.
- *Note*: As an intentional product decision, recommendations are currently focused exclusively on movies due to curated dataset grounding; TV shows are fully supported for tracking, ratings, watchlists, discovery, and analytics.

### 📊 Gamified Insights & Library Dashboard
- **Interactive Activity Matrix**: 365-day tracking heatmap, active logging streaks, and total screen time calculations.
- **Personal Shelves**: Dual-view management for **Watched History** and **Watchlist Queue** with real-time text search, genre chip filters, and multi-field sorting.
- **Live State Synchronization**: Rate, watch, or watchlist any title from anywhere in the app, and observe immediate badge and border updates across all cards without full-page reloads.
- **Account Settings**: Real-time display name customization, landing tab preferences, and secure session management.

---

## 🏗️ Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19 + Vite)               │
│                                                             │
│   AuthContext ───> TanStack Query ───> UI / Media Cards    │
│   (Supabase Auth)  (Cache & Mutations) (Fluid Design System)│
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Supabase Backend        │ │    FastAPI AI Backend      │
│  - Authentication            │ │  - TF-IDF Vectorizer       │
│  - user_media_preferences    │ │  - Cosine Similarity Model │
│  - user_recommendations      │ │  - Curated Movie Dataset   │
│  - media_items catalog       │ └────────────────────────────┘
└──────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS (Dark Cinematic Design System)
- **State Management**: TanStack Query v5 + React Context
- **Routing & Code Splitting**: React Router v7 with `React.lazy` and `Suspense`
- **Charts & Visualizations**: Recharts
- **Carousels & Icons**: Swiper, React Feather, Lucide
- **Notifications**: React Toastify

### Backend & Machine Learning
- **API Framework**: FastAPI (Python 3.10+)
- **Data & Vector Processing**: Pandas, NumPy, Scikit-Learn (TF-IDF & Cosine Similarity)
- **Database & Auth**: Supabase (PostgreSQL + Row-Level Security)
- **Catalog Metadata**: TMDB API v3

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (for recommendation backend)
- TMDB API key ([themoviedb.org](https://www.themoviedb.org/settings/api))
- Supabase Project ([supabase.com](https://supabase.com))

---

### 1. Database Configuration (Supabase)

Create the required tables in your Supabase SQL editor:

```sql
-- User Media Preferences (Watched, Watchlist, Ratings, Not Interested)
CREATE TABLE user_media_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  media_id BIGINT NOT NULL,
  media_type TEXT NOT NULL, -- 'movie' or 'tv'
  watched BOOLEAN DEFAULT false,
  watchlist BOOLEAN DEFAULT false,
  liked BOOLEAN DEFAULT false,
  not_interested BOOLEAN DEFAULT false,
  rating NUMERIC,
  watched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, media_id, media_type)
);

-- Cached Recommendation Vectors
CREATE TABLE user_recommendations (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendations JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media Catalog Cache (Optional metadata hydration)
CREATE TABLE media_items (
  id BIGINT PRIMARY KEY,
  title TEXT,
  name TEXT,
  poster_path TEXT,
  media_type TEXT,
  release_date TEXT,
  first_air_date TEXT,
  vote_average NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2. Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   npm install
   ```

2. Create `.env` in `frontend/`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_TMDB_API_KEY=your-tmdb-api-key
   VITE_API_BASE_URL=http://127.0.0.1:8000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

### 3. Backend Setup (Recommendation Engine)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Start the FastAPI recommendation server:
   ```bash
   uvicorn app:app --reload --port 8000
   ```

3. Verify health status at `http://127.0.0.1:8000/health`:
   ```json
   {
     "status": "ok",
     "service": "TasteFlicks Recommendation API",
     "version": "2.0.0"
   }
   ```

---

## 🔒 Security & Code Standards

- **Environment Separation**: API keys and database secrets are managed strictly through environment variables.
- **Request Deduplication**: TMDB genres and detail fetches are cached in memory and via TanStack Query to eliminate duplicate API requests.
- **Zero Lint Errors**: Fully compliant with ESLint 9 rules.
- **Optimized Bundles**: Routes are code-split into independent chunks under 330 kB with zero large-bundle warnings.

---

## 📄 License

MIT License. Designed with passion for cinephiles.
