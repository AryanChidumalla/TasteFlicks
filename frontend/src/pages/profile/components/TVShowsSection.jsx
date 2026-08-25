import React from "react";
import MediaLibrarySection from "./MediaLibrarySection";

export default function TVShowsSection({
  tv = [],
  watchlistTV = [],
  isLoading = false,
}) {
  return (
    <MediaLibrarySection
      items={tv}
      watchlistItems={watchlistTV}
      isLoading={isLoading}
      mediaType="tv"
    />
  );
}
