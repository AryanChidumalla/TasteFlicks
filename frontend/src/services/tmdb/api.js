import { useEffect, useState } from "react";

export const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// --- Shared Base Fetch Helper ---
const tmdbFetch = async (endpoint, params = {}, fallbackValue = null) => {
  try {
    const urlParams = new URLSearchParams({ api_key: API_KEY, ...params });
    const response = await fetch(
      `${BASE_URL}/${endpoint}?${urlParams.toString()}`,
    );

    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    return fallbackValue;
  }
};

// --- Standardized Pagination Helper ---
const fetchPaginatedMedia = async (endpoint, page = 1, extraParams = {}) => {
  const data = await tmdbFetch(
    endpoint,
    { page, ...extraParams },
    { results: [], page: 1, total_pages: 1, total_results: 0 },
  );
  return {
    results: data.results || [],
    currentPage: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
};

// --- Media Information ---
export const getTrendingMedia = (page = 1) =>
  fetchPaginatedMedia("trending/all/week", page);
export const getMovieDetails = (movieId) =>
  tmdbFetch(`movie/${movieId}`, { language: "en-US" });
export const getMovieVideos = async (movieId) =>
  (await tmdbFetch(`movie/${movieId}/videos`, { language: "en-US" }))
    ?.results || [];
export const getMovieCredits = (movieId) =>
  tmdbFetch(`movie/${movieId}/credits`, { language: "en-US" });
export const getWatchProviders = async (movieId) =>
  (await tmdbFetch(`movie/${movieId}/watch/providers`))?.results || null;

export const getTVShowDetails = (id) =>
  tmdbFetch(`tv/${id}`, { language: "en-US" });
export const getTVShowVideos = async (tvId) =>
  (await tmdbFetch(`tv/${tvId}/videos`, { language: "en-US" }))?.results || [];
export const getTVShowCredits = (tvId) =>
  tmdbFetch(`tv/${tvId}/aggregate_credits`, { language: "en-US" });
export const getTVWatchProviders = async (tvId) =>
  (await tmdbFetch(`tv/${tvId}/watch/providers`))?.results || null;

// --- Lists & Categories ---
export const getPopularMovies = (page = 1) =>
  fetchPaginatedMedia("movie/popular", page);
export const getTopRatedMovies = (page = 1) =>
  fetchPaginatedMedia("movie/top_rated", page);
export const getUpcomingMovies = (page = 1) =>
  fetchPaginatedMedia("movie/upcoming", page);
export const getNowPlayingMovies = (page = 1) =>
  fetchPaginatedMedia("movie/now_playing", page);
export const getTrendingMovies = (page = 1) =>
  fetchPaginatedMedia("trending/movie/week", page);

export const getPopularTVShows = (page = 1) =>
  fetchPaginatedMedia("tv/popular", page);
export const getTopRatedTVShows = (page = 1) =>
  fetchPaginatedMedia("tv/top_rated", page);
export const getAiringTodayTVShows = (page = 1) =>
  fetchPaginatedMedia("tv/airing_today", page);
export const getOnTheAirTVShows = (page = 1) =>
  fetchPaginatedMedia("tv/on_the_air", page);
export const getTrendingTVShows = (page = 1) =>
  fetchPaginatedMedia("trending/tv/week", page);

export const getSimilarMovies = async (movieId) =>
  (await tmdbFetch(`movie/${movieId}/similar`, { language: "en-US" }))
    ?.results || [];
export const getSimilarTVShows = async (tvId) =>
  (await tmdbFetch(`tv/${tvId}/similar`, { language: "en-US" }))?.results || [];

// --- Reviews (Migrated from components/apiHandling) ---
export const getMovieReviews = async (id) =>
  (await tmdbFetch(`movie/${id}/reviews`))?.results || [];
export const getTVReviews = async (id) =>
  (await tmdbFetch(`tv/${id}/reviews`))?.results || [];

// --- Search Endpoints ---
export const searchMovies = (query, page = 1) =>
  query
    ? fetchPaginatedMedia("search/movie", page, {
        query,
        language: "en-US",
        include_adult: false,
      })
    : { results: [], currentPage: 1, totalPages: 1, totalResults: 0 };
export const searchTVShows = (query, page = 1) =>
  query
    ? fetchPaginatedMedia("search/tv", page, {
        query,
        language: "en-US",
        include_adult: false,
      })
    : { results: [], currentPage: 1, totalPages: 1, totalResults: 0 };

export const searchMulti = async (query, page = 1) => {
  if (!query)
    return { results: [], currentPage: 1, totalPages: 1, totalResults: 0 };

  const data = await tmdbFetch("search/multi", {
    query,
    page,
    language: "en-US",
    include_adult: false,
  });
  if (!data)
    return { results: [], currentPage: 1, totalPages: 1, totalResults: 0 };

  const filtered = (data.results || []).filter(
    (item) => item.media_type === "movie" || item.media_type === "tv",
  );
  const normalized = filtered.map((item) => ({
    ...item,
    displayTitle: item.title || item.name,
    displayDate: item.release_date || item.first_air_date,
  }));

  const sorted = normalized.sort((a, b) => {
    if (a.displayTitle?.toLowerCase() === query.toLowerCase()) return -1;
    if (b.displayTitle?.toLowerCase() === query.toLowerCase()) return 1;
    return (b.popularity || 0) - (a.popularity || 0);
  });

  return {
    results: sorted,
    currentPage: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
};

// --- Discovery ---
export const getDiscoveredMovies = ({
  page = 1,
  sortBy = "popularity.desc",
  genre = "",
  year = "",
  minRating = "",
  language = "en-US",
} = {}) => {
  const params = { language, sort_by: sortBy };
  if (genre) params.with_genres = genre;
  if (year) params.primary_release_year = year;
  if (minRating) params.vote_average = minRating;
  return fetchPaginatedMedia("discover/movie", page, params);
};

export const getDiscoveredTVShows = ({
  page = 1,
  sortBy = "popularity.desc",
  genre = "",
  year = "",
  minRating = "",
  language = "en-US",
} = {}) => {
  const params = { language, sort_by: sortBy };
  if (genre) params.with_genres = genre;
  if (year) params.first_air_date_year = year;
  if (minRating) params.vote_average = minRating;
  return fetchPaginatedMedia("discover/tv", page, params);
};

// --- Person Credits ---
export const getPersonMovieCredits = async (personId, page = 1) => {
  const data = await tmdbFetch(`person/${personId}/movie_credits`, { page });
  return { results: data?.cast || [], person_name: data?.name };
};

export const getPersonTVCredits = async (personId, page = 1) => {
  const data = await tmdbFetch(`person/${personId}/tv_credits`, { page });
  return { results: data?.cast || [], person_name: data?.name };
};

// --- Custom Hooks ---
export function useGenres() {
  const [genres, setGenres] = useState([]);
  useEffect(() => {
    tmdbFetch("genre/movie/list").then(
      (data) => data && setGenres(data.genres),
    );
  }, []);
  return genres;
}
