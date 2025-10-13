import { useSelector } from "react-redux";
import { useState, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getMediaByPreference } from "../supabasePreferences";
import { getMovieDetails } from "../movieAPI";
import MediaCard from "./MediaCard";
import { useNavigate } from "react-router-dom";
import { Black200Button, PrimaryButton } from "../buttons";

export default function MoviesSection() {
  const user = useSelector((state) => state.user.user);
  const exploredGenres = useSelector((state) => state.user.data.movieGenres);
  const userId = user?.id;
  const navigate = useNavigate();

  const [sortOption, setSortOption] = useState("release");
  const [genreFilter, setGenreFilter] = useState("All");
  const [showDisliked, setShowDisliked] = useState(false);

  // Helper to fetch paginated movies by type
  const fetchMoviesPage =
    (type) =>
    async ({ pageParam = 0 }) => {
      const ids = await getMediaByPreference(userId, type, "movie");
      const pageSize = 10;
      const pageIds = ids.slice(pageParam, pageParam + pageSize);
      const movies = await Promise.all(pageIds.map(getMovieDetails));
      return {
        movies,
        nextPage:
          pageParam + pageSize < ids.length ? pageParam + pageSize : undefined,
      };
    };

  // Queries
  const {
    data: likedData,
    fetchNextPage: fetchNextLiked,
    hasNextPage: hasNextLiked,
    isFetchingNextPage: isFetchingLiked,
    isLoading: isLoadingLiked,
    error: errorLiked,
  } = useInfiniteQuery({
    queryKey: ["likedMovies", userId],
    queryFn: fetchMoviesPage("like"),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!userId,
  });

  const {
    data: dislikedData,
    fetchNextPage: fetchNextDisliked,
    hasNextPage: hasNextDisliked,
    isFetchingNextPage: isFetchingDisliked,
    isLoading: isLoadingDisliked,
    error: errorDisliked,
  } = useInfiniteQuery({
    queryKey: ["dislikedMovies", userId],
    queryFn: fetchMoviesPage("dislike"),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!userId,
  });

  // Flatten pages
  const likedMovies = likedData?.pages.flatMap((page) => page.movies) || [];
  const dislikedMovies =
    dislikedData?.pages.flatMap((page) => page.movies) || [];

  const allMovies = showDisliked ? dislikedMovies : likedMovies;

  const genreCount = useMemo(() => {
    return allMovies.reduce((acc, movie) => {
      movie.genres?.forEach((genre) => {
        acc[genre.name] = (acc[genre.name] || 0) + 1;
      });
      return acc;
    }, {});
  }, [allMovies]);

  const filteredAndSortedMovies = useMemo(() => {
    let filtered =
      genreFilter === "All"
        ? allMovies
        : allMovies.filter((movie) =>
            movie.genres?.some((g) => g.name === genreFilter)
          );

    switch (sortOption) {
      case "release":
        return filtered.sort((a, b) =>
          (b.release_date || "").localeCompare(a.release_date || "")
        );
      case "rating":
        return filtered.sort(
          (a, b) => (b.vote_average || 0) - (a.vote_average || 0)
        );
      case "title":
        return filtered.sort((a, b) =>
          (a.title || "").localeCompare(b.title || "")
        );
      default:
        return filtered;
    }
  }, [allMovies, genreFilter, sortOption]);

  const handleMovieClick = (id) => navigate(`/movie/${id}`);

  if (isLoadingLiked || isLoadingDisliked)
    return <div className="text-white-300">Loading...</div>;
  if (errorLiked || errorDisliked)
    return <div className="text-white-300">Error loading movies</div>;

  return (
    <section className="p-6 md:p-10">
      <h1 className="text-3xl font-semibold text-white-100 mb-6">
        Your Movies
      </h1>

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

      {/* Genres */}
      <GenreChips title="Movies Explored" genreMap={exploredGenres} />

      {/* Toggle Liked / Disliked */}
      <div className="flex justify-end mb-10 gap-2">
        {/* Liked Button */}
        {showDisliked ? (
          <Black200Button onClick={() => setShowDisliked(false)} name="Liked" />
        ) : (
          <PrimaryButton onClick={() => setShowDisliked(false)} name="Liked" />
        )}

        {/* Disliked Button */}
        {showDisliked ? (
          <PrimaryButton
            onClick={() => setShowDisliked(true)}
            name="Disliked"
          />
        ) : (
          <Black200Button
            onClick={() => setShowDisliked(true)}
            name="Disliked"
          />
        )}
      </div>

      {/* Movie Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {filteredAndSortedMovies.map((movie) => (
          <MediaCard
            key={movie.id}
            media={movie}
            onClick={() => handleMovieClick(movie.id)}
          />
        ))}
      </div>

      {/* Load More */}
      {showDisliked && hasNextDisliked && (
        <div className="mt-4 flex justify-center">
          <Black200Button
            name={isFetchingDisliked ? "Loading..." : "Load More"}
            onClick={fetchNextDisliked}
          />
        </div>
      )}
      {!showDisliked && hasNextLiked && (
        <div className="mt-4 flex justify-center">
          <Black200Button
            name={isFetchingLiked ? "Loading..." : "Load More"}
            onClick={fetchNextLiked}
          />
        </div>
      )}
    </section>
  );
}

function GenreChips({ title, genreMap }) {
  if (!genreMap || Object.keys(genreMap).length === 0)
    return (
      <div>
        <h2 className="text-xl font-semibold text-white-100 mb-2">{title}</h2>
        <p className="text-white-300 mb-4">No genres explored yet.</p>
      </div>
    );

  return (
    <div>
      <h2 className="text-xl font-semibold text-white-100 mb-2">{title}</h2>
      <div className="flex flex-wrap gap-2 mb-6 max-w-full">
        {Object.entries(genreMap).map(([genre, count]) => (
          <span
            key={genre}
            className="bg-black-200 border border-black-300 text-white-100 px-3 py-1 rounded-full text-sm"
          >
            {genre}: {count}
          </span>
        ))}
      </div>
    </div>
  );
}
