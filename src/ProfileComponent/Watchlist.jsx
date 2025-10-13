import { useSelector } from "react-redux";
import { useState, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getMediaByPreference,
  removeFromWatchlist,
} from "../supabasePreferences";
import { getMovieDetails, getTVShowDetails } from "../movieAPI";
import MediaCard from "./MediaCard";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Black200Button, PrimaryButton } from "../buttons";

export default function Watchlist() {
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;
  const navigate = useNavigate();

  const [showTV, setShowTV] = useState(false);
  const [sortOption, setSortOption] = useState("release");
  const [genreFilter, setGenreFilter] = useState("All");

  // Fetch paginated media helper
  const fetchMediaPage =
    (type) =>
    async ({ pageParam = 0 }) => {
      const ids = await getMediaByPreference(userId, "watchlist", type);
      const pageSize = 10;
      const pageIds = ids.slice(pageParam, pageParam + pageSize);
      const media =
        type === "movie"
          ? await Promise.all(pageIds.map(getMovieDetails))
          : await Promise.all(pageIds.map(getTVShowDetails));
      return {
        media,
        nextPage:
          pageParam + pageSize < ids.length ? pageParam + pageSize : undefined,
      };
    };

  // Queries
  const {
    data: movieData,
    fetchNextPage: fetchNextMovies,
    hasNextPage: hasNextMovies,
    isFetchingNextPage: isFetchingMovies,
    isLoading: isLoadingMovies,
    error: errorMovies,
  } = useInfiniteQuery({
    queryKey: ["watchlistMovies", userId],
    queryFn: fetchMediaPage("movie"),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!userId,
  });

  const {
    data: tvData,
    fetchNextPage: fetchNextTV,
    hasNextPage: hasNextTV,
    isFetchingNextPage: isFetchingTV,
    isLoading: isLoadingTV,
    error: errorTV,
  } = useInfiniteQuery({
    queryKey: ["watchlistTV", userId],
    queryFn: fetchMediaPage("tv"),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!userId,
  });

  const movies = movieData?.pages.flatMap((page) => page.media) || [];
  const tvShows = tvData?.pages.flatMap((page) => page.media) || [];

  const currentMedia = showTV ? tvShows : movies;

  // Genre count for filtering
  const genreCount = useMemo(() => {
    return currentMedia.reduce((acc, item) => {
      item.genres?.forEach((g) => {
        acc[g.name] = (acc[g.name] || 0) + 1;
      });
      return acc;
    }, {});
  }, [currentMedia]);

  const filteredAndSortedMedia = useMemo(() => {
    let filtered =
      genreFilter === "All"
        ? currentMedia
        : currentMedia.filter((item) =>
            item.genres?.some((g) => g.name === genreFilter)
          );

    switch (sortOption) {
      case "release":
        return filtered.sort((a, b) =>
          (b.release_date || b.first_air_date || "").localeCompare(
            a.release_date || a.first_air_date || ""
          )
        );
      case "rating":
        return filtered.sort(
          (a, b) => (b.vote_average || 0) - (a.vote_average || 0)
        );
      case "title":
        return filtered.sort((a, b) =>
          (a.title || a.name || "").localeCompare(b.title || b.name || "")
        );
      default:
        return filtered;
    }
  }, [currentMedia, genreFilter, sortOption]);

  const handleRemove = async (id, type) => {
    try {
      await removeFromWatchlist(userId, id, type);
      toast.success("Removed from watchlist");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const handleCardClick = (id, type) => {
    navigate(type === "movie" ? `/movie/${id}` : `/tv/${id}`);
  };

  if (isLoadingMovies || isLoadingTV)
    return <div className="text-white-300">Loading...</div>;
  if (errorMovies || errorTV)
    return <div className="text-white-300">Error loading watchlist</div>;

  return (
    <section className="p-6 md:p-10">
      <h1 className="text-3xl font-semibold text-white-100 mb-6">
        Your Watchlist
      </h1>

      {/* Toggle Movies / TV */}
      <div className="flex gap-2 mb-4">
        {showTV ? (
          <>
            <Black200Button onClick={() => setShowTV(false)} name="Movies" />
            <PrimaryButton onClick={() => setShowTV(true)} name="TV Shows" />
          </>
        ) : (
          <>
            <PrimaryButton onClick={() => setShowTV(false)} name="Movies" />
            <Black200Button onClick={() => setShowTV(true)} name="TV Shows" />
          </>
        )}
      </div>

      {/* Sorting & Filtering */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="bg-black-200 text-white-100 p-2 rounded border border-black-300"
        >
          <option value="release">Release Date</option>
          <option value="rating">Rating</option>
          <option value="title">Title</option>
        </select>

        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="bg-black-200 text-white-100 p-2 rounded border border-black-300"
        >
          <option value="All">All Genres</option>
          {Object.keys(genreCount).map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      {/* Media Grid */}
      {filteredAndSortedMedia.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {filteredAndSortedMedia.map((item) => (
            <MediaCard
              key={item.id}
              media={item}
              onClick={() => handleCardClick(item.id, showTV ? "tv" : "movie")}
              showRemoveButton={true}
              onRemove={() => handleRemove(item.id, showTV ? "tv" : "movie")}
            />
          ))}
        </div>
      ) : (
        <p className="text-white-300">Your watchlist is empty.</p>
      )}

      {/* Load More */}
      {showTV && hasNextTV && (
        <div className="mt-4 flex justify-center">
          <Black200Button
            name={isFetchingTV ? "Loading..." : "Load More"}
            onClick={fetchNextTV}
          />
        </div>
      )}
      {!showTV && hasNextMovies && (
        <div className="mt-4 flex justify-center">
          <Black200Button
            name={isFetchingMovies ? "Loading..." : "Load More"}
            onClick={fetchNextMovies}
          />
        </div>
      )}
    </section>
  );
}
