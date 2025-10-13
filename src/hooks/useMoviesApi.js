import { useQuery } from "@tanstack/react-query";
import {
  getPopularMovies,
  getTrendingMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlayingMovies,
} from "../movieAPI";

export function usePopularMovies(page = 1) {
  return useQuery({
    queryKey: ["popular-movies", page],
    queryFn: () => getPopularMovies(page),
    keepPreviousData: true,
  });
}

export function useTrendingMovies(page = 1) {
  return useQuery({
    queryKey: ["trending-movies", page],
    queryFn: () => getTrendingMovies(page),
    keepPreviousData: true,
  });
}

export function useTopRatedMovies(page = 1) {
  return useQuery({
    queryKey: ["top-rated-movies", page],
    queryFn: () => getTopRatedMovies(page),
    keepPreviousData: true,
  });
}

export function useUpcomingMovies(page = 1) {
  return useQuery({
    queryKey: ["upcoming-movies", page],
    queryFn: () => getUpcomingMovies(page),
    keepPreviousData: true,
  });
}

export function useNowPlayingMovies(page = 1) {
  return useQuery({
    queryKey: ["now-playing-movies", page],
    queryFn: () => getNowPlayingMovies(page),
    keepPreviousData: true,
  });
}
