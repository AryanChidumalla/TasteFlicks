import { Calendar, Heart, PlayCircle, Star, TrendingUp } from "react-feather";
import { useEffect, useState } from "react";
import {
  getPopularTVShows,
  getTopRatedTVShows,
  getAiringTodayTVShows,
  getOnTheAirTVShows,
  getTrendingTVShows,
} from "../movieAPI";
import TVShowCard from "../components/tvShowCard";
import { Black200Button, PrimaryButton } from "../buttons";

const TVSHOW_CATEGORIES = [
  { name: "Popular", icon: Heart },
  { name: "Top Rated", icon: Star },
  { name: "Airing Today", icon: Calendar },
  { name: "On The Air", icon: PlayCircle },
  { name: "Trending", icon: TrendingUp },
];

export default function TVShows() {
  const [category, setCategory] = useState("Popular");

  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [airingToday, setAiringToday] = useState([]);
  const [onTheAir, setOnTheAir] = useState([]);
  const [trending, setTrending] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchTVShowsByCategory = (category, page) => {
    switch (category) {
      case "Popular":
        return getPopularTVShows(page);
      case "Top Rated":
        return getTopRatedTVShows(page);
      case "Airing Today":
        return getAiringTodayTVShows(page);
      case "On The Air":
        return getOnTheAirTVShows(page);
      case "Trending":
        return getTrendingTVShows(page);
      default:
        return Promise.resolve({ results: [] });
    }
  };

  // Load first page on category change
  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);
    fetchTVShowsByCategory(category, 1).then((data) => {
      const results = Array.isArray(data?.results) ? data.results : [];
      switch (category) {
        case "Popular":
          setPopular(results);
          break;
        case "Top Rated":
          setTopRated(results);
          break;
        case "Airing Today":
          setAiringToday(results);
          break;
        case "On The Air":
          setOnTheAir(results);
          break;
        case "Trending":
          setTrending(results);
          break;
      }
      setLoading(false);
    });
  }, [category]);

  // Load more on page change (except page 1)
  useEffect(() => {
    if (currentPage === 1) return;

    setLoading(true);
    fetchTVShowsByCategory(category, currentPage).then((data) => {
      const results = Array.isArray(data?.results) ? data.results : [];
      switch (category) {
        case "Popular":
          setPopular((prev) => [...prev, ...results]);
          break;
        case "Top Rated":
          setTopRated((prev) => [...prev, ...results]);
          break;
        case "Airing Today":
          setAiringToday((prev) => [...prev, ...results]);
          break;
        case "On The Air":
          setOnTheAir((prev) => [...prev, ...results]);
          break;
        case "Trending":
          setTrending((prev) => [...prev, ...results]);
          break;
      }
      setLoading(false);
    });
  }, [currentPage, category]);

  const getCurrentTVShowsList = () => {
    switch (category) {
      case "Popular":
        return popular;
      case "Top Rated":
        return topRated;
      case "Airing Today":
        return airingToday;
      case "On The Air":
        return onTheAir;
      case "Trending":
        return trending;
      default:
        return [];
    }
  };

  const currentTVShows = getCurrentTVShowsList();

  const renderButton = ({ name, icon: Icon }) => {
    const ButtonComponent = category === name ? PrimaryButton : Black200Button;
    return (
      <ButtonComponent
        key={name}
        name={name}
        icon={Icon}
        aria-pressed={category === name}
        onClick={() => setCategory(name)}
      />
    );
  };

  if (loading && currentTVShows.length === 0) {
    return <div className="text-white-200 text-center p-10">Loading...</div>;
  }

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-semibold text-white-100">
            TV Shows
          </h1>
          <h2 className="text-base sm:text-lg font-normal text-white-200 mt-2">
            Browse trending and top-rated shows across platforms
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-5">
          {TVSHOW_CATEGORIES.map(renderButton)}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-center">
          {currentTVShows.map((show) => (
            <TVShowCard key={show.id} item={show} />
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Black200Button
            name={loading ? "Loading..." : "Load More"}
            onClick={() => !loading && setCurrentPage((prev) => prev + 1)}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}
