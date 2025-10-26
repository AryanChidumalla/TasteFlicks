// --- API Key ---
export const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// --- Getting Trending Movies and TV Shows ---
export async function getTrendingMedia(page = 1) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}&page=${page}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch trending media:", error);
    return null;
  }
}

// --- Movie Details ---
export async function getMovieDetails(movieId) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch movie details:", error);
    return null;
  }
}

// --- New: Get Movie Videos (Trailers, Teasers, Clips, etc.) ---
export async function getMovieVideos(movieId) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Failed to fetch movie videos:", error);
    return [];
  }
}

// --- New: Get Movie Credits (Cast & Crew) ---
export async function getMovieCredits(movieId) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error("Failed to fetch movie credits:", error);
    return null;
  }
}

// --- New: Get Watch Providers ---
export async function getWatchProviders(movieId) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${API_KEY}`
    );
    const data = await response.json();
    return data.results || null;
  } catch (error) {
    console.error("Failed to fetch watch providers:", error);
    return null;
  }
}

// --- TV Show Details ---
export const getTVShowDetails = async (id) => {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=en-US`
    );
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching TV show details:", err);
    return null;
  }
};

// --- NEW: Get TV Show Videos (Trailers, Teasers, Clips, etc.) ---
export async function getTVShowVideos(tvId) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${tvId}/videos?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Failed to fetch TV show videos:", error);
    return [];
  }
}

// --- NEW: Get TV Show Credits (Cast & Crew) ---
export async function getTVShowCredits(tvId) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${tvId}/aggregate_credits?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();
    // TMDB uses 'aggregate_credits' for TV for better cast/crew data across seasons
    return data || null;
  } catch (error) {
    console.error("Failed to fetch TV show credits:", error);
    return null;
  }
}

// --- NEW: Get TV Show Watch Providers ---
export async function getTVWatchProviders(tvId) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${tvId}/watch/providers?api_key=${API_KEY}`
    );
    const data = await response.json();
    return data.results || null;
  } catch (error) {
    console.error("Failed to fetch TV watch providers:", error);
    return null;
  }
}

// --- Search Movies ---
export const searchMulti = async (query, page = 1) => {
  if (!query)
    return {
      results: [],
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
    };

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(
        query
      )}&page=${page}&language=en-US&include_adult=false`
    );
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    const data = await response.json();

    return {
      results: data.results || [],
      currentPage: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    };
  } catch (error) {
    console.error("Error searching multi:", error);
    return {
      results: [],
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
    };
  }
};

export const searchMovies = async (query, page = 1) => {
  if (!query)
    return {
      results: [],
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
    };

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
        query
      )}&page=${page}&language=en-US&include_adult=false`
    );
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    const data = await response.json();

    return {
      results: data.results || [],
      currentPage: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    };
  } catch (error) {
    console.error("Error searching movies:", error);
    return {
      results: [],
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
    };
  }
};

export const searchTVShows = async (query, page = 1) => {
  if (!query)
    return {
      results: [],
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
    };

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(
        query
      )}&page=${page}&language=en-US&include_adult=false`
    );

    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);

    const data = await response.json();

    return {
      results: data.results || [],
      currentPage: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    };
  } catch (error) {
    console.error("Error searching TV shows:", error);
    return {
      results: [],
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
    };
  }
};

// --- Shared Fetch Helpers ---

const fetchMovies = async (endpoint, page = 1) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/${endpoint}?api_key=${API_KEY}&page=${page}`
    );
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    const data = await response.json();

    return {
      results: data.results || [],
      currentPage: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    };
  } catch (error) {
    console.error(`Error fetching movies from ${endpoint}:`, error);
    return {
      results: [],
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
    };
  }
};

const fetchTVShows = async (endpoint, page = 1) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/${endpoint}?api_key=${API_KEY}&page=${page}`
    );
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    const data = await response.json();

    return {
      results: data.results || [],
      currentPage: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    };
  } catch (error) {
    console.error(`Error fetching TV shows from ${endpoint}:`, error);
    return {
      results: [],
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
    };
  }
};

