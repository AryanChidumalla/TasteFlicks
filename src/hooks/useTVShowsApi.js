import { useQuery } from "@tanstack/react-query";
import {
  getPopularTVShows,
  getTopRatedTVShows,
  getAiringTodayTVShows,
  getOnTheAirTVShows,
  getTrendingTVShows,
} from "../movieAPI"; // adjust path as needed

export const usePopularTVShows = (page = 1) =>
  useQuery({
    queryKey: ["tvshows", "popular", page],
    queryFn: () => getPopularTVShows(page),
    keepPreviousData: true,
  });

export const useTopRatedTVShows = (page = 1) =>
  useQuery({
    queryKey: ["tvshows", "top-rated", page],
    queryFn: () => getTopRatedTVShows(page),
    keepPreviousData: true,
  });

export const useAiringTodayTVShows = (page = 1) =>
  useQuery({
    queryKey: ["tvshows", "airing-today", page],
    queryFn: () => getAiringTodayTVShows(page),
    keepPreviousData: true,
  });

export const useOnTheAirTVShows = (page = 1) =>
  useQuery({
    queryKey: ["tvshows", "on-the-air", page],
    queryFn: () => getOnTheAirTVShows(page),
    keepPreviousData: true,
  });

export const useTrendingTVShows = (page = 1) =>
  useQuery({
    queryKey: ["tvshows", "trending", page],
    queryFn: () => getTrendingTVShows(page),
    keepPreviousData: true,
  });
