import React from "react";
import MediaLibrarySection from "./MediaLibrarySection";

export default function TVShowsSection({
  shows = [],
  watchlistShows = [],
  isLoading = false,
}) {
  return (
    <MediaLibrarySection
      items={shows}
      watchlistItems={watchlistShows}
      isLoading={isLoading}
      mediaType="tv"
    />
  );
}