// --- Movie List Fetch Functions ---

export const getPopularMovies = (page = 1) =>
  fetchMovies("movie/popular", page);

export const getTopRatedMovies = (page = 1) =>
  fetchMovies("movie/top_rated", page);

export const getUpcomingMovies = (page = 1) =>
  fetchMovies("movie/upcoming", page);

export const getNowPlayingMovies = (page = 1) =>
  fetchMovies("movie/now_playing", page);

export const getTrendingMovies = (page = 1) =>
  fetchMovies("trending/movie/week", page);

// --- TV Show List Fetch Functions (updated!) ---

export const getPopularTVShows = (page = 1) => fetchTVShows("tv/popular", page);

export const getTopRatedTVShows = (page = 1) =>
  fetchTVShows("tv/top_rated", page);

export const getAiringTodayTVShows = (page = 1) =>
  fetchTVShows("tv/airing_today", page);

export const getOnTheAirTVShows = (page = 1) =>
  fetchTVShows("tv/on_the_air", page);

export const getTrendingTVShows = (page = 1) =>
  fetchTVShows("trending/tv/week", page);

// --- Genre Fetch Hook (for movies) ---
import { useEffect, useState } from "react";

export function useGenres() {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`
        );
        const data = await res.json();
        setGenres(data.genres);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    }

    fetchGenres();
  }, []);

  return genres;
}

// --- New: Get Similar Movies ---
export async function getSimilarMovies(movieId) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Failed to fetch similar movies:", error);
    return [];
  }
}

// --- New: Get Similar TV Shows ---
export async function getSimilarTVShows(tvId) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${tvId}/similar?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Failed to fetch similar TV shows:", error);
    return [];
  }
}

export async function getDiscoveredMovies({
  page = 1,
  sortBy = "popularity.desc",
  genre = "",
  year = "",
  minRating = "",
  language = "en-US",
} = {}) {
  try {
    const params = new URLSearchParams({
      api_key: API_KEY,
      language,
      sort_by: sortBy,
      page,
    });

    if (genre) params.append("with_genres", genre);
    if (year) params.append("primary_release_year", year);
    if (minRating) params.append("vote_average.gte", minRating);

    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?${params.toString()}`
    );

    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);

    const data = await response.json();
    return {
      results: data.results || [],
      currentPage: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    };
  } catch (error) {
    console.error("Failed to fetch discovered movies:", error);
    return {
      results: [],
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
    };
  }
}

export async function getDiscoveredTVShows({
  page = 1,
  sortBy = "popularity.desc",
  genre = "",
  year = "",
  minRating = "",
  language = "en-US",
} = {}) {
  try {
    const params = new URLSearchParams({
      api_key: API_KEY,
      language,
      sort_by: sortBy,
      page,
    });

    if (genre) params.append("with_genres", genre);
    // Use first_air_date_year for TV shows
    if (year) params.append("first_air_date_year", year);
    if (minRating) params.append("vote_average.gte", minRating);

    const response = await fetch(
      `https://api.themoviedb.org/3/discover/tv?${params.toString()}`
    );

    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);

    const data = await response.json();
    return {
      results: data.results || [],
      currentPage: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    };
  } catch (error) {
    console.error("Failed to fetch discovered TV shows:", error);
    return {
      results: [],
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
    };
  }
}

// Get movies a person has acted in
export const getPersonMovieCredits = async (personId, page = 1) => {
  const res = await fetch(
    `https://api.themoviedb.org/3/person/${personId}/movie_credits?api_key=${API_KEY}&page=${page}`
  );
  const data = await res.json();
  return { results: data.cast, person_name: data.name };
};

// Get TV shows a person has appeared in
export const getPersonTVCredits = async (personId, page = 1) => {
  const res = await fetch(
    `https://api.themoviedb.org/3/person/${personId}/tv_credits?api_key=${API_KEY}&page=${page}`
  );
  const data = await res.json();
  return { results: data.cast, person_name: data.name };
};
