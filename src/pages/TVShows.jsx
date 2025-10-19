import { Calendar, Heart, PlayCircle, Star, TrendingUp } from "react-feather";
import { useSearchParams } from "react-router-dom";
import {
  usePopularTVShowsInfinite,
  useTopRatedTVShowsInfinite,
  useAiringTodayTVShowsInfinite,
  useOnTheAirTVShowsInfinite,
  useTrendingTVShowsInfinite,
} from "../hooks/useTVShowsApi";
import { Black200Button, PrimaryButton } from "../buttons";
import TVShowCard from "../components/tvShowCard";

const TVSHOW_CATEGORIES = [
  { name: "Popular", icon: Heart, hook: usePopularTVShowsInfinite },
  { name: "Top Rated", icon: Star, hook: useTopRatedTVShowsInfinite },
  { name: "Airing Today", icon: Calendar, hook: useAiringTodayTVShowsInfinite },
  { name: "On The Air", icon: PlayCircle, hook: useOnTheAirTVShowsInfinite },
  { name: "Trending", icon: TrendingUp, hook: useTrendingTVShowsInfinite },
];

export default function TVShows() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "Popular";

  const currentCategory = TVSHOW_CATEGORIES.find((c) => c.name === category);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = currentCategory.hook();

  const shows = data?.pages.flatMap((page) => page.results) || [];

  const handleCategoryChange = (newCategory) => {
    if (newCategory === category) return;
    setSearchParams({ category: newCategory });
    refetch();
  };

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-col gap-6">
        {/* 📺 PAGE HEADER */}
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl sm:text-5xl font-semibold text-white-100">
            TV Shows
          </h1>
          <h2 className="text-base sm:text-lg font-normal text-white-200">
            Discover the latest and trending TV shows across platforms
          </h2>
        </div>

        {/* 🎯 CATEGORY BUTTONS */}
        <div className="flex flex-wrap gap-3 sm:gap-5">
          {TVSHOW_CATEGORIES.map(({ name, icon }) => {
            const ButtonComponent =
              category === name ? PrimaryButton : Black200Button;
            return (
              <ButtonComponent
                key={name}
                name={name}
                icon={icon}
                aria-pressed={category === name}
                onClick={() => handleCategoryChange(name)}
              />
            );
          })}
        </div>

        {/* 📺 TV SHOW LIST */}
        {isLoading ? (
          <div className="text-center text-white-200 mt-10">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-center">
              {shows.map((show) => (
                <TVShowCard key={show.id} item={show} />
              ))}
            </div>

            {hasNextPage && (
              <div className="flex justify-center mt-8">
                <Black200Button
                  name={isFetchingNextPage ? "Loading..." : "Load More"}
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
