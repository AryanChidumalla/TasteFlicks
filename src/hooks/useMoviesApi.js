import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getPopularMovies,
  getTrendingMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlayingMovies,
} from "../movieAPI";

export function usePopularMoviesInfinite() {
  return useInfiniteQuery({
    queryKey: ["popular-movies-infinite"],
    queryFn: ({ pageParam = 1 }) => getPopularMovies(pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
  });
}

export function useTrendingMoviesInfinite() {
  return useInfiniteQuery({
    queryKey: ["trending-movies-infinite"],
    queryFn: ({ pageParam = 1 }) => getTrendingMovies(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
  });
}

export function useTopRatedMoviesInfinite() {
  return useInfiniteQuery({
    queryKey: ["top-rated-movies-infinite"],
    queryFn: ({ pageParam = 1 }) => getTopRatedMovies(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
  });
}

export function useUpcomingMoviesInfinite() {
  return useInfiniteQuery({
    queryKey: ["upcoming-movies-infinite"],
    queryFn: ({ pageParam = 1 }) => getUpcomingMovies(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
  });
}

export function useNowPlayingMoviesInfinite() {
  return useInfiniteQuery({
    queryKey: ["now-playing-movies-infinite"],
    queryFn: ({ pageParam = 1 }) => getNowPlayingMovies(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
  });
}
