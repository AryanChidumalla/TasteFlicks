import { Calendar, Heart, PlayCircle, Star, TrendingUp } from "react-feather";
import { useState, useEffect } from "react";
import {
  usePopularTVShows,
  useTopRatedTVShows,
  useAiringTodayTVShows,
  useOnTheAirTVShows,
  useTrendingTVShows,
} from "../hooks/useTVShowsApi"; // adjust path
import TVShowCard from "../components/tvShowCard";
import { Black200Button, PrimaryButton } from "../buttons";

const TVSHOW_CATEGORIES = [
  { name: "Popular", icon: Heart, hook: usePopularTVShows },
  { name: "Top Rated", icon: Star, hook: useTopRatedTVShows },
  { name: "Airing Today", icon: Calendar, hook: useAiringTodayTVShows },
  { name: "On The Air", icon: PlayCircle, hook: useOnTheAirTVShows },
  { name: "Trending", icon: TrendingUp, hook: useTrendingTVShows },
];

export default function TVShows() {
  const [category, setCategory] = useState("Popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [shows, setShows] = useState([]);

  const currentCategory = TVSHOW_CATEGORIES.find((c) => c.name === category);

  const { data, isLoading, isFetching } = currentCategory.hook(currentPage);

  // Update shows list when data or page changes
  useEffect(() => {
    if (!data || !data.results) return;

    if (currentPage === 1) {
      // Replace shows on category change or first page
      setShows(data.results);
    } else {
      // Append shows for subsequent pages
      setShows((prev) => [...prev, ...data.results]);
    }
  }, [data, currentPage]);

  const handleCategoryChange = (newCategory) => {
    if (newCategory === category) return; // no change
    setCategory(newCategory);
    setCurrentPage(1);
    setShows([]); // clear shows while loading new category
  };

  const renderButton = ({ name, icon: Icon }) => {
    const ButtonComponent = category === name ? PrimaryButton : Black200Button;
    return (
      <ButtonComponent
        key={name}
        name={name}
        icon={Icon}
        aria-pressed={category === name}
        onClick={() => handleCategoryChange(name)}
      />
    );
  };

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-col gap-6">
        {/* Heading */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-semibold text-white-100">
            TV Shows
          </h1>
          <h2 className="text-base sm:text-lg font-normal text-white-200 mt-2">
            Browse trending and top-rated shows across platforms
          </h2>
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap gap-3 sm:gap-5">
          {TVSHOW_CATEGORIES.map(renderButton)}
        </div>

        {/* Loading State */}
        {isLoading && shows.length === 0 ? (
          <div className="text-white-200 text-center p-10">Loading...</div>
        ) : (
          <>
            {/* Show Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-center">
              {shows.map((show) => (
                <TVShowCard key={show.id} item={show} />
              ))}
            </div>

            {/* Load More Button */}
            <div className="flex justify-center mt-8">
              <Black200Button
                name={isFetching ? "Loading..." : "Load More"}
                onClick={() => {
                  if (!isFetching) setCurrentPage((prev) => prev + 1);
                }}
                disabled={isFetching}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
