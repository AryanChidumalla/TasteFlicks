import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getPopularTVShows,
  getTopRatedTVShows,
  getAiringTodayTVShows,
  getOnTheAirTVShows,
  getTrendingTVShows,
  getDiscoveredTVShows,
} from "../movieAPI"; // adjust path as needed

export function usePopularTVShowsInfinite() {
  return useInfiniteQuery({
    queryKey: ["popular-tvshows-infinite"],
    queryFn: ({ pageParam = 1 }) => getPopularTVShows(pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
  });
}

export function useTopRatedTVShowsInfinite() {
  return useInfiniteQuery({
    queryKey: ["top-rated-tvshows-infinite"],
    queryFn: ({ pageParam = 1 }) => getTopRatedTVShows(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
  });
}

export function useAiringTodayTVShowsInfinite() {
  return useInfiniteQuery({
    queryKey: ["airing-today-tvshows-infinite"],
    queryFn: ({ pageParam = 1 }) => getAiringTodayTVShows(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
  });
}

export function useOnTheAirTVShowsInfinite() {
  return useInfiniteQuery({
    queryKey: ["on-the-air-tvshows-infinite"],
    queryFn: ({ pageParam = 1 }) => getOnTheAirTVShows(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
  });
}

export function useTrendingTVShowsInfinite() {
  return useInfiniteQuery({
    queryKey: ["trending-tvshows-infinite"],
    queryFn: ({ pageParam = 1 }) => getTrendingTVShows(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
  });
}

export function useDiscoveredTVShowsInfinite(filters = {}) {
  // Assuming useInfiniteQuery is imported from a library like @tanstack/react-query
  return useInfiniteQuery({
    queryKey: ["discovered-tvshows-infinite", filters],
    queryFn: ({ pageParam = 1 }) =>
      getDiscoveredTVShows({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
  });
}
