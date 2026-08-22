import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchCachedRecommendations } from "../pages/recommendations/recommendationCache";
import {
  getTrendingMedia,
  getPopularMovies,
  getTrendingMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlayingMovies,
  getDiscoveredMovies,
  getPopularTVShows,
  getTopRatedTVShows,
  getAiringTodayTVShows,
  getOnTheAirTVShows,
  getTrendingTVShows,
  getDiscoveredTVShows,
} from "../services/tmdb/api";

/**
 * 🔑 Core Generic Infinite Media Query Hook
 */
export function useInfiniteMedia(queryKey, apiFn, filters = null) {
  return useInfiniteQuery({
    queryKey: filters ? [...queryKey, filters] : queryKey,
    queryFn: ({ pageParam = 1 }) =>
      filters ? apiFn({ ...filters, page: pageParam }) : apiFn(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage?.currentPage < lastPage?.totalPages
        ? lastPage.currentPage + 1
        : undefined,
  });
}

// 🎬 --- MOVIE HOOKS ---
export const usePopularMoviesInfinite = () =>
  useInfiniteMedia(["popular-movies-infinite"], getPopularMovies);
export const useTrendingMoviesInfinite = () =>
  useInfiniteMedia(["trending-movies-infinite"], getTrendingMovies);
export const useTopRatedMoviesInfinite = () =>
  useInfiniteMedia(["top-rated-movies-infinite"], getTopRatedMovies);
export const useUpcomingMoviesInfinite = () =>
  useInfiniteMedia(["upcoming-movies-infinite"], getUpcomingMovies);
export const useNowPlayingMoviesInfinite = () =>
  useInfiniteMedia(["now-playing-movies-infinite"], getNowPlayingMovies);
export const useDiscoveredMoviesInfinite = (filters = {}) =>
  useInfiniteMedia(
    ["discovered-movies-infinite"],
    getDiscoveredMovies,
    filters,
  );

// 📺 --- TV SHOW HOOKS ---
export const usePopularTVShowsInfinite = () =>
  useInfiniteMedia(["popular-tvshows-infinite"], getPopularTVShows);
export const useTopRatedTVShowsInfinite = () =>
  useInfiniteMedia(["top-rated-tvshows-infinite"], getTopRatedTVShows);
export const useAiringTodayTVShowsInfinite = () =>
  useInfiniteMedia(["airing-today-tvshows-infinite"], getAiringTodayTVShows);
export const useOnTheAirTVShowsInfinite = () =>
  useInfiniteMedia(["on-the-air-tvshows-infinite"], getOnTheAirTVShows);
export const useTrendingTVShowsInfinite = () =>
  useInfiniteMedia(["trending-tvshows-infinite"], getTrendingTVShows);
export const useDiscoveredTVShowsInfinite = (filters = {}) =>
  useInfiniteMedia(
    ["discovered-tvshows-infinite"],
    getDiscoveredTVShows,
    filters,
  );

// 🌐 --- MIXED/GLOBAL HOOKS ---
export const useTrendingMediaInfinite = () =>
  useInfiniteMedia(["trending-media-infinite"], getTrendingMedia);

export function useRecommendedMovies(userId) {
  return useQuery({
    queryKey: ["recommended-movies", userId],
    queryFn: () => fetchCachedRecommendations(userId),
    enabled: !!userId,
  });
}
