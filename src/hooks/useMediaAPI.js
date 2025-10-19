import { useInfiniteQuery } from "@tanstack/react-query";
import { getTrendingMedia } from "../movieAPI";

export function useTrendingMediaInfinite() {
  return useInfiniteQuery({
    queryKey: ["trending-media-infinite"],
    queryFn: ({ pageParam = 1 }) => getTrendingMedia(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
  });
}
