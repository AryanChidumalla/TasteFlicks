import React from "react";
import MediaLibrarySection from "./MediaLibrarySection";

export default function MoviesSection({
  movies = [],
  watchlistMovies = [],
  isLoading = false,
}) {
  return (
    <MediaLibrarySection
      items={movies}
      watchlistItems={watchlistMovies}
      isLoading={isLoading}
      mediaType="movie"
    />
  );
}
